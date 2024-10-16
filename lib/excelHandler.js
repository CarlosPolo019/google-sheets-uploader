const ExcelJS = require('exceljs');
const fs = require('fs');

async function convertJsonToExcel(jsonData, outputFilePath) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    
    const headers = Object.keys(jsonData[0]);
    worksheet.addRow(headers); // Añadir encabezados
    
    jsonData.forEach(row => {
        worksheet.addRow(Object.values(row)); // Añadir datos fila por fila
    });

    await workbook.xlsx.writeFile(outputFilePath);
    console.log(`Excel file created from JSON at ${outputFilePath}`);
}

module.exports = { convertJsonToExcel };
