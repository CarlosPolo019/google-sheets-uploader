import { describe, it, expect } from 'vitest';
import { validateConfig, validateUploadOptions, validateReadOptions, validateBatchOperations } from '../../src/utils/validation';
import { ValidationError } from '../../src/errors';
import type { UploaderConfig, UploadOptions } from '../../src/types';

describe('validateConfig', () => {
  const validConfig: UploaderConfig = {
    credentials: '/path/to/credentials.json',
    spreadsheetId: 'abc123',
  };

  it('accepts valid config', () => {
    expect(() => validateConfig(validConfig)).not.toThrow();
  });

  it('rejects missing credentials', () => {
    expect(() => validateConfig({ ...validConfig, credentials: '' } as any)).toThrow(ValidationError);
  });

  it('rejects missing spreadsheetId', () => {
    expect(() => validateConfig({ ...validConfig, spreadsheetId: '' })).toThrow(ValidationError);
  });

  it('rejects negative retries', () => {
    expect(() => validateConfig({ ...validConfig, retries: -1 })).toThrow(ValidationError);
  });

  it('rejects non-integer retries', () => {
    expect(() => validateConfig({ ...validConfig, retries: 1.5 })).toThrow(ValidationError);
  });

  it('rejects zero maxRequestsPerMinute', () => {
    expect(() => validateConfig({ ...validConfig, maxRequestsPerMinute: 0 })).toThrow(ValidationError);
  });
});

describe('validateUploadOptions', () => {
  const validOptions: UploadOptions = {
    sheet: 'Sheet1',
    data: [['a', 'b']],
  };

  it('accepts valid options', () => {
    expect(() => validateUploadOptions(validOptions)).not.toThrow();
  });

  it('rejects missing sheet', () => {
    expect(() => validateUploadOptions({ ...validOptions, sheet: '' })).toThrow(ValidationError);
  });

  it('rejects null data', () => {
    expect(() => validateUploadOptions({ ...validOptions, data: null as any })).toThrow(ValidationError);
  });

  it('rejects invalid mode', () => {
    expect(() => validateUploadOptions({ ...validOptions, mode: 'invalid' as any })).toThrow(ValidationError);
  });

  it('accepts valid modes', () => {
    expect(() => validateUploadOptions({ ...validOptions, mode: 'replace' })).not.toThrow();
    expect(() => validateUploadOptions({ ...validOptions, mode: 'append' })).not.toThrow();
  });

  it('rejects invalid startCell', () => {
    expect(() => validateUploadOptions({ ...validOptions, startCell: '123' })).toThrow(ValidationError);
  });

  it('accepts valid startCell', () => {
    expect(() => validateUploadOptions({ ...validOptions, startCell: 'B5' })).not.toThrow();
  });
});

describe('validateReadOptions', () => {
  it('accepts valid options', () => {
    expect(() => validateReadOptions({ sheet: 'Sheet1' })).not.toThrow();
  });

  it('rejects missing sheet', () => {
    expect(() => validateReadOptions({ sheet: '' })).toThrow(ValidationError);
  });
});

describe('validateBatchOperations', () => {
  it('accepts valid operations', () => {
    expect(() => validateBatchOperations([{ sheet: 'S1', data: [[1]] }])).not.toThrow();
  });

  it('rejects empty array', () => {
    expect(() => validateBatchOperations([])).toThrow(ValidationError);
  });

  it('rejects operations without sheet', () => {
    expect(() => validateBatchOperations([{ sheet: '', data: [[1]] }])).toThrow(ValidationError);
  });

  it('rejects operations without data', () => {
    expect(() => validateBatchOperations([{ sheet: 'S1', data: null as any }])).toThrow(ValidationError);
  });
});
