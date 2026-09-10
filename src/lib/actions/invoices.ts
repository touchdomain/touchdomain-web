'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, getServiceClient, fail, type ActionResult } from '@/lib/auth-helpers';
import { uploadToDrive } from '@/lib/gdrive';
import type { InvoiceStatus } from '@/lib/database.types';

/**
 * Records an invoice. The PDF is produced client-side (jsPDF) and posted here
 * as a Blob in `formData`; this uploads it to the client's project Drive
 * folder, writes the `invoices` row, and — if `milestoneId` is given — links
 * that installment and marks it `invoiced`.
 *
 * FormData fields: file, clientId, projectId?, milestoneId?, invoiceNumber,
 * amountZar, dueDate, description?, reference?, isTaxInvoice?
 */
export async function createInvoice(
  formData: FormData
): Promise<ActionResult<{ id: string; filed: boolean }>> {
  try {
    await requireAdmin();
    const admin = getServiceClient();

    const file = formData.get('file');
    const clientId = String(formData.get('clientId') || '');
    const projectId = String(formData.get('projectId') || '') || null;
    const milestoneId = String(formData.get('milestoneId') || '') || null;
    const invoiceNumber = String(formData.get('invoiceNumber') || '').trim();
    const amountZar = Number(formData.get('amountZar'));
    const dueDate = String(formData.get('dueDate') || '');
    const description = String(formData.get('description') || '').trim() || null;
    const reference = String(formData.get('reference') || '').trim() || null;
    const isTaxInvoice = String(formData.get('isTaxInvoice') || '') === 'true';

    if (!(file instanceof File)) return { success: false, error: 'Missing invoice PDF' };
    if (!clientId || !invoiceNumber || !dueDate || !Number.isFinite(amountZar) || amountZar <= 0) {
      return { success: false, error: 'Client, invoice number, amount and due date are required' };
    }

    let folderId: string | null = null;
    if (projectId) {
      const { data: project } = await admin
        .from('projects')
        .select('google_drive_folder_id')
        .eq('id', projectId)
        .maybeSingle();
      folderId = project?.google_drive_folder_id ?? null;
    }

    // Best-effort: also file a copy to the project's Drive folder.
    const buffer = Buffer.from(await file.arrayBuffer());
    let driveFileId: string | null = null;
    let pdfError: string | null = null;
    try {
      const uploaded = await uploadToDrive(
        buffer,
        file.name || `${invoiceNumber}.pdf`,
        'application/pdf',
        folderId
      );
      driveFileId = uploaded.id;
    } catch {
      // Drive is optional — Supabase Storage below is the canonical copy.
    }

    const { data, error } = await admin
      .from('invoices')
      .insert({
        client_id: clientId,
        project_id: projectId,
        invoice_number: invoiceNumber,
        amount_zar: amountZar,
        due_date: dueDate,
        description,
        reference,
        is_tax_invoice: isTaxInvoice,
        status: 'unpaid',
        pdf_drive_file_id: driveFileId,
      })
      .select('id')
      .single();
    if (error) throw error;

    // Canonical copy in Supabase Storage — this is what the client downloads.
    let storagePath: string | null = null;
    try {
      const path = `${clientId}/${data.id}.pdf`;
      const { error: upErr } = await admin.storage
        .from('invoices')
        .upload(path, buffer, { contentType: 'application/pdf', upsert: true });
      if (upErr) throw upErr;
      storagePath = path;
      await admin.from('invoices').update({ pdf_storage_path: path }).eq('id', data.id);
    } catch (e) {
      pdfError = e instanceof Error ? e.message : 'storage error';
    }

    if (milestoneId) {
      await admin
        .from('payment_milestones')
        .update({ invoice_id: data.id, status: 'invoiced' })
        .eq('id', milestoneId)
        .eq('status', 'pending');
    }

    revalidatePath('/admin/invoices');
    revalidatePath('/dashboard/invoices');
    revalidatePath('/dashboard');
    if (projectId) revalidatePath(`/admin/projects/${projectId}`);
    const filed = storagePath != null || driveFileId != null;
    return {
      success: true,
      data: { id: data.id, filed },
      error: filed
        ? undefined
        : `Invoice recorded, but the PDF could not be stored (${pdfError ?? 'unknown error'}). Regenerate and attach it manually.`,
    };
  } catch (error) {
    return fail(error, 'Failed to create invoice');
  }
}

export async function setInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const admin = getServiceClient();
    const { error } = await admin.from('invoices').update({ status }).eq('id', invoiceId);
    if (error) throw error;

    // If this invoice bills an installment, reflect paid/unpaid onto it.
    const { data: ms } = await admin
      .from('payment_milestones')
      .select('id, amount_zar')
      .eq('invoice_id', invoiceId)
      .maybeSingle();
    if (ms) {
      await admin
        .from('payment_milestones')
        .update(
          status === 'paid'
            ? { status: 'paid', amount_paid_zar: ms.amount_zar, paid_at: new Date().toISOString() }
            : { status: 'invoiced', amount_paid_zar: 0, paid_at: null }
        )
        .eq('id', ms.id);
    }

    revalidatePath('/admin/invoices');
    revalidatePath('/dashboard/invoices');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return fail(error, 'Failed to update invoice');
  }
}
