import { google, type sheets_v4 } from 'googleapis';
import { authenticate } from './auth.js';
import { uploadData } from './operations/upload.js';
import { readSheet } from './operations/read.js';
import { clearSheet } from './operations/clear.js';
import { batchUpload } from './operations/batch.js';
import { withRetry } from './utils/retry.js';
import { RateLimiter } from './utils/rate-limiter.js';
import { Logger } from './utils/logger.js';
import { validateConfig, validateUploadOptions, validateReadOptions, validateBatchOperations } from './utils/validation.js';
import type {
  UploaderConfig,
  UploadOptions,
  ReadOptions,
  BatchOperation,
  SpreadsheetInfo,
} from './types.js';

export class GoogleSheetsUploader {
  private readonly config: Required<
    Pick<UploaderConfig, 'retries' | 'retryDelay' | 'maxRequestsPerMinute' | 'logLevel'>
  > & UploaderConfig;
  private readonly logger: Logger;
  private readonly rateLimiter: RateLimiter;
  private sheetsClient: sheets_v4.Sheets | null = null;

  constructor(config: UploaderConfig) {
    validateConfig(config);

    this.config = {
      ...config,
      retries: config.retries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      maxRequestsPerMinute: config.maxRequestsPerMinute ?? 60,
      logLevel: config.logLevel ?? 'info',
    };

    this.logger = new Logger(this.config.logLevel);
    this.rateLimiter = new RateLimiter(this.config.maxRequestsPerMinute);
  }

  private async getSheets(): Promise<sheets_v4.Sheets> {
    if (this.sheetsClient) return this.sheetsClient;

    this.logger.debug('Authenticating with Google...');
    const auth = await authenticate(this.config.credentials);
    this.sheetsClient = google.sheets({ version: 'v4', auth: auth as any });
    this.logger.debug('Authentication successful.');
    return this.sheetsClient;
  }

  private async withRetryAndRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    return withRetry(
      async () => {
        await this.rateLimiter.acquire();
        return fn();
      },
      {
        retries: this.config.retries,
        delay: this.config.retryDelay,
      },
    );
  }

  /**
   * Upload data to a Google Sheet.
   *
   * @example
   * // Upload JSON data
   * await uploader.upload({ sheet: 'Sheet1', data: [{ name: 'Alice', age: 30 }] });
   *
   * // Upload Excel file
   * await uploader.upload({ sheet: 'Sheet1', data: './data.xlsx' });
   *
   * // Append data
   * await uploader.upload({ sheet: 'Sheet1', data: myData, mode: 'append' });
   */
  async upload(options: UploadOptions): Promise<void> {
    validateUploadOptions(options);
    const sheets = await this.getSheets();

    this.logger.info(`Uploading to "${options.sheet}" (mode: ${options.mode ?? 'replace'})...`);

    await this.withRetryAndRateLimit(() =>
      uploadData(sheets, this.config.spreadsheetId, options),
    );

    this.logger.info(`Upload to "${options.sheet}" complete.`);
  }

  /**
   * Read data from a Google Sheet.
   *
   * @example
   * const data = await uploader.read({ sheet: 'Sheet1' });
   * const partial = await uploader.read({ sheet: 'Sheet1', range: 'A1:D10' });
   */
  async read(options: ReadOptions): Promise<string[][]> {
    validateReadOptions(options);
    const sheets = await this.getSheets();

    this.logger.info(`Reading from "${options.sheet}"${options.range ? ` range "${options.range}"` : ''}...`);

    const result = await this.withRetryAndRateLimit(() =>
      readSheet(sheets, this.config.spreadsheetId, options),
    );

    this.logger.info(`Read ${result.length} row(s) from "${options.sheet}".`);
    return result;
  }

  /**
   * Clear all data from a sheet.
   *
   * @example
   * await uploader.clear('Sheet1');
   */
  async clear(sheetName: string): Promise<void> {
    const sheets = await this.getSheets();
    this.logger.info(`Clearing sheet "${sheetName}"...`);

    await this.withRetryAndRateLimit(() =>
      clearSheet(sheets, this.config.spreadsheetId, sheetName),
    );

    this.logger.info(`Sheet "${sheetName}" cleared.`);
  }

  /**
   * Upload data to multiple sheets in a single call.
   *
   * @example
   * await uploader.batch([
   *   { sheet: 'Users', data: users },
   *   { sheet: 'Orders', data: orders, mode: 'append' },
   * ]);
   */
  async batch(operations: BatchOperation[]): Promise<void> {
    validateBatchOperations(operations);
    const sheets = await this.getSheets();

    await this.withRetryAndRateLimit(() =>
      batchUpload(sheets, this.config.spreadsheetId, operations, this.logger),
    );
  }

  /**
   * Get spreadsheet metadata (title, sheets, dimensions).
   *
   * @example
   * const info = await uploader.getSpreadsheetInfo();
   * console.log(info.title, info.sheets);
   */
  async getSpreadsheetInfo(): Promise<SpreadsheetInfo> {
    const sheets = await this.getSheets();

    const response = await this.withRetryAndRateLimit(() =>
      sheets.spreadsheets.get({ spreadsheetId: this.config.spreadsheetId }),
    );

    const data = response.data;
    return {
      spreadsheetId: data.spreadsheetId ?? this.config.spreadsheetId,
      title: data.properties?.title ?? '',
      locale: data.properties?.locale ?? '',
      sheets: (data.sheets ?? []).map(s => ({
        sheetId: s.properties?.sheetId ?? 0,
        title: s.properties?.title ?? '',
        rowCount: s.properties?.gridProperties?.rowCount ?? 0,
        columnCount: s.properties?.gridProperties?.columnCount ?? 0,
      })),
    };
  }
}
