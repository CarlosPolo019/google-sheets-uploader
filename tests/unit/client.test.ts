import { describe, it, expect } from 'vitest';
import { GoogleSheetsUploader } from '../../src/client';
import { ValidationError } from '../../src/errors';

describe('GoogleSheetsUploader', () => {
  it('throws ValidationError for missing credentials', () => {
    expect(() => new GoogleSheetsUploader({
      credentials: '' as any,
      spreadsheetId: 'abc',
    })).toThrow(ValidationError);
  });

  it('throws ValidationError for missing spreadsheetId', () => {
    expect(() => new GoogleSheetsUploader({
      credentials: '/path/to/creds.json',
      spreadsheetId: '',
    })).toThrow(ValidationError);
  });

  it('creates instance with valid config', () => {
    const uploader = new GoogleSheetsUploader({
      credentials: '/path/to/creds.json',
      spreadsheetId: 'abc123',
    });
    expect(uploader).toBeInstanceOf(GoogleSheetsUploader);
  });

  it('accepts optional config values', () => {
    const uploader = new GoogleSheetsUploader({
      credentials: '/path/to/creds.json',
      spreadsheetId: 'abc123',
      retries: 5,
      retryDelay: 2000,
      maxRequestsPerMinute: 30,
      logLevel: 'silent',
    });
    expect(uploader).toBeInstanceOf(GoogleSheetsUploader);
  });

  it('throws on invalid upload options', async () => {
    const uploader = new GoogleSheetsUploader({
      credentials: '/path/to/creds.json',
      spreadsheetId: 'abc123',
      logLevel: 'silent',
    });

    await expect(uploader.upload({ sheet: '', data: [] })).rejects.toThrow(ValidationError);
    await expect(uploader.upload({ sheet: 'S1', data: null as any })).rejects.toThrow(ValidationError);
  });

  it('throws on invalid read options', async () => {
    const uploader = new GoogleSheetsUploader({
      credentials: '/path/to/creds.json',
      spreadsheetId: 'abc123',
      logLevel: 'silent',
    });

    await expect(uploader.read({ sheet: '' })).rejects.toThrow(ValidationError);
  });

  it('throws on invalid batch operations', async () => {
    const uploader = new GoogleSheetsUploader({
      credentials: '/path/to/creds.json',
      spreadsheetId: 'abc123',
      logLevel: 'silent',
    });

    await expect(uploader.batch([])).rejects.toThrow(ValidationError);
  });
});
