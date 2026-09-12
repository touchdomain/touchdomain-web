import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Profile, Project, Milestone, ProjectOnboarding, Invoice, ClientFile, PaymentMilestone, PaymentProof, Contract } from '@/lib/database.types';

// Admin server components run with the admin's session; RLS "Admin full …"
// policies give read access to every row.

export interface AdminStats {
  clients: number;
  activeProjects: number;
  outstandingZar: number;
  pendingOnboarding: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createClient();
  const [clients, projects, invoices, onboarding] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('projects').select('status'),
    supabase.from('invoices').select('amount_zar, status'),
    supabase.from('project_onboarding').select('status'),
  ]);

  const activeProjects = (projects.data ?? []).filter((p) =>
    ['discovery', 'in_progress', 'review'].includes(p.status)
  ).length;
  const outstandingZar = (invoices.data ?? [])
    .filter((i) => i.status === 'unpaid' || i.status === 'overdue')
    .reduce((s, i) => s + Number(i.amount_zar), 0);
  const pendingOnboarding = (onboarding.data ?? []).filter(
    (o) => o.status === 'not_started' || o.status === 'in_progress'
  ).length;

  return { clients: clients.count ?? 0, activeProjects, outstandingZar, pendingOnboarding };
}

export interface ClientWithProjects extends Profile {
  projects: Pick<Project, 'id' | 'title' | 'status' | 'progress_percentage'>[];
}

export async function getClientsWithProjects(): Promise<ClientWithProjects[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*, projects(id, title, status, progress_percentage)')
    .eq('role', 'client')
    .order('created_at', { ascending: false });
  return (data ?? []) as ClientWithProjects[];
}

export interface ProjectWithClient extends Project {
  profiles: Pick<Profile, 'full_name' | 'email' | 'company_name'> | null;
}

export async function getAllProjects(): Promise<ProjectWithClient[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('projects')
    .select('*, profiles(full_name, email, company_name)')
    .order('created_at', { ascending: false });
  return (data ?? []) as ProjectWithClient[];
}

export interface ProjectDetail {
  project: ProjectWithClient;
  onboarding: ProjectOnboarding | null;
  milestones: Milestone[];
  files: ClientFile[];
  paymentMilestones: PaymentMilestone[];
}

export async function getProjectDetail(id: string): Promise<ProjectDetail | null> {
  const supabase = createClient();
  const { data: project } = await supabase
    .from('projects')
    .select('*, profiles(full_name, email, company_name)')
    .eq('id', id)
    .maybeSingle();
  if (!project) return null;

  const [{ data: onboarding }, { data: milestones }, { data: files }, { data: paymentMilestones }] =
    await Promise.all([
      supabase.from('project_onboarding').select('*').eq('project_id', id).maybeSingle(),
      supabase.from('milestones').select('*').eq('project_id', id).order('created_at', { ascending: true }),
      supabase.from('client_files').select('*').eq('project_id', id).order('created_at', { ascending: false }),
      supabase.from('payment_milestones').select('*').eq('project_id', id).order('sort_order', { ascending: true }),
    ]);

  return {
    project: project as ProjectWithClient,
    onboarding: onboarding ?? null,
    milestones: milestones ?? [],
    files: files ?? [],
    paymentMilestones: paymentMilestones ?? [],
  };
}

export interface InvoiceWithClient extends Invoice {
  profiles: Pick<Profile, 'full_name' | 'company_name'> | null;
}

export async function getAllInvoices(): Promise<InvoiceWithClient[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('invoices')
    .select('*, profiles(full_name, company_name)')
    .order('created_at', { ascending: false });
  return (data ?? []) as InvoiceWithClient[];
}

export interface ContractWithClient extends Contract {
  profiles: Pick<Profile, 'full_name' | 'company_name' | 'email'> | null;
}

export async function getContracts(): Promise<ContractWithClient[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('contracts')
    .select('*, profiles(full_name, company_name, email)')
    .order('created_at', { ascending: false });
  return (data ?? []) as ContractWithClient[];
}

export async function getPaymentProofs(): Promise<PaymentProof[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('payment_proofs')
    .select('*')
    .order('created_at', { ascending: false });
  return (data ?? []) as PaymentProof[];
}

/** Next invoice number in the running yearly series, e.g. "INV-2026-014". */
export async function getNextInvoiceNumber(): Promise<string> {
  const supabase = createClient();
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const { data } = await supabase
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', `${prefix}%`);
  const max = (data ?? []).reduce(
    (m, r) => Math.max(m, parseInt(r.invoice_number.slice(prefix.length), 10) || 0),
    0
  );
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

/** Next SOW/contract reference in the running yearly series, e.g. "SOW-2026-007". */
export async function getNextSowReference(): Promise<string> {
  const supabase = createClient();
  const year = new Date().getFullYear();
  const prefix = `SOW-${year}-`;
  const { data } = await supabase
    .from('contracts')
    .select('sow_reference')
    .like('sow_reference', `${prefix}%`);
  const max = (data ?? []).reduce((m, r) => {
    const n = r.sow_reference ? parseInt(r.sow_reference.slice(prefix.length), 10) : 0;
    return Math.max(m, n || 0);
  }, 0);
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

/** Most recent non-void contract for a project (falls back to the client's latest if no project match). */
export async function getReferenceContract(
  clientId: string,
  projectId?: string | null
): Promise<{ sow_reference: string | null } | null> {
  const supabase = createClient();
  if (projectId) {
    const { data } = await supabase
      .from('contracts')
      .select('sow_reference')
      .eq('project_id', projectId)
      .neq('status', 'void')
      .not('sow_reference', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) return data;
  }
  const { data } = await supabase
    .from('contracts')
    .select('sow_reference')
    .eq('client_id', clientId)
    .neq('status', 'void')
    .not('sow_reference', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

export async function getStaff(): Promise<Profile[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'admin')
    .order('created_at', { ascending: true });
  return (data ?? []) as Profile[];
}

export async function getClientOptions(): Promise<Pick<Profile, 'id' | 'full_name' | 'company_name' | 'email'>[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, company_name, email')
    .eq('role', 'client')
    .order('full_name');
  return data ?? [];
}
