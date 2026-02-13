import { describe, it, expect } from 'vitest';
import { parseJSON } from '../../src/parsers/json';
import { ParseError } from '../../src/errors';

describe('parseJSON', () => {
  it('converts simple objects with headers', () => {
    const data = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ];
    const result = parseJSON(data, true);
    expect(result).toEqual([
      ['name', 'age'],
      ['Alice', 30],
      ['Bob', 25],
    ]);
  });

  it('converts without headers', () => {
    const data = [{ name: 'Alice' }];
    const result = parseJSON(data, false);
    expect(result).toEqual([['Alice']]);
  });

  it('handles missing keys across objects', () => {
    const data = [
      { a: 1, b: 2 },
      { a: 3, c: 4 },
    ];
    const result = parseJSON(data, true);
    expect(result[0]).toEqual(['a', 'b', 'c']);
    expect(result[1]).toEqual([1, 2, null]);
    expect(result[2]).toEqual([3, null, 4]);
  });

  it('flattens nested objects', () => {
    const data = [{ user: { name: 'Alice', address: { city: 'NYC' } } }];
    const result = parseJSON(data, true);
    expect(result[0]).toEqual(['user.name', 'user.address.city']);
    expect(result[1]).toEqual(['Alice', 'NYC']);
  });

  it('serializes arrays as JSON strings', () => {
    const data = [{ tags: ['a', 'b'] }];
    const result = parseJSON(data, true);
    expect(result[1][0]).toBe('["a","b"]');
  });

  it('handles null and undefined values', () => {
    const data = [{ a: null, b: undefined }];
    const result = parseJSON(data, true);
    expect(result[1]).toEqual([null, null]);
  });

  it('handles empty array', () => {
    expect(parseJSON([], true)).toEqual([[]]);
    expect(parseJSON([], false)).toEqual([]);
  });

  it('throws for non-array input', () => {
    expect(() => parseJSON('not an array' as any)).toThrow(ParseError);
  });

  it('throws for non-object items', () => {
    expect(() => parseJSON([1, 2, 3] as any)).toThrow(ParseError);
  });
});
