const { uploadToGoogleSheets } = require('./index');  // Importa tu librería

const credentialsPath = './credentials/credentials.json';  // Ruta a las credenciales de Google
const spreadsheetId = '';  // Reemplaza con el ID de tu Google Sheets
const sheetName = 'Sheet10';  // Nombre de la hoja de Google Sheets
const excelFilePath = './usuarios_que_no_regresan_misma_ruta.xlsx';  // Ruta al archivo Excel que quieres subir

async function uploadExcelFile() {
  try {
    await uploadToGoogleSheets(credentialsPath, spreadsheetId, sheetName, excelFilePath);
    console.log('Excel file uploaded successfully');
  } catch (err) {
    console.error('Error uploading Excel file:', err);
  }
}

// Ejecutar la función para subir el archivo Excel
uploadExcelFile();
