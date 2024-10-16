
# Google Sheets Uploader

A Node.js library for uploading data to Google Sheets from Excel files or JSON data. This package allows you to either upload an existing Excel file to Google Sheets or upload a JSON object which is converted to Excel before being uploaded.

## Features

- Uploads Excel files directly to Google Sheets.
- Converts JSON data to Excel format and uploads it.
- Automatically clears the existing sheet data before uploading new data.
- Supports Google Sheets authentication via a credentials file.

## Installation

```bash
npm install google-sheets-uploader
```

## Requirements

- **Google Sheets API**: You need to enable the Google Sheets API and have a `credentials.json` file.
- **Google Cloud Project**: Create a project in [Google Cloud Console](https://console.cloud.google.com/).
- **Service Account**: Create a service account with the appropriate permissions.

## Setup

### 1. Enable the Google Sheets API

- Go to [Google Cloud Console](https://console.cloud.google.com/).
- Create a new project or use an existing one.
- Enable the **Google Sheets API**.
- Create a **service account** and download the `credentials.json` file.
- Place the `credentials.json` file inside the `credentials` folder of your project.

### 2. Set Permissions in Google Sheets

- Share your Google Sheet with the service account email (found in the `credentials.json`) to grant it permission to edit the sheet.

## Usage

### Upload an Excel File to Google Sheets

You can upload an existing Excel file to Google Sheets using the library.

```javascript
const { uploadToGoogleSheets } = require('google-sheets-uploader');

const credentialsPath = './credentials/credentials.json';  // Path to your Google credentials
const spreadsheetId = 'YOUR_SPREADSHEET_ID';  // Your Google Sheets ID
const sheetName = 'Sheet1';  // The name of the sheet you want to modify
const excelFilePath = './path_to_your_excel_file.xlsx';  // Path to the Excel file you want to upload

async function uploadExcel() {
  try {
    await uploadToGoogleSheets(credentialsPath, spreadsheetId, sheetName, excelFilePath);
    console.log('Excel file uploaded successfully');
  } catch (err) {
    console.error('Error uploading Excel file:', err);
  }
}

uploadExcel();
```

### Upload JSON Data to Google Sheets

You can also upload a JSON object, which will be converted into an Excel file before being uploaded to Google Sheets.

```javascript
const { uploadToGoogleSheets } = require('google-sheets-uploader');

const credentialsPath = './credentials/credentials.json';  // Path to your Google credentials
const spreadsheetId = 'YOUR_SPREADSHEET_ID';  // Your Google Sheets ID
const sheetName = 'Sheet1';  // The name of the sheet you want to modify

const jsonData = [
  { "Name": "John", "Age": 30, "City": "New York" },
  { "Name": "Jane", "Age": 28, "City": "Los Angeles" },
];

async function uploadJson() {
  try {
    await uploadToGoogleSheets(credentialsPath, spreadsheetId, sheetName, jsonData);
    console.log('JSON data uploaded successfully');
  } catch (err) {
    console.error('Error uploading JSON data:', err);
  }
}

uploadJson();
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
