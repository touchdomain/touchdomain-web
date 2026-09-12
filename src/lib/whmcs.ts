import 'server-only';

/**
 * Thin wrapper around the WHMCS local API (HostAfrica reseller account).
 * WHMCS stays the provisioning engine for the actual hosting account; the
 * portal only stores back the ids it returns (see migration 009) so an
 * admin action or the client's read-only hosting card can look it up again.
 *
 * Docs: https://developers.whmcs.com/api/
 *
 * Env vars (see .env.example):
 *   WHMCS_API_URL         e.g. https://billing.touchdomain.co.za
 *   WHMCS_API_IDENTIFIER  API Access Key identifier (Setup > Staff > API Credentials)
 *   WHMCS_API_SECRET      matching secret
 */

export class WhmcsNotConfiguredError extends Error {
  constructor() {
    super('WHMCS is not configured yet — set WHMCS_API_URL / WHMCS_API_IDENTIFIER / WHMCS_API_SECRET.');
    this.name = 'WhmcsNotConfiguredError';
  }
}

export function whmcsConfigured(): boolean {
  return !!(process.env.WHMCS_API_URL && process.env.WHMCS_API_IDENTIFIER && process.env.WHMCS_API_SECRET);
}

async function whmcsCall<T extends Record<string, unknown>>(
  action: string,
  params: Record<string, string | number | boolean | undefined> = {}
): Promise<T> {
  const url = process.env.WHMCS_API_URL;
  const identifier = process.env.WHMCS_API_IDENTIFIER;
  const secret = process.env.WHMCS_API_SECRET;
  if (!url || !identifier || !secret) throw new WhmcsNotConfiguredError();

  const body = new URLSearchParams({ identifier, secret, action, responsetype: 'json' });
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) body.set(k, String(v));
  }

  const res = await fetch(`${url.replace(/\/$/, '')}/includes/api.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`WHMCS API HTTP ${res.status}`);

  const data = (await res.json()) as T & { result?: string; message?: string };
  if (data.result && data.result !== 'success') {
    throw new Error(data.message || `WHMCS API action "${action}" failed`);
  }
  return data;
}

export interface WhmcsClientInput {
  firstName: string;
  lastName: string;
  email: string;
  companyName?: string;
  phone?: string;
  address1: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string; // ISO 2-letter, e.g. "ZA"
}

/** Create (or find, if one already exists for this email) a WHMCS client. */
export async function createOrFindWhmcsClient(input: WhmcsClientInput): Promise<string> {
  try {
    const existing = await whmcsCall<{ clients?: { client: { id: number }[] } }>('GetClients', {
      search: input.email,
      limit: 1,
    });
    const match = existing.clients?.client?.[0];
    if (match) return String(match.id);
  } catch {
    // fall through to create — a lookup miss isn't fatal
  }

  const created = await whmcsCall<{ clientid: number }>('AddClient', {
    firstname: input.firstName,
    lastname: input.lastName,
    email: input.email,
    companyname: input.companyName,
    phonenumber: input.phone,
    address1: input.address1,
    city: input.city || 'Unknown',
    state: input.state,
    postcode: input.postcode || '0000',
    country: input.country || 'ZA',
    password2: crypto.randomUUID(), // client never logs into WHMCS directly
    skipvalidation: true,
    noemail: true,
  });
  return String(created.clientid);
}

export interface WhmcsOrderInput {
  clientId: string;
  productId: string; // WHMCS "pid" for the hosting package
  domain?: string;
  billingCycle?: string; // monthly | quarterly | annually | ...
}

/**
 * Place and immediately accept a hosting order — AcceptOrder with
 * autosetup=true triggers the HostAfrica provisioning module to create the
 * actual cPanel account. Returns the resulting service id.
 */
export async function provisionHostingOrder(input: WhmcsOrderInput): Promise<{ orderId: string; serviceId: string }> {
  const order = await whmcsCall<{ orderid: number; productids: string }>('AddOrder', {
    clientid: input.clientId,
    pid: input.productId,
    domain: input.domain,
    billingcycle: input.billingCycle || 'monthly',
    paymentmethod: 'banktransfer',
    noinvoice: false,
    noemail: true,
  });

  const accepted = await whmcsCall<{ serviceids?: string; productids?: string }>('AcceptOrder', {
    orderid: order.orderid,
    autosetup: true,
    sendemail: false,
  });

  const serviceId = accepted.serviceids?.split(',')[0] || order.productids?.split(',')[0] || '';
  return { orderId: String(order.orderid), serviceId };
}

export interface WhmcsService {
  id: string;
  domain: string;
  productName: string;
  status: string;
  nextDueDate: string | null;
}

/** All hosting services on a WHMCS client account — used for the client's read-only hosting card. */
export async function getClientServices(clientId: string): Promise<WhmcsService[]> {
  const data = await whmcsCall<{
    products?: { product: Array<{ id: number; domain: string; name: string; status: string; nextduedate: string }> };
  }>('GetClientsProducts', { clientid: clientId });

  return (data.products?.product ?? []).map((p) => ({
    id: String(p.id),
    domain: p.domain,
    productName: p.name,
    status: p.status,
    nextDueDate: p.nextduedate || null,
  }));
}

export async function suspendService(serviceId: string, reason?: string): Promise<void> {
  await whmcsCall('ModuleSuspend', { serviceid: serviceId, suspendreason: reason });
}

export async function unsuspendService(serviceId: string): Promise<void> {
  await whmcsCall('ModuleUnsuspend', { serviceid: serviceId });
}

export async function terminateService(serviceId: string): Promise<void> {
  await whmcsCall('ModuleTerminate', { serviceid: serviceId });
}
