'use server';

import { createHash } from 'crypto';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin, getServiceClient, fail, type ActionResult } from '@/lib/auth-helpers';
import { uploadToDrive, downloadFromDrive } from '@/lib/gdrive';
import { generateSignatureCertificate, mergeExecutedContract } from '@/lib/pdf/certificate';

function clientIp(): string {
  const h = headers();
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    ''
  );
}

const sha256 = (buf: Buffer) => createHash('sha256').update(buf).digest('hex');

async function driveFolderFor(admin: ReturnType<typeof getServiceClient>, clientId: string, projectId: string | null) {
  if (projectId) {
    const { data: p } = await admin.from('projects').select('google_drive_folder_id').eq('id', projectId).maybeSingle();
    if (p?.google_drive_folder_id) return p.google_drive_folder_id;
  }
  const { data: prof } = await admin.from('profiles').select('drive_folder_id').eq('id', clientId).maybeSingle();
  return prof?.drive_folder_id ?? null;
}

async function recordClientFile(
  admin: ReturnType<typeof getServiceClient>,
  clientId: string,
  projectId: string | null,
  name: string,
  driveId: string,
  viewLink: string | null,
  downloadLink: string | null,
  bytes: number | null
) {
  await admin.from('client_files').insert({
    client_id: clientId,
    project_id: projectId,
    file_name: name,
    mime_type: 'application/pdf',
    drive_file_id: driveId,
    file_size_bytes: bytes,
    view_link: viewLink,
    download_link: downloadLink,
  });
}

/**
 * Admin: file a generated contract PDF to the client's portal for signature.
 * FormData: file, clientId, projectId?, docType, title
 */
export async function sendContractForSignature(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const admin = getServiceClient();

    const file = formData.get('file');
    const clientId = String(formData.get('clientId') || '');
    const projectId = String(formData.get('projectId') || '') || null;
    const docType = String(formData.get('docType') || 'sa');
    const title = String(formData.get('title') || 'Agreement').trim();
    if (!(file instanceof File)) return { success: false, error: 'Missing contract PDF' };
    if (!clientId) return { success: false, error: 'Pick a client' };

    const buffer = Buffer.from(await file.arrayBuffer());
    const folderId = await driveFolderFor(admin, clientId, projectId);
    const fileName = `${title} (unsigned).pdf`;
    const uploaded = await uploadToDrive(buffer, fileName, 'application/pdf', folderId);

    const { data, error } = await admin
      .from('contracts')
      .insert({
        client_id: clientId,
        project_id: projectId,
        doc_type: docType,
        title,
        status: 'sent',
        source_drive_file_id: uploaded.id,
        source_pdf_sha256: sha256(buffer),
      })
      .select('id')
      .single();
    if (error) throw error;

    await recordClientFile(admin, clientId, projectId, fileName, uploaded.id, uploaded.viewLink, uploaded.downloadLink, uploaded.sizeBytes);

    revalidatePath('/admin/contracts');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/contracts');
    return { success: true, data: { id: data.id } };
  } catch (error) {
    return fail(error, 'Failed to send the contract');
  }
}

/** Client: sign a contract that is awaiting their signature. */
export async function signContractAsClient(
  contractId: string,
  input: { signerName: string; consent: boolean; signaturePng?: string | null }
): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Please sign in again.' };
    if (!input.consent) return { success: false, error: 'Tick the consent box to sign.' };
    if (input.signerName.trim().length < 3) return { success: false, error: 'Enter your full legal name.' };

    // RLS: only returns the row if it belongs to this client.
    const { data: contract } = await supabase
      .from('contracts')
      .select('id, status')
      .eq('id', contractId)
      .maybeSingle();
    if (!contract) return { success: false, error: 'Contract not found.' };
    if (contract.status !== 'sent') return { success: false, error: 'This contract is not awaiting your signature.' };

    const png = input.signaturePng && input.signaturePng.length < 200_000 ? input.signaturePng : null;

    const admin = getServiceClient();
    const { error } = await admin
      .from('contracts')
      .update({
        status: 'client_signed',
        client_signer_name: input.signerName.trim(),
        client_signed_at: new Date().toISOString(),
        client_signed_ip: clientIp(),
        client_signature_png: png,
      })
      .eq('id', contractId)
      .eq('status', 'sent');
    if (error) throw error;

    revalidatePath('/dashboard/contracts');
    revalidatePath('/dashboard');
    revalidatePath('/admin/contracts');
    return { success: true };
  } catch (error) {
    return fail(error, 'Could not record your signature');
  }
}

/** Admin: countersign a client-signed contract and produce the executed PDF. */
export async function countersignContract(
  contractId: string,
  input: { signerName: string }
): Promise<ActionResult> {
  try {
    const me = await requireAdmin();
    const admin = getServiceClient();

    const { data: c } = await admin.from('contracts').select('*').eq('id', contractId).maybeSingle();
    if (!c) return { success: false, error: 'Contract not found.' };
    if (c.status !== 'client_signed') {
      return { success: false, error: 'The client must sign before you can countersign.' };
    }

    const repName = input.signerName.trim() || me.email || 'Touch Domain';
    const repSignedAt = new Date().toISOString();
    const repIp = clientIp();

    // Build the executed PDF: source + signature certificate.
    const source = await downloadFromDrive(c.source_drive_file_id);
    const cert = generateSignatureCertificate({
      contractId: c.id,
      title: c.title,
      sourceSha256: c.source_pdf_sha256,
      client: {
        name: c.client_signer_name ?? 'Client',
        signedAt: c.client_signed_at ?? repSignedAt,
        ip: c.client_signed_ip ?? '',
        signaturePng: c.client_signature_png,
      },
      representative: { name: repName, signedAt: repSignedAt, ip: repIp },
    });
    const executed = await mergeExecutedContract(source, cert);

    const folderId = await driveFolderFor(admin, c.client_id, c.project_id);
    const fileName = `${c.title} (signed).pdf`;
    const uploaded = await uploadToDrive(executed, fileName, 'application/pdf', folderId);

    const { error } = await admin
      .from('contracts')
      .update({
        status: 'executed',
        rep_signer_name: repName,
        rep_signed_at: repSignedAt,
        rep_signed_ip: repIp,
        executed_drive_file_id: uploaded.id,
        executed_at: repSignedAt,
      })
      .eq('id', contractId)
      .eq('status', 'client_signed');
    if (error) throw error;

    await recordClientFile(admin, c.client_id, c.project_id, fileName, uploaded.id, uploaded.viewLink, uploaded.downloadLink, uploaded.sizeBytes);

    revalidatePath('/admin/contracts');
    revalidatePath('/dashboard/contracts');
    revalidatePath('/dashboard/files');
    return { success: true };
  } catch (error) {
    return fail(error, 'Failed to countersign');
  }
}

export async function voidContract(contractId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const admin = getServiceClient();
    const { error } = await admin
      .from('contracts')
      .update({ status: 'void' })
      .eq('id', contractId)
      .neq('status', 'executed');
    if (error) throw error;
    revalidatePath('/admin/contracts');
    revalidatePath('/dashboard/contracts');
    return { success: true };
  } catch (error) {
    return fail(error, 'Failed to void the contract');
  }
}
