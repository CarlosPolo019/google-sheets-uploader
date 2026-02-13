import fs from 'node:fs';
import { ParseError } from '../errors.js';
import type { CellValue } from '../types.js';

/**
 * Parse a CSV string into a 2D array. Handles quoted fields with commas and newlines.
 */
function parseCSVString(content: string): CellValue[][] {
  const rows: CellValue[][] = [];
  let currentRow: CellValue[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < content.length) {
    const char = content[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < content.length && content[i + 1] === '"') {
          currentField += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        currentField += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === ',') {
        currentRow.push(coerceValue(currentField));
        currentField = '';
        i++;
      } else if (char === '\r' && i + 1 < content.length && content[i + 1] === '\n') {
        currentRow.push(coerceValue(currentField));
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
        i += 2;
      } else if (char === '\n') {
        currentRow.push(coerceValue(currentField));
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
        i++;
      } else {
        currentField += char;
        i++;
      }
    }
  }

  // Last field/row
  if (currentField || currentRow.length > 0) {
    currentRow.push(coerceValue(currentField));
    rows.push(currentRow);
  }

  return rows;
}

function coerceValue(raw: string): CellValue {
  const trimmed = raw.trim();
  if (trimmed === '') return null;

  // Boolean
  if (trimmed.toLowerCase() === 'true') return true;
  if (trimmed.toLowerCase() === 'false') return false;

  // Number
  const num = Number(trimmed);
  if (!isNaN(num) && trimmed !== '') return num;

  return raw;
}

export async function parseCSV(filePath: string): Promise<CellValue[][]> {
  if (!fs.existsSync(filePath)) {
    throw new ParseError('CSV', `File not found: "${filePath}"`);
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return parseCSVString(content);
  } catch (error) {
    if (error instanceof ParseError) throw error;
    throw new ParseError(
      'CSV',
      `Could not read file "${filePath}".`,
      error instanceof Error ? error : undefined,
    );
  }
}
