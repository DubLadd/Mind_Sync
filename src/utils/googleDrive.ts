import { getCachedAccessToken, signInWithGoogle } from '../firebase';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
}

/**
 * Returns the active in-memory cached OAuth token, or initiates Google Sign-In with Drive scopes
 */
export async function ensureDriveAccessToken(): Promise<string> {
  const currentToken = getCachedAccessToken();
  if (currentToken) return currentToken;

  // Prompt Google Sign-In with popup to acquire token
  const result = await signInWithGoogle();
  if (!result.accessToken) {
    throw new Error('Could not acquire Google Drive access token.');
  }
  return result.accessToken;
}

/**
 * Lists files from user's Google Drive
 */
export async function listDriveFiles(
  searchQuery?: string,
  pageSize: number = 30
): Promise<GoogleDriveFile[]> {
  const token = await ensureDriveAccessToken();

  let q = "trashed = false";
  if (searchQuery && searchQuery.trim()) {
    const sanitized = searchQuery.replace(/'/g, "\\'");
    q += ` and name contains '${sanitized}'`;
  }

  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('q', q);
  url.searchParams.set('pageSize', String(pageSize));
  url.searchParams.set(
    'fields',
    'files(id, name, mimeType, size, modifiedTime, webViewLink, iconLink)'
  );
  url.searchParams.set('orderBy', 'modifiedTime desc');

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Drive API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Reads content of a file from Google Drive
 */
export async function fetchDriveFileContent(
  fileId: string,
  mimeType: string
): Promise<{ content: string; isBinary: boolean; dataUrl?: string }> {
  const token = await ensureDriveAccessToken();

  // If it's a native Google Doc, export as plain text
  if (mimeType === 'application/vnd.google-apps.document') {
    const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
    const res = await fetch(exportUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to export Google Doc: ${res.statusText}`);
    const text = await res.text();
    return { content: text, isBinary: false };
  }

  // If it's a native Google Sheet, export as CSV
  if (mimeType === 'application/vnd.google-apps.spreadsheet') {
    const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`;
    const res = await fetch(exportUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to export Google Sheet: ${res.statusText}`);
    const text = await res.text();
    return { content: text, isBinary: false };
  }

  // Regular files (code, text, audio, images)
  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Failed to download file from Drive: ${res.statusText}`);

  if (mimeType.startsWith('image/') || mimeType.startsWith('audio/')) {
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.readAsDataURL(blob);
    });
    return { content: '', isBinary: true, dataUrl };
  }

  const text = await res.text();
  return { content: text, isBinary: false };
}

/**
 * Creates/uploads a new file to Google Drive using multipart upload
 */
export async function uploadFileToDrive(
  name: string,
  content: string,
  mimeType: string = 'text/plain'
): Promise<GoogleDriveFile> {
  const token = await ensureDriveAccessToken();

  const metadata = {
    name,
    mimeType,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to upload to Google Drive: ${errText}`);
  }

  return await res.json();
}

/**
 * Deletes a file from Google Drive
 * IMPORTANT: MUST ONLY be called after explicit user confirmation in UI
 */
export async function deleteFileFromDrive(fileId: string): Promise<void> {
  const token = await ensureDriveAccessToken();

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(`Failed to delete file from Google Drive: ${errText}`);
  }
}
