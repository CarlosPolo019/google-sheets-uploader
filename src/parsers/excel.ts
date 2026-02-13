import ExcelJS from 'exceljs';
import fs from 'node:fs';
import { ParseError } from '../errors.js';
import type { CellValue } from '../types.js';

function extractCellValue(cell: ExcelJS.Cell): CellValue {
  const value = cell.value;
  if (value === null || value === undefined) return null;

  // Handle rich text
  if (typeof value === 'object' && 'richText' in value) {
    return (value as ExcelJS.CellRichTextValue).richText
      .map(rt => rt.text)
      .join('');
  }

  // Handle formula results
  if (typeof value === 'object' && 'result' in value) {
    return (value as ExcelJS.CellFormulaValue).result as CellValue ?? null;
  }

  // Handle hyperlinks
  if (typeof value === 'object' && 'hyperlink' in value) {
    return (value as ExcelJS.CellHyperlinkValue).text ?? String(value);
  }

  // Handle errors
  if (typeof value === 'object' && 'error' in value) {
    return null;
  }

  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  return String(value);
}

export async function parseExcel(filePath: string): Promise<CellValue[][]> {
  if (!fs.existsSync(filePath)) {
    throw new ParseError('Excel', `File not found: "${filePath}"`);
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new ParseError('Excel', 'Workbook has no worksheets.');
    }

    const rows: CellValue[][] = [];
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      const values: CellValue[] = [];
      for (let col = 1; col <= (row.cellCount || 0); col++) {
        values.push(extractCellValue(row.getCell(col)));
      }
      rows.push(values);
    });

    return rows;
  } catch (error) {
    if (error instanceof ParseError) throw error;
    throw new ParseError(
      'Excel',
      `Could not read file "${filePath}".`,
      error instanceof Error ? error : undefined,
    );
  }
}
