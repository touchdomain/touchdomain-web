'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, getServiceClient, fail, type ActionResult } from '@/lib/auth-helpers';
import { getGoogleDriveClient, uploadToDrive } from '@/lib/gdrive';

/**
 * Admin: file a generated document (contract, etc.) into a client's portal.
 * Uploads to their Drive folder and records a client_files row so it shows
 * in their Files tab. FormData: file, clientId, projectId?, label?
 */
export async function fileDocumentToClient(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const admin = getServiceClient();

    const file = formData.get('file');
    const clientId = String(formData.get('clientId') || '');
    const projectId = String(formData.get('projectId') || '') || null;
    const label = String(formData.get('label') || '').trim();
    if (!(file instanceof File)) return { success: false, error: 'Missing file' };
    if (!clientId) return { success: false, error: 'Pick a client' };

    let folderId: string | null = null;
    if (projectId) {
      const { data: p } = await admin.from('projects').select('google_drive_folder_id').eq('id', projectId).maybeSingle();
      folderId = p?.google_drive_folder_id ?? null;
    }
    if (!folderId) {
      const { data: prof } = await admin.from('profiles').select('drive_folder_id').eq('id', clientId).maybeSingle();
      folderId = prof?.drive_folder_id ?? null;
    }

    const name = label || file.name || 'Document.pdf';
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadToDrive(buffer, name.endsWith('.pdf') ? name : `${name}.pdf`, 'application/pdf', folderId);

    const { error } = await admin.from('client_files').insert({
      client_id: clientId,
      project_id: projectId,
      file_name: name,
      mime_type: 'application/pdf',
      drive_file_id: uploaded.id,
      file_size_bytes: uploaded.sizeBytes,
      view_link: uploaded.viewLink,
      download_link: uploaded.downloadLink,
    });
    if (error) throw error;

    revalidatePath('/dashboard/files');
    if (projectId) revalidatePath(`/admin/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    return fail(error, 'Failed to file the document');
  }
}

/** Admin-only: remove a client file record and its Drive object. */
export async function deleteClientFile(fileId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const admin = getServiceClient();

    const { data: file, error } = await admin
      .from('client_files')
      .select('drive_file_id, project_id')
      .eq('id', fileId)
      .single();
    if (error) throw error;

    try {
      await getGoogleDriveClient().files.delete({ fileId: file.drive_file_id, supportsAllDrives: true });
    } catch (driveErr) {
      console.warn('Drive delete failed (continuing to remove the row):', driveErr);
    }

    const { error: delErr } = await admin.from('client_files').delete().eq('id', fileId);
    if (delErr) throw delErr;

    revalidatePath('/dashboard/files');
    if (file.project_id) revalidatePath(`/admin/projects/${file.project_id}`);
    return { success: true };
  } catch (error) {
    return fail(error, 'Failed to delete file');
  }
}
