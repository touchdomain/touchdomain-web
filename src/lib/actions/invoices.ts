'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, getServiceClient, fail, type ActionResult } from '@/lib/auth-helpers';
import { uploadToDrive } from '@/lib/gdrive';
import type { InvoiceStatus } from '@/lib/database.types';

/**
 * Records an invoice. The generated PDF is produced client-side (jsPDF) and
 * posted here as a Blob in `formData`; this uploads it to the client's
 * project Drive folder and writes the `invoices` row.
 */
export async function createInvoice(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const admin = getServiceClient();

    const file = formData.get('file');
    const clientId = String(formData.get('clientId') || '');
    const projectId = String(formData.get('projectId') || '') || null;
    const invoiceNumber = String(formData.get('invoiceNumber') || '').trim();
    const amountZar = Number(formData.get('amountZar'));
    const dueDate = String(formData.get('dueDate') || '');

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

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadToDrive(
      buffer,
      file.name || `${invoiceNumber}.pdf`,
      'application/pdf',
      folderId
    );

    const { data, error } = await admin
      .from('invoices')
      .insert({
        client_id: clientId,
        invoice_number: invoiceNumber,
        amount_zar: amountZar,
        due_date: dueDate,
        status: 'unpaid',
        pdf_drive_file_id: uploaded.id,
      })
      .select('id')
      .single();
    if (error) throw error;

    revalidatePath('/admin/invoices');
    revalidatePath('/dashboard/invoices');
    if (projectId) revalidatePath(`/admin/projects/${projectId}`);
    return { success: true, data: { id: data.id } };
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
    revalidatePath('/admin/invoices');
    revalidatePath('/dashboard/invoices');
    return { success: true };
  } catch (error) {
    return fail(error, 'Failed to update invoice');
  }
}
