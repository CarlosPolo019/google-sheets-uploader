import type { sheets_v4 } from 'googleapis';
import { uploadData } from './upload.js';
import type { BatchOperation } from '../types.js';
import { Logger } from '../utils/logger.js';
import type { LogLevel } from '../types.js';

export async function batchUpload(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  operations: BatchOperation[],
  logger: Logger,
): Promise<void> {
  logger.info(`Starting batch upload: ${operations.length} operation(s)`);

  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    logger.info(`[${i + 1}/${operations.length}] Uploading to sheet "${op.sheet}"...`);

    await uploadData(sheets, spreadsheetId, {
      sheet: op.sheet,
      data: op.data,
      mode: op.mode ?? 'replace',
      includeHeaders: op.includeHeaders ?? true,
    });
  }

  logger.info(`Batch upload complete: ${operations.length} sheet(s) updated.`);
}
