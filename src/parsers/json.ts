import { ParseError } from '../errors.js';
import type { CellValue } from '../types.js';

/**
 * Flatten a nested object using dot notation.
 * Example: { a: { b: 1 } } → { "a.b": 1 }
 */
function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey));
    } else {
      result[fullKey] = value;
    }
  }

  return result;
}

function toCellValue(value: unknown): CellValue {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function parseJSON(
  data: Record<string, unknown>[],
  includeHeaders = true,
): CellValue[][] {
  if (!Array.isArray(data)) {
    throw new ParseError('JSON', 'Data must be an array of objects.');
  }

  if (data.length === 0) {
    return includeHeaders ? [[]] : [];
  }

  // Flatten all objects to handle nested structures
  const flattenedData = data.map(item => {
    if (typeof item !== 'object' || item === null) {
      throw new ParseError('JSON', 'Each item in the array must be an object.');
    }
    return flattenObject(item as Record<string, unknown>);
  });

  // Collect all unique headers across all objects
  const headerSet = new Set<string>();
  for (const item of flattenedData) {
    for (const key of Object.keys(item)) {
      headerSet.add(key);
    }
  }
  const headers = Array.from(headerSet);

  const rows: CellValue[][] = [];

  if (includeHeaders) {
    rows.push(headers);
  }

  for (const item of flattenedData) {
    const row = headers.map(header => toCellValue(item[header]));
    rows.push(row);
  }

  return rows;
}
