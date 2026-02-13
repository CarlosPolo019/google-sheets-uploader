export class UploaderError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'UploaderError';
  }
}

export class AuthenticationError extends UploaderError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'AuthenticationError';
  }
}

export class SheetNotFoundError extends UploaderError {
  constructor(sheetName: string) {
    super(`Sheet "${sheetName}" not found in the spreadsheet.`);
    this.name = 'SheetNotFoundError';
  }
}

export class ValidationError extends UploaderError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends UploaderError {
  constructor(message = 'Google API rate limit exceeded. Please retry later.') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ParseError extends UploaderError {
  constructor(format: string, message: string, cause?: Error) {
    super(`Failed to parse ${format} data: ${message}`, cause);
    this.name = 'ParseError';
  }
}
