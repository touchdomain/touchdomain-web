import { redirect } from 'next/navigation';
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
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') redirect('/dashboard');

  return (
    <PortalShell
      variant="admin"
      navItems={NAV}
      user={{ name: profile.full_name, email: profile.email }}
    >
      {children}
    </PortalShell>
  );
}
