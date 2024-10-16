const { google } = require('googleapis');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { authenticate } = require('./googleAuth');

async function clearSheet(sheets, spreadsheetId, sheetName) {
    try {
        const response = await sheets.spreadsheets.get({ spreadsheetId });
        const sheet = response.data.sheets.find(sheet => sheet.properties.title === sheetName);
        const sheetId = sheet ? sheet.properties.sheetId : null;
        
        if (!sheetId) {
            throw new Error(`Sheet "${sheetName}" not found.`);
        }

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: {
                requests: [{
                    updateCells: {
                        range: { sheetId, startRowIndex: 0, startColumnIndex: 0 },
                        fields: 'userEnteredValue'
                    }
                }]
            }
        });

        console.log(`Cleared data from sheet: ${sheetName}`);
    } catch (error) {
        throw new Error(`Error clearing sheet: ${error.message}`);
    }
}

async function uploadToGoogleSheets(credentialsPath, spreadsheetId, sheetName, filePathOrJson) {
    const authClient = await authenticate(credentialsPath);
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    let filePath = filePathOrJson;

    // Si filePathOrJson es un JSON, convertirlo a un archivo Excel
    if (typeof filePathOrJson !== 'string') {
        const jsonData = filePathOrJson;
        filePath = './output/temp_json_to_excel.xlsx';
        await convertJsonToExcel(jsonData, filePath);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);

    // Limpiar la hoja existente
    await clearSheet(sheets, spreadsheetId, sheetName);

    const rows = worksheet.getSheetValues().slice(1); // Excluye la fila de encabezado
    const values = rows.map(row => row.slice(1)); // Ajustar el rango
    const range = `${sheetName}!A1:${String.fromCharCode(64 + rows[0].length)}${rows.length + 1}`;

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values }
    });

    console.log(`Data uploaded to Google Sheets (${spreadsheetId}) in sheet ${sheetName}`);
}

module.exports = { uploadToGoogleSheets };
