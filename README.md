# Google Sheets Uploader

[![npm version](https://img.shields.io/npm/v/google-sheets-uploader)](https://www.npmjs.com/package/google-sheets-uploader)
[![CI](https://img.shields.io/github/actions/workflow/status/CarlosPolo019/google-sheets-uploader/deploy.yml?branch=main)](https://github.com/CarlosPolo019/google-sheets-uploader/actions)
[![npm downloads](https://img.shields.io/npm/dm/google-sheets-uploader)](https://www.npmjs.com/package/google-sheets-uploader)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/npm/l/google-sheets-uploader)](LICENSE)

A professional-grade Node.js library for uploading, reading, and managing Google Sheets data. Supports Excel, CSV, JSON, and raw arrays with built-in retry logic, rate limiting, and batch operations.

## Features

- **Multi-format support** — Upload from Excel (.xlsx), CSV, JSON objects, or 2D arrays
- **Read & Write** — Read data back from sheets, not just upload
- **Batch operations** — Upload to multiple sheets in a single call
- **Append mode** — Add data to existing sheets without overwriting
- **Auto retry** — Exponential backoff with jitter for transient API failures
- **Rate limiting** — Built-in token bucket rate limiter to stay within API quotas
- **Progress callbacks** — Track upload progress in real-time
- **TypeScript first** — Full type definitions with autocompletion
- **Dual ESM/CJS** — Works with `import` and `require`
- **Smart parsing** — Flattens nested JSON, handles rich Excel cell types, coerces CSV values
- **Configurable logging** — Silent, error, warn, info, or debug levels
- **Backwards compatible** — Legacy `uploadToGoogleSheets()` function still works

## Installation

```bash
npm install google-sheets-uploader
```

**Requirements:** Node.js >= 18

## Quick Start

```typescript
import { GoogleSheetsUploader } from 'google-sheets-uploader';

const uploader = new GoogleSheetsUploader({
  credentials: './credentials/credentials.json',
  spreadsheetId: 'YOUR_SPREADSHEET_ID',
});

// Upload JSON data
await uploader.upload({
  sheet: 'Sheet1',
  data: [
    { name: 'Alice', age: 30, city: 'New York' },
    { name: 'Bob', age: 25, city: 'San Francisco' },
  ],
});
```

## Setup

### 1. Enable the Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Enable the **Google Sheets API**
4. Create a **Service Account** and download the `credentials.json` file
5. Place the credentials file in your project

### 2. Share Your Spreadsheet

Share your Google Sheet with the service account email (found in `credentials.json` under `client_email`) and grant **Editor** access.

## API Reference

### `new GoogleSheetsUploader(config)`

Create a new uploader instance.

```typescript
const uploader = new GoogleSheetsUploader({
  credentials: './credentials.json', // File path, object, or GoogleAuth instance
  spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms',
  retries: 3,                        // Retry attempts for failed API calls (default: 3)
  retryDelay: 1000,                  // Initial retry delay in ms (default: 1000)
  maxRequestsPerMinute: 60,          // Rate limit (default: 60)
  logLevel: 'info',                  // 'silent' | 'error' | 'warn' | 'info' | 'debug'
});
```

### `uploader.upload(options)`

Upload data to a sheet.

```typescript
// Upload Excel file
await uploader.upload({
  sheet: 'Sheet1',
  data: './data.xlsx',
});

// Upload CSV file
await uploader.upload({
  sheet: 'Sheet1',
  data: './data.csv',
});

// Upload JSON array
await uploader.upload({
  sheet: 'Sheet1',
  data: [{ name: 'Alice', age: 30 }],
  includeHeaders: true,  // default: true
});

// Upload 2D array
await uploader.upload({
  sheet: 'Sheet1',
  data: [['Name', 'Age'], ['Alice', 30]],
});

// Append instead of replace
await uploader.upload({
  sheet: 'Sheet1',
  data: newRows,
  mode: 'append',
});

// Track progress
await uploader.upload({
  sheet: 'Sheet1',
  data: largeDataset,
  onProgress: ({ phase, percent }) => {
    console.log(`${phase}: ${percent}%`);
  },
});
```

### `uploader.read(options)`

Read data from a sheet.

```typescript
// Read entire sheet
const allData = await uploader.read({ sheet: 'Sheet1' });

// Read specific range
const partial = await uploader.read({
  sheet: 'Sheet1',
  range: 'A1:D10',
});
```

### `uploader.clear(sheetName)`

Clear all data from a sheet.

```typescript
await uploader.clear('Sheet1');
```

### `uploader.batch(operations)`

Upload to multiple sheets in a single call.

```typescript
await uploader.batch([
  { sheet: 'Users', data: userData },
  { sheet: 'Orders', data: orderData, mode: 'append' },
  { sheet: 'Products', data: './products.csv' },
]);
```

### `uploader.getSpreadsheetInfo()`

Get metadata about the spreadsheet.

```typescript
const info = await uploader.getSpreadsheetInfo();
console.log(info.title);        // "My Spreadsheet"
console.log(info.sheets);       // [{ title: "Sheet1", rowCount: 1000, ... }]
```

## Credentials Options

```typescript
// Option 1: File path
const uploader = new GoogleSheetsUploader({
  credentials: './credentials/credentials.json',
  spreadsheetId: '...',
});

// Option 2: Credentials object (e.g., from environment variables)
const uploader = new GoogleSheetsUploader({
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    // ...
  },
  spreadsheetId: '...',
});

// Option 3: Pre-configured GoogleAuth instance
import { google } from 'googleapis';
const auth = new google.auth.GoogleAuth({ keyFile: './creds.json', scopes: ['...'] });

const uploader = new GoogleSheetsUploader({
  credentials: auth,
  spreadsheetId: '...',
});
```

## Error Handling

The library provides specific error classes for different failure modes:

```typescript
import {
  GoogleSheetsUploader,
  AuthenticationError,
  SheetNotFoundError,
  ValidationError,
  RateLimitError,
  ParseError,
} from 'google-sheets-uploader';

try {
  await uploader.upload({ sheet: 'Sheet1', data: myData });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Check your credentials:', error.message);
  } else if (error instanceof SheetNotFoundError) {
    console.error('Sheet does not exist:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('Invalid input:', error.message);
  } else if (error instanceof ParseError) {
    console.error('Failed to parse data:', error.message);
  }
}
```

## Migration from v1.x

The legacy `uploadToGoogleSheets` function is still available but deprecated:

```typescript
// v1.x (still works)
const { uploadToGoogleSheets } = require('google-sheets-uploader');
await uploadToGoogleSheets(credentialsPath, spreadsheetId, sheetName, data);

// v2.x (recommended)
const { GoogleSheetsUploader } = require('google-sheets-uploader');
const uploader = new GoogleSheetsUploader({
  credentials: credentialsPath,
  spreadsheetId,
});
await uploader.upload({ sheet: sheetName, data });
```

## License

MIT
