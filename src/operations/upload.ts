import type { sheets_v4 } from 'googleapis';
import { clearSheet } from './clear.js';
import { resolveData } from '../parsers/index.js';
import { buildRange } from '../utils/range.js';
import { UploaderError } from '../errors.js';
import type { UploadOptions, ProgressEvent, CellValue } from '../types.js';

const CHUNK_SIZE = 10_000; // rows per batch

function emitProgress(
  onProgress: ((e: ProgressEvent) => void) | undefined,
  phase: ProgressEvent['phase'],
  processedRows: number,
  totalRows: number,
): void {
  if (!onProgress) return;
  onProgress({
    phase,
    percent: totalRows === 0 ? 100 : Math.round((processedRows / totalRows) * 100),
    totalRows,
    processedRows,
  });
}

function serializeValues(rows: CellValue[][]): (string | number | boolean | null)[][] {
  return rows.map(row =>
    row.map(cell => {
      if (cell instanceof Date) return cell.toISOString();
      if (cell === undefined) return null;
      return cell;
    }),
  );
}

export async function uploadData(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  options: UploadOptions,
): Promise<void> {
  const {
    sheet,
    data,
    mode = 'replace',
    startCell = 'A1',
    includeHeaders = true,
    onProgress,
  } = options;

  // Parse input data
  emitProgress(onProgress, 'parsing', 0, 0);
  const rows = await resolveData(data, includeHeaders);

  if (rows.length === 0) {
    emitProgress(onProgress, 'complete', 0, 0);
    return;
  }

  const totalRows = rows.length;
  const serialized = serializeValues(rows);

  // Clear if replace mode
  if (mode === 'replace') {
    emitProgress(onProgress, 'clearing', 0, totalRows);
    await clearSheet(sheets, spreadsheetId, sheet);
  }

  // Determine the write method based on mode
  emitProgress(onProgress, 'uploading', 0, totalRows);

  try {
    if (mode === 'append') {
      // Append after existing data
      for (let i = 0; i < serialized.length; i += CHUNK_SIZE) {
        const chunk = serialized.slice(i, i + CHUNK_SIZE);
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${sheet}!${startCell}`,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          requestBody: { values: chunk },
        });
        emitProgress(onProgress, 'uploading', Math.min(i + CHUNK_SIZE, totalRows), totalRows);
      }
    } else {
      // Replace mode — write to specific range
      const maxCols = Math.max(...serialized.map(r => r.length));
      const range = buildRange(sheet, 1, 1, serialized.length, maxCols);

      // Pad rows to consistent length
      const padded = serialized.map(row => {
        while (row.length < maxCols) row.push(null);
        return row;
      });

      for (let i = 0; i < padded.length; i += CHUNK_SIZE) {
        const chunk = padded.slice(i, i + CHUNK_SIZE);
        const chunkRange = buildRange(sheet, i + 1, 1, i + chunk.length, maxCols);

        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: chunkRange,
          valueInputOption: 'RAW',
          requestBody: { values: chunk },
        });
        emitProgress(onProgress, 'uploading', Math.min(i + CHUNK_SIZE, totalRows), totalRows);
      }
    }

    emitProgress(onProgress, 'complete', totalRows, totalRows);
  } catch (error) {
    throw new UploaderError(
      `Failed to upload data to sheet "${sheet}".`,
      error instanceof Error ? error : undefined,
    );
  }
}
