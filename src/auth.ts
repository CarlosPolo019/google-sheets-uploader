import { google, type Auth } from 'googleapis';
import fs from 'node:fs';
import type { Credentials, ServiceAccountCredentials } from './types.js';
import { AuthenticationError } from './errors.js';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.readonly',
];

export async function authenticate(credentials: Credentials): Promise<Auth.OAuth2Client | Auth.GoogleAuth> {
  // Already a GoogleAuth instance — pass through
  if (credentials && typeof credentials === 'object' && 'getClient' in credentials) {
    return credentials as Auth.GoogleAuth;
  }

  // Credentials object (parsed JSON)
  if (typeof credentials === 'object' && credentials !== null) {
    const creds = credentials as ServiceAccountCredentials;
    if (!creds.client_email || !creds.private_key) {
      throw new AuthenticationError(
        'Invalid credentials object. Must contain "client_email" and "private_key" fields.',
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: SCOPES,
    });

    return auth;
  }

  // File path
  if (typeof credentials === 'string') {
    if (!fs.existsSync(credentials)) {
      throw new AuthenticationError(
        `Credentials file not found at "${credentials}". Ensure the file exists and the path is correct.`,
      );
    }

    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: credentials,
        scopes: SCOPES,
      });
      // Verify the credentials are valid by getting the client
      await auth.getClient();
      return auth;
    } catch (error) {
      throw new AuthenticationError(
        `Failed to authenticate with credentials at "${credentials}".`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  throw new AuthenticationError(
    'Invalid credentials. Provide a file path (string), a credentials object, or a GoogleAuth instance.',
  );
}
