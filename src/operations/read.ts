import type { sheets_v4 } from 'googleapis';
import { UploaderError } from '../errors.js';
import type { ReadOptions } from '../types.js';

export async function readSheet(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  options: ReadOptions,
): Promise<string[][]> {
  const { sheet, range } = options;
  const fullRange = range ? `${sheet}!${range}` : sheet;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: fullRange,
    });

    return (response.data.values as string[][]) ?? [];
  } catch (error) {
    throw new UploaderError(
      `Failed to read data from sheet "${sheet}"${range ? ` range "${range}"` : ''}.`,
      error instanceof Error ? error : undefined,
    );
  }
}
