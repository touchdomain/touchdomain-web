'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, getServiceClient, fail, type ActionResult } from '@/lib/auth-helpers';
import { getGoogleDriveClient } from '@/lib/gdrive';

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
      await getGoogleDriveClient().files.delete({ fileId: file.drive_file_id });
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
