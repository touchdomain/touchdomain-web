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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Retry a Drive/Google call a few times on transient network failures
 * (DNS / reset / timeout reaching googleapis.com). Rewrites the opaque
 * "request to https://oauth2.googleapis.com/token failed" into something
 * actionable.
 */
export async function withDriveRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const transient =
        /failed, reason|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|socket hang up|network|fetch failed/i.test(msg);
      if (!transient || i === attempts - 1) break;
      await sleep(400 * (i + 1));
    }
  }
  const msg = lastErr instanceof Error ? lastErr.message : String(lastErr);
  if (/oauth2\.googleapis\.com\/token failed|fetch failed|ENOTFOUND|EAI_AGAIN/i.test(msg)) {
    throw new Error(
      'Could not reach Google (oauth2.googleapis.com). This machine’s network is blocking or dropping the connection — try again, use a different network, or run it on the deployed site.'
    );
  }
  throw lastErr;
}

export interface DriveUploadResult {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number | null;
  viewLink: string | null;
  downloadLink: string | null;
}

export class DriveNotConfiguredError extends Error {
  constructor() {
    super('GOOGLE_DRIVE_PARENT_FOLDER_ID is not set — no Shared Drive to create folders in.');
    this.name = 'DriveNotConfiguredError';
  }
}

/**
 * Create a folder in Drive and return its id. `parentId` defaults to
 * GOOGLE_DRIVE_PARENT_FOLDER_ID (must be a Shared Drive or a folder the
 * service account can write to). Throws DriveNotConfiguredError when no
 * parent is configured, and rethrows Google API errors.
 */
export async function createDriveFolder(
  name: string,
  parentId?: string | null
): Promise<string> {
  const parent = (parentId || process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID || '').trim();
  if (!parent) throw new DriveNotConfiguredError();

  const drive = getGoogleDriveClient();
  const data = await withDriveRetry(async () => {
    const res = await drive.files.create({
      requestBody: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parent],
      },
      fields: 'id',
      supportsAllDrives: true,
    });
    return res.data;
  });
  if (!data.id) throw new Error('Drive folder creation returned no id');
  return data.id;
}

/** Fetch a Drive file's bytes (service account must have access). */
export async function downloadFromDrive(fileId: string): Promise<Buffer> {
  const drive = getGoogleDriveClient();
  const res = await withDriveRetry(() =>
    drive.files.get({ fileId, alt: 'media', supportsAllDrives: true }, { responseType: 'arraybuffer' })
  );
  return Buffer.from(res.data as ArrayBuffer);
}

/** Upload a buffer to Drive, optionally into a specific folder. */
export async function uploadToDrive(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId?: string | null
): Promise<DriveUploadResult> {
  const drive = getGoogleDriveClient();
  const parent = folderId || process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID || undefined;

  const data = await withDriveRetry(async () => {
    // Fresh stream per attempt — a consumed Readable can't be re-sent.
    const stream = Readable.from(buffer);
    const res = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: parent ? [parent] : undefined,
      },
      media: { mimeType, body: stream },
      fields: 'id, name, mimeType, size, webViewLink, webContentLink',
      supportsAllDrives: true,
    });
    return res.data;
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
