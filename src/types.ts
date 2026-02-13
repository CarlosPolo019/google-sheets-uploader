/** Credentials can be a file path, a parsed credentials object, or a pre-configured auth instance */
export type Credentials = string | ServiceAccountCredentials | { getClient(): Promise<unknown> };

export interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  [key: string]: unknown;
}

export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

export interface UploaderConfig {
  /** Path to credentials.json, credentials object, or GoogleAuth instance */
  credentials: Credentials;
  /** Google Spreadsheet ID */
  spreadsheetId: string;
  /** Number of retry attempts for failed API calls (default: 3) */
  retries?: number;
  /** Initial delay in ms before first retry (default: 1000) */
  retryDelay?: number;
  /** Max requests per minute to Google API (default: 60) */
  maxRequestsPerMinute?: number;
  /** Logging level (default: 'info') */
  logLevel?: LogLevel;
}

export type UploadMode = 'replace' | 'append';

export type InputData = string | Record<string, unknown>[] | CellValue[][];

export type CellValue = string | number | boolean | null | undefined | Date;

export interface UploadOptions {
  /** Sheet name to upload to */
  sheet: string;
  /** Data source: file path (.xlsx, .csv), JSON array, or 2D array */
  data: InputData;
  /** Upload mode: 'replace' clears sheet first, 'append' adds after existing data (default: 'replace') */
  mode?: UploadMode;
  /** Starting cell for upload in A1 notation (default: 'A1') */
  startCell?: string;
  /** Whether to include headers from JSON data (default: true) */
  includeHeaders?: boolean;
  /** Progress callback */
  onProgress?: (event: ProgressEvent) => void;
}

export interface ReadOptions {
  /** Sheet name to read from */
  sheet: string;
  /** Range in A1 notation (e.g., 'A1:D10'). If omitted, reads entire sheet */
  range?: string;
}

export interface BatchOperation {
  /** Sheet name */
  sheet: string;
  /** Data to upload */
  data: InputData;
  /** Upload mode (default: 'replace') */
  mode?: UploadMode;
  /** Include headers (default: true) */
  includeHeaders?: boolean;
}

export interface ProgressEvent {
  /** Current phase */
  phase: 'parsing' | 'clearing' | 'uploading' | 'complete';
  /** Progress percentage (0-100) */
  percent: number;
  /** Total rows being processed */
  totalRows: number;
  /** Rows processed so far */
  processedRows: number;
}

export interface SpreadsheetInfo {
  /** Spreadsheet ID */
  spreadsheetId: string;
  /** Spreadsheet title */
  title: string;
  /** Locale */
  locale: string;
  /** List of sheets */
  sheets: SheetInfo[];
}

export interface SheetInfo {
  /** Sheet ID */
  sheetId: number;
  /** Sheet title */
  title: string;
  /** Number of rows */
  rowCount: number;
  /** Number of columns */
  columnCount: number;
}
