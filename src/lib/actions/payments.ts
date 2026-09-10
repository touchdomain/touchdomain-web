'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, getServiceClient, fail, type ActionResult } from '@/lib/auth-helpers';
import { statusForPayment, type DraftMilestone } from '@/lib/payment-schedule';
import type { PaymentStatus } from '@/lib/database.types';

const LOCKED: PaymentStatus[] = ['invoiced', 'partial', 'paid'];

function paths(projectId: string) {
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/invoices');
}

/**
 * Replace a project's payment schedule. Refuses if any existing installment
 * has already been invoiced or (part-)paid — those must be edited individually.
 */
export async function savePaymentSchedule(
  projectId: string,
  totalFeeZar: number,
  rows: DraftMilestone[]
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const admin = getServiceClient();

    if (!Number.isFinite(totalFeeZar) || totalFeeZar <= 0) {
      return { success: false, error: 'Enter a project total greater than zero.' };
    }
    if (!rows.length) return { success: false, error: 'Add at least one installment.' };

    const { data: existing, error: exErr } = await admin
      .from('payment_milestones')
      .select('id, status')
      .eq('project_id', projectId);
    if (exErr) throw exErr;

    if ((existing ?? []).some((m) => LOCKED.includes(m.status))) {
      return {
        success: false,
        error: 'Some installments are already invoiced or paid. Edit those rows individually instead of regenerating.',
      };
    }

    await admin.from('payment_milestones').delete().eq('project_id', projectId);

    const { error: insErr } = await admin.from('payment_milestones').insert(
      rows.map((r, i) => ({
        project_id: projectId,
        label: r.label,
        sort_order: i,
        percentage: r.percentage,
        amount_zar: r.amount_zar,
        due_date: r.due_date,
        status: 'pending' as PaymentStatus,
      }))
    );
    if (insErr) throw insErr;

    const { error: projErr } = await admin
      .from('projects')
      .update({ total_fee_zar: totalFeeZar })
      .eq('id', projectId);
    if (projErr) throw projErr;

    paths(projectId);
    return { success: true };
  } catch (error) {
    return fail(error, 'Failed to save payment schedule');
  }
}

/** Record the running total paid against one installment (absolute, not a delta). */
export async function recordPayment(
  milestoneId: string,
  amountPaidZar: number
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const admin = getServiceClient();

    if (!Number.isFinite(amountPaidZar) || amountPaidZar < 0) {
      return { success: false, error: 'Enter a valid amount.' };
    }

    const { data: m, error: mErr } = await admin
      .from('payment_milestones')
      .select('id, project_id, amount_zar, status, invoice_id')
      .eq('id', milestoneId)
      .maybeSingle();
    if (mErr) throw mErr;
    if (!m) return { success: false, error: 'Installment not found.' };

    const status = statusForPayment(Number(m.amount_zar), amountPaidZar, m.status);
    const { error: updErr } = await admin
      .from('payment_milestones')
      .update({
        amount_paid_zar: amountPaidZar,
        status,
        paid_at: status === 'paid' ? new Date().toISOString() : null,
      })
      .eq('id', milestoneId);
    if (updErr) throw updErr;

    // Keep the linked invoice's status roughly in step.
    if (m.invoice_id) {
      await admin
        .from('invoices')
        .update({ status: status === 'paid' ? 'paid' : 'unpaid' })
        .eq('id', m.invoice_id);
    }

    paths(m.project_id);
    return { success: true };
  } catch (error) {
    return fail(error, 'Failed to record payment');
  }
}

export async function updateMilestone(
  milestoneId: string,
  patch: { label?: string; amount_zar?: number; due_date?: string | null; status?: PaymentStatus }
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const admin = getServiceClient();
    const { data: m } = await admin
      .from('payment_milestones')
      .select('project_id')
      .eq('id', milestoneId)
      .maybeSingle();
    const { error } = await admin.from('payment_milestones').update(patch).eq('id', milestoneId);
    if (error) throw error;
    if (m) paths(m.project_id);
    return { success: true };
  } catch (error) {
    return fail(error, 'Failed to update installment');
  }
}

export async function addMilestone(
  projectId: string,
  row: { label: string; amount_zar: number; due_date?: string | null }
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const admin = getServiceClient();
    const { count } = await admin
      .from('payment_milestones')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId);
    const { error } = await admin.from('payment_milestones').insert({
      project_id: projectId,
      label: row.label,
      amount_zar: row.amount_zar,
      due_date: row.due_date ?? null,
      sort_order: count ?? 0,
      status: 'pending',
    });
    if (error) throw error;
    paths(projectId);
    return { success: true };
  } catch (error) {
    return fail(error, 'Failed to add installment');
  }
}

export async function deleteMilestone(milestoneId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const admin = getServiceClient();
    const { data: m } = await admin
      .from('payment_milestones')
      .select('project_id, status')
      .eq('id', milestoneId)
      .maybeSingle();
    if (m && LOCKED.includes(m.status)) {
      return { success: false, error: 'This installment is invoiced or paid and cannot be deleted.' };
    }
    const { error } = await admin.from('payment_milestones').delete().eq('id', milestoneId);
    if (error) throw error;
    if (m) paths(m.project_id);
    return { success: true };
  } catch (error) {
    return fail(error, 'Failed to delete installment');
  }
}
