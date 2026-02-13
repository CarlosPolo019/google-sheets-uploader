// Main client
export { GoogleSheetsUploader } from './client.js';

// Types
export type {
  UploaderConfig,
  UploadOptions,
  ReadOptions,
  BatchOperation,
  ProgressEvent,
  SpreadsheetInfo,
  SheetInfo,
  InputData,
  CellValue,
  UploadMode,
  LogLevel,
  Credentials,
  ServiceAccountCredentials,
} from './types.js';

// Errors
export {
  UploaderError,
  AuthenticationError,
  SheetNotFoundError,
  ValidationError,
  RateLimitError,
  ParseError,
} from './errors.js';

// Parsers (for advanced use)
export { parseExcel } from './parsers/excel.js';
export { parseCSV } from './parsers/csv.js';
export { parseJSON } from './parsers/json.js';

// Legacy API — backwards compatible with v1.x
import { google } from 'googleapis';
import { authenticate } from './auth.js';
import { uploadData } from './operations/upload.js';

/**
 * @deprecated Use `new GoogleSheetsUploader(config)` instead.
 * Legacy function for backwards compatibility with v1.x.
 */
export async function uploadToGoogleSheets(
  credentialsPath: string,
  spreadsheetId: string,
  sheetName: string,
  filePathOrJson: string | Record<string, unknown>[],
): Promise<void> {
  const auth = await authenticate(credentialsPath);
  const sheets = google.sheets({ version: 'v4', auth: auth as any });

  await uploadData(sheets, spreadsheetId, {
    sheet: sheetName,
    data: filePathOrJson,
    mode: 'replace',
  });
}
