import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Profile, Project, Milestone, ProjectOnboarding, Invoice, ClientFile } from '@/lib/database.types';

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
}

export async function getProjectDetail(id: string): Promise<ProjectDetail | null> {
  const supabase = createClient();
  const { data: project } = await supabase
    .from('projects')
    .select('*, profiles(full_name, email, company_name)')
    .eq('id', id)
    .maybeSingle();
  if (!project) return null;

  const [{ data: onboarding }, { data: milestones }, { data: files }] = await Promise.all([
    supabase.from('project_onboarding').select('*').eq('project_id', id).maybeSingle(),
    supabase.from('milestones').select('*').eq('project_id', id).order('created_at', { ascending: true }),
    supabase.from('client_files').select('*').eq('project_id', id).order('created_at', { ascending: false }),
  ]);

  return {
    project: project as ProjectWithClient,
    onboarding: onboarding ?? null,
    milestones: milestones ?? [],
    files: files ?? [],
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

export async function getClientOptions(): Promise<Pick<Profile, 'id' | 'full_name' | 'company_name' | 'email'>[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, company_name, email')
    .eq('role', 'client')
    .order('full_name');
  return data ?? [];
}
