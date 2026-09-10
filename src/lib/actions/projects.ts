'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, getServiceClient, fail, type ActionResult } from '@/lib/auth-helpers';
import type { ProjectStatus } from '@/lib/database.types';

/** Admin: unlock a submitted questionnaire so the client can edit again. */
export async function reopenOnboarding(clientId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const admin = getServiceClient();
    const { error } = await admin
      .from('project_onboarding')
      .update({ status: 'in_progress', submitted_at: null })
      .eq('client_id', clientId);
    if (error) throw error;
    revalidatePath('/dashboard/onboarding');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return fail(error, 'Failed to reopen onboarding');
  }
}

export async function setMilestoneComplete(
  milestoneId: string,
  complete: boolean
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const admin = getServiceClient();

    const { data: m, error: e1 } = await admin
      .from('milestones')
      .update({
        is_completed: complete,
        completed_at: complete ? new Date().toISOString() : null,
      })
      .eq('id', milestoneId)
      .select('project_id')
      .single();
    if (e1) throw e1;

    await recalcProgress(admin, m.project_id);
    revalidatePath(`/admin/projects/${m.project_id}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return fail(error, 'Failed to update milestone');
  }
}

export async function addMilestone(
  projectId: string,
  title: string,
  dueDate?: string
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const admin = getServiceClient();
    const { error } = await admin.from('milestones').insert({
      project_id: projectId,
      title,
      due_date: dueDate || null,
    });
    if (error) throw error;
    await recalcProgress(admin, projectId);
    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    return fail(error, 'Failed to add milestone');
  }
}

export async function deleteMilestone(milestoneId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const admin = getServiceClient();
    const { data: m, error } = await admin
      .from('milestones')
      .delete()
      .eq('id', milestoneId)
      .select('project_id')
      .single();
    if (error) throw error;
    await recalcProgress(admin, m.project_id);
    revalidatePath(`/admin/projects/${m.project_id}`);
    return { success: true };
  } catch (error) {
    return fail(error, 'Failed to delete milestone');
  }
}

export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const admin = getServiceClient();
    const { error } = await admin.from('projects').update({ status }).eq('id', projectId);
    if (error) throw error;
    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return fail(error, 'Failed to update project status');
  }
}

// Progress = share of milestones completed.
async function recalcProgress(
  admin: ReturnType<typeof getServiceClient>,
  projectId: string
) {
  const { data } = await admin
    .from('milestones')
    .select('is_completed')
    .eq('project_id', projectId);
  const total = data?.length ?? 0;
  const done = data?.filter((m) => m.is_completed).length ?? 0;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  await admin.from('projects').update({ progress_percentage: pct }).eq('id', projectId);
}
