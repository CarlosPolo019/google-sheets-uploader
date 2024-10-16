
# 📊 Google Sheets Uploader

![Build Status](https://img.shields.io/github/actions/workflow/status/CarlosPolo019/google-sheets-uploader/deploy.yml?branch=main)
![npm downloads](https://img.shields.io/npm/dm/google-sheets-uploader)
![GitHub Release Date](https://img.shields.io/github/release-date/CarlosPolo019/google-sheets-uploader)
![npm package](https://img.shields.io/npm/v/google-sheets-uploader)
![NPM License](https://img.shields.io/npm/l/google-sheets-uploader)
![GitHub Repo stars](https://img.shields.io/github/stars/CarlosPolo019/google-sheets-uploader)

A **Node.js** library for uploading data to **Google Sheets** from **Excel files** or **JSON data**. This package allows you to upload an existing Excel file or a JSON object (which is converted to Excel) directly to Google Sheets.

## ✨ Features

- 🚀 Uploads **Excel files** directly to Google Sheets.
- 🔄 Converts **JSON data** to **Excel** and uploads it seamlessly.
- 🧹 Automatically **clears existing data** in the sheet before uploading new data.
- 🔒 Supports Google Sheets **authentication** via a **credentials.json** file.

## 📦 Installation

```bash
npm install google-sheets-uploader
```

## ⚙️ Requirements

- **Google Sheets API**: Ensure the **Google Sheets API** is enabled and you have the `credentials.json` file.
- **Google Cloud Project**: Set up a project on [Google Cloud Console](https://console.cloud.google.com/).
- **Service Account**: Create a **service account** with the necessary permissions.

## 🛠️ Setup

### 1️⃣ Enable the Google Sheets API

- 🛠️ Go to [Google Cloud Console](https://console.cloud.google.com/).
- 🏗️ Create a new project or use an existing one.
- ✅ Enable the **Google Sheets API**.
- 🔐 Create a **service account** and download the `credentials.json` file.
- 📂 Place the `credentials.json` file inside the `credentials` folder of your project.

### 2️⃣ Set Permissions in Google Sheets

- 📧 Share your Google Sheet with the **service account email** (found in the `credentials.json`) to give it permission to edit the sheet.

## 🚀 Usage

### 📄 Upload an Excel File to Google Sheets

Easily upload an existing Excel file to Google Sheets using the following code:

```javascript
const { uploadToGoogleSheets } = require('google-sheets-uploader');

const credentialsPath = './credentials/credentials.json';  // 🔑 Path to your Google credentials
const spreadsheetId = 'YOUR_SPREADSHEET_ID';  // 🆔 Your Google Sheets ID
const sheetName = 'Sheet1';  // 📜 Name of the sheet to modify
const excelFilePath = './path_to_your_excel_file.xlsx';  // 📁 Path to your Excel file

async function uploadExcel() {
  try {
    await uploadToGoogleSheets(credentialsPath, spreadsheetId, sheetName, excelFilePath);
    console.log('✅ Excel file uploaded successfully');
  } catch (err) {
    console.error('❌ Error uploading Excel file:', err);
  }
}

uploadExcel();
```

### 📊 Upload JSON Data to Google Sheets

You can also upload **JSON data**, which will be converted into an Excel file before being uploaded to Google Sheets:

```javascript
const { uploadToGoogleSheets } = require('google-sheets-uploader');

const credentialsPath = './credentials/credentials.json';  // 🔑 Path to your Google credentials
const spreadsheetId = 'YOUR_SPREADSHEET_ID';  // 🆔 Your Google Sheets ID
const sheetName = 'Sheet1';  // 📜 Name of the sheet to modify

const jsonData = [
  { "Name": "John", "Age": 30, "City": "New York" },
  { "Name": "Jane", "Age": 28, "City": "Los Angeles" },
];

async function uploadJson() {
  try {
    await uploadToGoogleSheets(credentialsPath, spreadsheetId, sheetName, jsonData);
    console.log('✅ JSON data uploaded successfully');
  } catch (err) {
    console.error('❌ Error uploading JSON data:', err);
  }
}

uploadJson();
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
