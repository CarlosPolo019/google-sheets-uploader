import { describe, it, expect } from 'vitest';
import { columnToLetter, buildRange, parseCell } from '../../src/utils/range';

describe('columnToLetter', () => {
  it('converts single-letter columns', () => {
    expect(columnToLetter(1)).toBe('A');
    expect(columnToLetter(26)).toBe('Z');
  });

  it('converts double-letter columns', () => {
    expect(columnToLetter(27)).toBe('AA');
    expect(columnToLetter(28)).toBe('AB');
    expect(columnToLetter(52)).toBe('AZ');
    expect(columnToLetter(702)).toBe('ZZ');
  });

  it('converts triple-letter columns', () => {
    expect(columnToLetter(703)).toBe('AAA');
  });
});

describe('buildRange', () => {
  it('builds a simple range', () => {
    expect(buildRange('Sheet1', 1, 1, 10, 5)).toBe('Sheet1!A1:E10');
  });

  it('escapes sheet names with spaces', () => {
    expect(buildRange('My Sheet', 1, 1, 5, 3)).toBe("'My Sheet'!A1:C5");
  });

  it('handles large column numbers', () => {
    expect(buildRange('Data', 1, 1, 100, 30)).toBe('Data!A1:AD100');
  });
});

describe('parseCell', () => {
  it('parses simple cell references', () => {
    expect(parseCell('A1')).toEqual({ row: 1, col: 1 });
    expect(parseCell('B3')).toEqual({ row: 3, col: 2 });
    expect(parseCell('Z100')).toEqual({ row: 100, col: 26 });
  });

  it('parses multi-letter cell references', () => {
    expect(parseCell('AA1')).toEqual({ row: 1, col: 27 });
    expect(parseCell('AB5')).toEqual({ row: 5, col: 28 });
  });

  it('is case-insensitive', () => {
    expect(parseCell('a1')).toEqual({ row: 1, col: 1 });
  });

  it('throws on invalid references', () => {
    expect(() => parseCell('123')).toThrow('Invalid cell reference');
    expect(() => parseCell('')).toThrow('Invalid cell reference');
    expect(() => parseCell('A')).toThrow('Invalid cell reference');
  });
});
