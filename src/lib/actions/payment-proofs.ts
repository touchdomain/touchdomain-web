'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin, getServiceClient, fail, type ActionResult } from '@/lib/auth-helpers';
import { uploadToDrive } from '@/lib/gdrive';
import { notifyTeam } from '@/lib/notify';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = /^(image\/(png|jpe?g|webp|heic)|application\/pdf)$/i;

/**
 * Client: upload proof of an EFT/ATM payment against one of their invoices.
 * FormData: file, invoiceId, note?, amountZar?
 */
export async function submitPaymentProof(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Please sign in again.' };

    const file = formData.get('file');
    const invoiceId = String(formData.get('invoiceId') || '');
    const note = String(formData.get('note') || '').trim() || null;
    const amountRaw = String(formData.get('amountZar') || '').trim();
    const amountZar = amountRaw ? Number(amountRaw) : null;

    if (!(file instanceof File)) return { success: false, error: 'Attach a screenshot or PDF.' };
    if (file.size > MAX_BYTES) return { success: false, error: 'File is larger than 10MB.' };
    if (!ALLOWED.test(file.type)) return { success: false, error: 'Use a PNG/JPG image or a PDF.' };
    if (!invoiceId) return { success: false, error: 'Missing invoice.' };

    // RLS: this only returns the invoice if it belongs to the caller.
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, invoice_number')
      .eq('id', invoiceId)
      .maybeSingle();
    if (!invoice) return { success: false, error: 'Invoice not found.' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('drive_folder_id, full_name, company_name')
      .eq('id', user.id)
      .maybeSingle();

    const ext = file.type === 'application/pdf' ? 'pdf' : (file.name.split('.').pop() || 'jpg');
    const fileName = `POP ${invoice.invoice_number} — ${new Date().toISOString().slice(0, 10)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadToDrive(buffer, fileName, file.type, profile?.drive_folder_id ?? null);

    const { error } = await supabase.from('payment_proofs').insert({
      invoice_id: invoiceId,
      client_id: user.id,
      drive_file_id: uploaded.id,
      file_name: fileName,
      mime_type: file.type,
      view_link: uploaded.viewLink,
      note,
      amount_zar: amountZar != null && Number.isFinite(amountZar) ? amountZar : null,
    });
    if (error) throw error;

    await notifyTeam.paymentProofSubmitted(profile?.company_name || profile?.full_name || 'A client', invoice.invoice_number);

    revalidatePath('/dashboard/invoices');
    revalidatePath('/admin/invoices');
    return { success: true };
  } catch (error) {
    return fail(error, 'Could not upload your proof of payment');
  }
}

/** Admin: mark a proof as reviewed (after recording the payment). */
export async function markProofReviewed(proofId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const admin = getServiceClient();
    const { error } = await admin.from('payment_proofs').update({ reviewed: true }).eq('id', proofId);
    if (error) throw error;
    revalidatePath('/admin/invoices');
    revalidatePath('/dashboard/invoices');
    return { success: true };
  } catch (error) {
    return fail(error, 'Failed to update the proof');
  }
}
