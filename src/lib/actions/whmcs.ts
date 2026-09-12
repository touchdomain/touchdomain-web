'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, getServiceClient, fail, type ActionResult } from '@/lib/auth-helpers';
import {
  whmcsConfigured,
  createOrFindWhmcsClient,
  provisionHostingOrder,
  getClientServices,
  suspendService,
  unsuspendService,
  terminateService,
} from '@/lib/whmcs';

export async function isWhmcsConfigured(): Promise<boolean> {
  await requireAdmin();
  return whmcsConfigured();
}

/**
 * Provision a hosting account via HostAfrica/WHMCS for a project's client.
 * FormData: productId, domain?, billingCycle?, address1
 */
export async function provisionHosting(
  projectId: string,
  formData: FormData
): Promise<ActionResult<{ serviceId: string }>> {
  try {
    await requireAdmin();
    if (!whmcsConfigured()) {
      return { success: false, error: 'WHMCS is not configured yet — add WHMCS_API_URL / WHMCS_API_IDENTIFIER / WHMCS_API_SECRET.' };
    }
    const admin = getServiceClient();

    const productId = String(formData.get('productId') || '').trim();
    const domain = String(formData.get('domain') || '').trim() || undefined;
    const billingCycle = String(formData.get('billingCycle') || 'monthly').trim();
    const address1 = String(formData.get('address1') || '').trim();
    if (!productId) return { success: false, error: 'Enter the WHMCS product/package id.' };
    if (!address1) return { success: false, error: 'Enter a billing address (WHMCS requires one).' };

    const { data: project } = await admin
      .from('projects')
      .select('id, client_id')
      .eq('id', projectId)
      .maybeSingle();
    if (!project) return { success: false, error: 'Project not found.' };

    const { data: profile } = await admin
      .from('profiles')
      .select('full_name, email, phone, company_name, whmcs_client_id')
      .eq('id', project.client_id)
      .maybeSingle();
    if (!profile) return { success: false, error: 'Client not found.' };

    let whmcsClientId = profile.whmcs_client_id;
    if (!whmcsClientId) {
      const [firstName, ...rest] = (profile.full_name || 'Client').split(' ');
      whmcsClientId = await createOrFindWhmcsClient({
        firstName: firstName || 'Client',
        lastName: rest.join(' ') || '-',
        email: profile.email,
        companyName: profile.company_name ?? undefined,
        phone: profile.phone ?? undefined,
        address1,
      });
      await admin.from('profiles').update({ whmcs_client_id: whmcsClientId }).eq('id', project.client_id);
    }

    const { serviceId } = await provisionHostingOrder({
      clientId: whmcsClientId,
      productId,
      domain,
      billingCycle,
    });

    await admin
      .from('projects')
      .update({
        whmcs_service_id: serviceId,
        whmcs_product_id: productId,
        whmcs_domain: domain ?? null,
        whmcs_status: 'Pending',
      })
      .eq('id', projectId);

    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath('/dashboard');
    return { success: true, data: { serviceId } };
  } catch (error) {
    return fail(error, 'Failed to provision hosting via WHMCS');
  }
}

/** Pull the latest status/domain for a project's hosting service from WHMCS. */
export async function refreshHostingStatus(projectId: string): Promise<ActionResult<{ status: string }>> {
  try {
    await requireAdmin();
    if (!whmcsConfigured()) return { success: false, error: 'WHMCS is not configured yet.' };
    const admin = getServiceClient();

    const { data: project } = await admin
      .from('projects')
      .select('client_id, whmcs_service_id')
      .eq('id', projectId)
      .maybeSingle();
    if (!project?.whmcs_service_id) return { success: false, error: 'This project has no WHMCS service linked.' };

    const { data: profile } = await admin
      .from('profiles')
      .select('whmcs_client_id')
      .eq('id', project.client_id)
      .maybeSingle();
    if (!profile?.whmcs_client_id) return { success: false, error: 'No WHMCS client linked.' };

    const services = await getClientServices(profile.whmcs_client_id);
    const svc = services.find((s) => s.id === project.whmcs_service_id);
    if (!svc) return { success: false, error: 'Service not found on WHMCS.' };

    await admin.from('projects').update({ whmcs_status: svc.status, whmcs_domain: svc.domain }).eq('id', projectId);
    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true, data: { status: svc.status } };
  } catch (error) {
    return fail(error, 'Failed to refresh hosting status');
  }
}

async function withService(
  projectId: string,
  fn: (serviceId: string) => Promise<void>,
  newStatus: string
): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!whmcsConfigured()) return { success: false, error: 'WHMCS is not configured yet.' };
    const admin = getServiceClient();
    const { data: project } = await admin
      .from('projects')
      .select('whmcs_service_id')
      .eq('id', projectId)
      .maybeSingle();
    if (!project?.whmcs_service_id) return { success: false, error: 'This project has no WHMCS service linked.' };

    await fn(project.whmcs_service_id);
    await admin.from('projects').update({ whmcs_status: newStatus }).eq('id', projectId);
    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    return fail(error, 'WHMCS action failed');
  }
}

export const suspendHosting = (projectId: string) => withService(projectId, (id) => suspendService(id), 'Suspended');
export const unsuspendHosting = (projectId: string) => withService(projectId, (id) => unsuspendService(id), 'Active');
export const terminateHosting = (projectId: string) => withService(projectId, (id) => terminateService(id), 'Terminated');
