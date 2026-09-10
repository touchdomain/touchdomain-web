'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, getServiceClient, fail, type ActionResult } from '@/lib/auth-helpers';
import { createDriveFolder } from '@/lib/gdrive';

export interface CreateClientInput {
  email: string;
  fullName: string;
  companyName: string;
  phone?: string;
}

export async function createClientAccount(
  input: CreateClientInput
): Promise<ActionResult<{ userId: string }>> {
  try {
    await requireAdmin();
    const admin = getServiceClient();

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: input.email,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName,
        company_name: input.companyName,
        role: 'client',
      },
    });
    if (authError) throw authError;

    const userId = authData.user.id;

    // handle_new_user() already inserted the profile row; fill in the phone
    // (which the trigger doesn't carry). Idempotent.
    const { error: profileError } = await admin
      .from('profiles')
      .update({
        phone: input.phone ?? null,
        company_name: input.companyName,
        full_name: input.fullName,
      })
      .eq('id', userId);
    if (profileError) throw profileError;

    revalidatePath('/admin/clients');
    revalidatePath('/admin');
    return { success: true, data: { userId } };
  } catch (error) {
    return fail(error, 'Failed to create client');
  }
}

export interface CreateProjectInput {
  clientId: string;
  title: string;
  description?: string;
  targetLaunchDate?: string;
  googleDriveFolderId?: string;
}

export async function createProject(
  input: CreateProjectInput
): Promise<ActionResult<{ projectId: string }>> {
  try {
    await requireAdmin();
    const admin = getServiceClient();

    // If no folder id was supplied, try to auto-create one under the configured
    // parent folder. Falls back to null (files then land in the parent root).
    let folderId = input.googleDriveFolderId?.trim() || null;
    if (!folderId) {
      try {
        folderId = await createDriveFolder(input.title);
      } catch {
        folderId = null; // non-fatal — admin can set a folder id later
      }
    }

    const { data, error } = await admin
      .from('projects')
      .insert({
        client_id: input.clientId,
        title: input.title,
        description: input.description ?? null,
        target_launch_date: input.targetLaunchDate ?? null,
        google_drive_folder_id: folderId,
      })
      .select('id')
      .single();
    if (error) throw error;

    // on_project_created trigger seeds the blank project_onboarding row.
    revalidatePath('/admin');
    revalidatePath('/admin/clients');
    revalidatePath('/admin/projects');
    return { success: true, data: { projectId: data.id } };
  } catch (error) {
    return fail(error, 'Failed to create project');
  }
}
