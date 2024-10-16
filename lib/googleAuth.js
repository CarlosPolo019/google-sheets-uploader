const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function authenticate(credentialsPath) {
    if (!fs.existsSync(credentialsPath)) {
        throw new Error(`The credentials file does not exist at ${credentialsPath}.`);
    }

    const auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
    });

    return await auth.getClient();
}

module.exports = { authenticate };