import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import PortalShell, { type NavItem } from '@/components/portal/shell';

const NAV: NavItem[] = [
  { name: 'Overview', href: '/admin', icon: 'overview' },
  { name: 'Clients', href: '/admin/clients', icon: 'clients' },
  { name: 'Projects', href: '/admin/projects', icon: 'projects' },
  { name: 'Invoices', href: '/admin/invoices', icon: 'invoices' },
  { name: 'Contracts', href: '/admin/contracts', icon: 'contracts' },
];

export const metadata = { title: 'Admin' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Identity + role were already verified by middleware for this exact
  // request — trust its result instead of re-calling auth.getUser() and
  // re-querying `profiles` for role, which used to happen on every
  // navigation on top of what middleware had just done.
  const userId = headers().get('x-user-id');
  const role = headers().get('x-user-role');
  if (!userId) redirect('/login');
  if (role !== 'admin') redirect('/dashboard');

  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', userId)
    .maybeSingle();

  if (!profile) redirect('/login');

  // handle_new_user() defaults full_name to 'Client' when no metadata was
  // supplied — show 'Admin' for staff who were created that way.
  const name =
    !profile.full_name || profile.full_name.trim().toLowerCase() === 'client'
      ? 'Admin'
      : profile.full_name;

  return (
    <PortalShell variant="admin" navItems={NAV} user={{ name, email: profile.email }}>
      {children}
    </PortalShell>
  );
}
