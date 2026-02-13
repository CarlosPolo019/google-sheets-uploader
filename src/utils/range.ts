/**
 * Convert a 1-based column number to A1 notation letter(s).
 * 1 → A, 26 → Z, 27 → AA, 702 → ZZ, 703 → AAA
 */
export function columnToLetter(column: number): string {
  let result = '';
  let n = column;
  while (n > 0) {
    n--;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}

/**
 * Build an A1 notation range string.
 * Example: buildRange('Sheet1', 1, 1, 100, 5) → "Sheet1!A1:E100"
 */
export function buildRange(
  sheetName: string,
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
): string {
  const escapedName = sheetName.includes(' ') ? `'${sheetName}'` : sheetName;
  const start = `${columnToLetter(startCol)}${startRow}`;
  const end = `${columnToLetter(endCol)}${endRow}`;
  return `${escapedName}!${start}:${end}`;
}

/**
 * Parse an A1 cell reference into row and column numbers.
 * Example: parseCell('B3') → { row: 3, col: 2 }
 */
export function parseCell(cell: string): { row: number; col: number } {
  const match = cell.match(/^([A-Z]+)(\d+)$/i);
  if (!match) {
    throw new Error(`Invalid cell reference: "${cell}"`);
  }

  const letters = match[1].toUpperCase();
  const row = parseInt(match[2], 10);

  let col = 0;
  for (let i = 0; i < letters.length; i++) {
    col = col * 26 + (letters.charCodeAt(i) - 64);
  }

  return { row, col };
}
