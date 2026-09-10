'use server';

import { createClient as createServiceClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

/** Throws unless the current session belongs to an admin. */
async function requireAdmin(): Promise<void> {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') throw new Error('Forbidden — admin access required');
}

/** Service-role client — bypasses RLS. Only ever used after requireAdmin(). */
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing Supabase service-role environment variables');
  return createServiceClient<Database>(url, serviceKey, { auth: { persistSession: false } });
}

export interface CreateClientInput {
  email: string;
  fullName: string;
  companyName: string;
  phone?: string;
}

export async function createClientAccount(input: CreateClientInput): Promise<ActionResult<{ userId: string }>> {
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

    // The handle_new_user trigger already inserted the profile row; this fills
    // in the phone (which the trigger doesn't carry) and is idempotent.
    const { error: profileError } = await admin
      .from('profiles')
      .update({ phone: input.phone ?? null, company_name: input.companyName, full_name: input.fullName })
      .eq('id', userId);
    if (profileError) throw profileError;

    revalidatePath('/admin/clients');
    return { success: true, data: { userId } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create client';
    console.error('Create Client Error:', error);
    return { success: false, error: message };
  }
}

export interface CreateProjectInput {
  clientId: string;
  title: string;
  description?: string;
  targetLaunchDate?: string;
  googleDriveFolderId?: string;
}

export async function createProject(input: CreateProjectInput): Promise<ActionResult<{ projectId: string }>> {
  try {
    await requireAdmin();
    const admin = getServiceClient();

    const { data, error } = await admin
      .from('projects')
      .insert({
        client_id: input.clientId,
        title: input.title,
        description: input.description ?? null,
        target_launch_date: input.targetLaunchDate ?? null,
        google_drive_folder_id: input.googleDriveFolderId ?? null,
      })
      .select('id')
      .single();
    if (error) throw error;

    // on_project_created trigger seeds the blank project_onboarding row.
    revalidatePath('/admin');
    revalidatePath('/admin/clients');
    return { success: true, data: { projectId: data.id } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create project';
    console.error('Create Project Error:', error);
    return { success: false, error: message };
  }
}
