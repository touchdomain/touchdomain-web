import { google, type drive_v3 } from 'googleapis';
import { Readable } from 'stream';

/**
 * Google Drive v3 client authenticated as the service account.
 *
 * Scope `drive.file` restricts the service account to files it creates. The
 * GOOGLE_DRIVE_PARENT_FOLDER_ID folder must be shared with the service
 * account email for uploads into it to work.
 */
export function getGoogleDriveClient(): drive_v3.Drive {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!email || !key) {
    throw new Error('Missing GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY');
  }

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  return google.drive({ version: 'v3', auth });
}

export interface DriveUploadResult {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number | null;
  viewLink: string | null;
  downloadLink: string | null;
}

/** Upload a buffer to Drive, optionally into a specific folder. */
export async function uploadToDrive(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId?: string | null
): Promise<DriveUploadResult> {
  const drive = getGoogleDriveClient();

  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const parent = folderId || process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID || undefined;

  const { data } = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: parent ? [parent] : undefined,
    },
    media: { mimeType, body: stream },
    fields: 'id, name, mimeType, size, webViewLink, webContentLink',
  });

  if (!data.id) throw new Error('Drive upload returned no file id');

  return {
    id: data.id,
    name: data.name ?? fileName,
    mimeType: data.mimeType ?? mimeType,
    sizeBytes: data.size ? Number(data.size) : buffer.length,
    viewLink: data.webViewLink ?? null,
    downloadLink: data.webContentLink ?? null,
  };
}
