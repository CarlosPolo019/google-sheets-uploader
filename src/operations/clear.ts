import type { sheets_v4 } from 'googleapis';
import { SheetNotFoundError, UploaderError } from '../errors.js';

export async function clearSheet(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  sheetName: string,
): Promise<void> {
  try {
    const response = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = response.data.sheets?.find(
      s => s.properties?.title === sheetName,
    );

    if (!sheet?.properties?.sheetId && sheet?.properties?.sheetId !== 0) {
      throw new SheetNotFoundError(sheetName);
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            updateCells: {
              range: {
                sheetId: sheet.properties.sheetId,
                startRowIndex: 0,
                startColumnIndex: 0,
              },
              fields: 'userEnteredValue',
            },
          },
        ],
      },
    });
  } catch (error) {
    if (error instanceof SheetNotFoundError) throw error;
    throw new UploaderError(
      `Failed to clear sheet "${sheetName}".`,
      error instanceof Error ? error : undefined,
    );
  }
}
