# Changelog

## 2.0.0 (2026-02-13)

### Breaking Changes

- Minimum Node.js version is now 18
- Package is now built with TypeScript (full type definitions included)

### New Features

- **`GoogleSheetsUploader` class** — New primary API with builder pattern
- **Read data** — `uploader.read()` to fetch data from sheets
- **Append mode** — Upload with `mode: 'append'` to add data without clearing
- **Batch operations** — `uploader.batch()` to upload to multiple sheets at once
- **CSV support** — Upload CSV files directly
- **2D array support** — Pass raw `string[][]` data
- **Progress callbacks** — Track upload progress with `onProgress`
- **Retry with exponential backoff** — Automatic retry on transient API failures
- **Rate limiting** — Built-in rate limiter to stay within Google API quotas
- **Configurable logging** — Silent, error, warn, info, debug levels
- **Custom error classes** — `AuthenticationError`, `SheetNotFoundError`, `ValidationError`, `RateLimitError`, `ParseError`
- **Spreadsheet info** — `uploader.getSpreadsheetInfo()` for metadata
- **Multiple credential formats** — File path, JSON object, or GoogleAuth instance
- **Nested JSON flattening** — Automatic dot-notation flattening for nested objects
- **Column support beyond Z** — Handles AA, AB, ..., ZZ, AAA columns correctly
- **Dual ESM/CJS** — Works with both `import` and `require`

### Improvements

- No temporary files written to disk (JSON conversion is in-memory)
- Input validation with descriptive error messages
- Chunked uploads for large datasets (10,000 rows per batch)

### Backwards Compatibility

- Legacy `uploadToGoogleSheets()` function is still exported (deprecated)

## 1.1.1

- Initial public release
- Upload Excel files to Google Sheets
- Convert JSON to Excel and upload
