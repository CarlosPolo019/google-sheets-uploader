import { parseExcel } from './excel.js';
import { parseCSV } from './csv.js';
import { parseJSON } from './json.js';
import { ValidationError } from '../errors.js';
import type { InputData, CellValue } from '../types.js';

/**
 * Resolve any InputData type into a 2D array ready for upload.
 * Auto-detects file type by extension.
 */
export async function resolveData(
  data: InputData,
  includeHeaders = true,
): Promise<CellValue[][]> {
  // 2D array — pass through
  if (Array.isArray(data) && (data.length === 0 || Array.isArray(data[0]))) {
    return data as CellValue[][];
  }

  // JSON array of objects
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && !Array.isArray(data[0])) {
    return parseJSON(data as Record<string, unknown>[], includeHeaders);
  }

  // File path
  if (typeof data === 'string') {
    const ext = data.toLowerCase().split('.').pop();

    switch (ext) {
      case 'xlsx':
      case 'xls':
        return parseExcel(data);
      case 'csv':
        return parseCSV(data);
      default:
        throw new ValidationError(
          `Unsupported file extension ".${ext}". Supported formats: .xlsx, .xls, .csv`,
        );
    }
  }

  throw new ValidationError(
    'Invalid data type. Provide a file path (string), JSON array, or 2D array.',
  );
}

export { parseExcel, parseCSV, parseJSON };
