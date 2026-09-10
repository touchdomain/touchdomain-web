import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Profile, Project, Milestone, ProjectOnboarding, Invoice, ClientFile, PaymentMilestone, PaymentProof } from '@/lib/database.types';

/** The signed-in client's profile + most-recent project (RLS-scoped). */
export async function getClientContext(): Promise<{
  profile: Profile | null;
  project: Project | null;
}> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { profile: null, project: null };

  const [{ data: profile }, { data: project }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase
      .from('projects')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return { profile: profile ?? null, project: project ?? null };
}

export async function getClientMilestones(projectId: string): Promise<Milestone[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('milestones')
    .select('*')
    .eq('project_id', projectId)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });
  return data ?? [];
}

export async function getClientOnboarding(): Promise<ProjectOnboarding | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('project_onboarding')
    .select('*')
    .eq('client_id', user.id)
    .maybeSingle();
  return data ?? null;
}

export async function getClientInvoices(): Promise<Invoice[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function getClientPaymentSchedule(projectId: string): Promise<PaymentMilestone[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('payment_milestones')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export async function getClientPaymentProofs(): Promise<PaymentProof[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('payment_proofs')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function getClientFiles(): Promise<ClientFile[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('client_files')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}
