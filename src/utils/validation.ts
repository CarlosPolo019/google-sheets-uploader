import { ValidationError } from '../errors.js';
import type { UploaderConfig, UploadOptions, ReadOptions, BatchOperation } from '../types.js';

export function validateConfig(config: UploaderConfig): void {
  if (!config) {
    throw new ValidationError('Config is required.');
  }
  if (!config.credentials) {
    throw new ValidationError('credentials is required. Provide a file path, credentials object, or GoogleAuth instance.');
  }
  if (!config.spreadsheetId || typeof config.spreadsheetId !== 'string') {
    throw new ValidationError('spreadsheetId is required and must be a non-empty string.');
  }
  if (config.retries !== undefined && (config.retries < 0 || !Number.isInteger(config.retries))) {
    throw new ValidationError('retries must be a non-negative integer.');
  }
  if (config.maxRequestsPerMinute !== undefined && config.maxRequestsPerMinute <= 0) {
    throw new ValidationError('maxRequestsPerMinute must be a positive number.');
  }
}

export function validateUploadOptions(options: UploadOptions): void {
  if (!options) {
    throw new ValidationError('Upload options are required.');
  }
  if (!options.sheet || typeof options.sheet !== 'string') {
    throw new ValidationError('sheet name is required and must be a non-empty string.');
  }
  if (options.data === undefined || options.data === null) {
    throw new ValidationError('data is required. Provide a file path, JSON array, or 2D array.');
  }
  if (options.mode && !['replace', 'append'].includes(options.mode)) {
    throw new ValidationError(`Invalid mode "${options.mode}". Must be "replace" or "append".`);
  }
  if (options.startCell) {
    if (!/^[A-Z]+\d+$/i.test(options.startCell)) {
      throw new ValidationError(`Invalid startCell "${options.startCell}". Must be in A1 notation (e.g., "A1", "B5").`);
    }
  }
}

export function validateReadOptions(options: ReadOptions): void {
  if (!options) {
    throw new ValidationError('Read options are required.');
  }
  if (!options.sheet || typeof options.sheet !== 'string') {
    throw new ValidationError('sheet name is required and must be a non-empty string.');
  }
}

export function validateBatchOperations(operations: BatchOperation[]): void {
  if (!Array.isArray(operations) || operations.length === 0) {
    throw new ValidationError('Batch operations must be a non-empty array.');
  }
  operations.forEach((op, i) => {
    if (!op.sheet) {
      throw new ValidationError(`Batch operation at index ${i} is missing "sheet" property.`);
    }
    if (op.data === undefined || op.data === null) {
      throw new ValidationError(`Batch operation at index ${i} is missing "data" property.`);
    }
  });
}
