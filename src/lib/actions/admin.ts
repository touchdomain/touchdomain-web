'use server';

import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireAdmin, getServiceClient, fail, type ActionResult } from '@/lib/auth-helpers';
import { createDriveFolder, getGoogleDriveClient } from '@/lib/gdrive';
import { sendPortalInvite } from '@/lib/mailer';
import { SITE_URL } from '@/lib/site';
import type { Database, UserRole } from '@/lib/database.types';

type Admin = SupabaseClient<Database>;

/**
 * Provision a portal user (or reuse an existing one), then email them a link
 * to set their password. Returns whether the invite email actually went out.
 */
async function provisionUser(
  admin: Admin,
  opts: { email: string; fullName: string; role: UserRole; companyName?: string; phone?: string }
): Promise<{ userId: string; invited: boolean; note?: string }> {
  const email = opts.email.trim().toLowerCase();

  // Create the auth user. If they already exist, look up their id instead.
  let userId: string;
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      full_name: opts.fullName,
      role: opts.role,
      ...(opts.companyName ? { company_name: opts.companyName } : {}),
    },
  });
  if (createErr || !created?.user) {
    // Already registered — find them.
    const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const users = (list?.users ?? []) as Array<{ id: string; email?: string | null }>;
    const existing = users.find((u) => u.email?.toLowerCase() === email);
    if (!existing) throw createErr ?? new Error('Could not provision user');
    userId = existing.id;
  } else {
    userId = created.user.id;
  }

  // handle_new_user() seeds the profile row; make sure it reflects the inputs.
  await admin
    .from('profiles')
    .update({
      full_name: opts.fullName,
      role: opts.role,
      phone: opts.phone ?? null,
      company_name: opts.companyName ?? null,
    })
    .eq('id', userId);

  // Generate a password-set link and email it ourselves (we don't rely on
  // Supabase's built-in mailer, which only reaches project members on free).
  let invited = false;
  let note: string | undefined;
  try {
    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${SITE_URL}/set-password` },
    });
    if (linkErr) throw linkErr;
    const actionLink = link.properties?.action_link;
    if (!actionLink) throw new Error('No action link returned');
    await sendPortalInvite({ to: email, name: opts.fullName, link: actionLink, role: opts.role });
    invited = true;
  } catch (e) {
    note = `Account is ready, but the invite email failed (${e instanceof Error ? e.message : 'unknown'}). Use "Resend invite".`;
  }

  return { userId, invited, note };
}

export interface CreateClientInput {
  email: string;
  fullName: string;
  companyName: string;
  phone?: string;
}

export async function createClientAccount(
  input: CreateClientInput
): Promise<ActionResult<{ userId: string; invited: boolean; note?: string }>> {
  try {
    await requireAdmin();
    const admin = getServiceClient();
    const result = await provisionUser(admin, {
      email: input.email,
      fullName: input.fullName,
      companyName: input.companyName,
      phone: input.phone,
      role: 'client',
    });
    revalidatePath('/admin/clients');
    revalidatePath('/admin');
    return { success: true, data: result, error: result.note };
  } catch (error) {
    return fail(error, 'Failed to create client');
  }
}

export async function createAdminAccount(input: {
  email: string;
  fullName: string;
}): Promise<ActionResult<{ userId: string; invited: boolean; note?: string }>> {
  try {
    await requireAdmin();
    const admin = getServiceClient();
    const result = await provisionUser(admin, {
      email: input.email,
      fullName: input.fullName,
      role: 'admin',
    });
    revalidatePath('/admin/clients');
    return { success: true, data: result, error: result.note };
  } catch (error) {
    return fail(error, 'Failed to create admin');
  }
}

/**
 * Re-send the set-password email to an existing portal user. Always returns
 * the raw link too, so the admin can send it manually if email delivery is
 * unavailable (e.g. no SMTP configured locally).
 */
export async function resendInvite(
  userId: string
): Promise<ActionResult<{ link: string; emailed: boolean }>> {
  try {
    await requireAdmin();
    const admin = getServiceClient();

    const { data: profile } = await admin
      .from('profiles')
      .select('email, full_name, role')
      .eq('id', userId)
      .maybeSingle();
    if (!profile) return { success: false, error: 'User not found.' };

    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: profile.email,
      options: { redirectTo: `${SITE_URL}/set-password` },
    });
    if (linkErr) throw linkErr;
    const actionLink = link.properties?.action_link;
    if (!actionLink) throw new Error('No action link returned');

    let emailed = false;
    try {
      await sendPortalInvite({
        to: profile.email,
        name: profile.full_name,
        link: actionLink,
        role: profile.role,
      });
      emailed = true;
    } catch {
      // fall through — caller still gets the link to share manually
    }

    return { success: true, data: { link: actionLink, emailed } };
  } catch (error) {
    return fail(error, 'Failed to resend invite');
  }
}

/**
 * Permanently delete a user and all their portal data (POPIA erasure).
 * profiles → projects → onboarding / milestones / invoices / files /
 * payment_milestones all cascade via ON DELETE CASCADE. Drive files are
 * best-effort removed first.
 *
 * NOTE: this also removes invoice records. SARS requires tax records to be
 * kept for 5 years — export the invoice PDFs from Drive before deleting a
 * client you have billed.
 */
export async function deleteUserAccount(userId: string): Promise<ActionResult> {
  try {
    const me = await requireAdmin();
    if (userId === me.id) {
      return { success: false, error: 'You cannot delete your own account.' };
    }
    const admin = getServiceClient();

    // Best-effort: remove the client's Drive files.
    const { data: files } = await admin
      .from('client_files')
      .select('drive_file_id')
      .eq('client_id', userId);
    if (files?.length) {
      try {
        const drive = getGoogleDriveClient();
        await Promise.allSettled(
          files.map((f) => drive.files.delete({ fileId: f.drive_file_id, supportsAllDrives: true }))
        );
      } catch {
        // ignore — DB erasure is the compliance-critical part
      }
    }

    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) throw error;

    revalidatePath('/admin/clients');
    revalidatePath('/admin');
    revalidatePath('/admin/projects');
    return { success: true };
  } catch (error) {
    return fail(error, 'Failed to delete account');
  }
}

/** Promote or demote a user. */
export async function setUserRole(userId: string, role: UserRole): Promise<ActionResult> {
  try {
    const me = await requireAdmin();
    if (userId === me.id && role !== 'admin') {
      return { success: false, error: 'You cannot remove your own admin access.' };
    }
    const admin = getServiceClient();
    const { error } = await admin.from('profiles').update({ role }).eq('id', userId);
    if (error) throw error;
    revalidatePath('/admin/clients');
    return { success: true };
  } catch (error) {
    return fail(error, 'Failed to change role');
  }
}

/**
 * Ensure the client has a company-level folder in the Shared Drive and return
 * its id, caching it on profiles.drive_folder_id. Throws if Drive isn't
 * configured or the Google API rejects the call.
 */
async function ensureClientFolder(admin: Admin, clientId: string): Promise<string> {
  const { data: profile } = await admin
    .from('profiles')
    .select('company_name, full_name, drive_folder_id')
    .eq('id', clientId)
    .maybeSingle();
  if (!profile) throw new Error('Client not found');
  if (profile.drive_folder_id) return profile.drive_folder_id;

  const folderName = (profile.company_name || profile.full_name || 'Client').trim();
  const folderId = await createDriveFolder(folderName);
  await admin.from('profiles').update({ drive_folder_id: folderId }).eq('id', clientId);
  return folderId;
}

/**
 * Create (or repair) the Drive folder structure for an existing project:
 * <Shared Drive>/<Company>/<Project>/. Surfaces the real error so Drive
 * misconfiguration is visible rather than silently skipped.
 */
export async function syncProjectDriveFolder(
  projectId: string
): Promise<ActionResult<{ folderId: string }>> {
  try {
    await requireAdmin();
    const admin = getServiceClient();

    const { data: project } = await admin
      .from('projects')
      .select('id, title, client_id, google_drive_folder_id')
      .eq('id', projectId)
      .maybeSingle();
    if (!project) return { success: false, error: 'Project not found' };
    if (project.google_drive_folder_id) {
      return { success: true, data: { folderId: project.google_drive_folder_id } };
    }

    const companyFolder = await ensureClientFolder(admin, project.client_id);
    const folderId = await createDriveFolder(project.title, companyFolder);

    const { error } = await admin
      .from('projects')
      .update({ google_drive_folder_id: folderId })
      .eq('id', projectId);
    if (error) throw error;

    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true, data: { folderId } };
  } catch (error) {
    return fail(error, 'Failed to create the Drive folder');
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

    // Files are organised <Shared Drive>/<Company>/<Project>. If no folder id
    // was supplied, create the project folder inside the client's company
    // folder (creating that too if needed). Non-fatal on failure.
    let folderId = input.googleDriveFolderId?.trim() || null;
    if (!folderId) {
      try {
        const companyFolder = await ensureClientFolder(admin, input.clientId);
        folderId = await createDriveFolder(input.title, companyFolder);
      } catch (e) {
        console.error('Project Drive folder not created:', e);
        folderId = null; // repair later via syncProjectDriveFolder
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
