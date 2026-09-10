import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PortalShell, { type NavItem } from '@/components/portal/shell';

const NAV: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: 'overview' },
  { name: 'Onboarding', href: '/dashboard/onboarding', icon: 'onboarding' },
  { name: 'Files', href: '/dashboard/files', icon: 'files' },
  { name: 'Invoices', href: '/dashboard/invoices', icon: 'invoices' },
];

export const metadata = { title: 'Client Portal' };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) redirect('/login');
  if (profile.role === 'admin') redirect('/admin');

  return (
    <PortalShell
      variant="client"
      navItems={NAV}
      user={{ name: profile.full_name, email: profile.email }}
    >
      {children}
    </PortalShell>
  );
}
