import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import PortalShell, { type NavItem } from '@/components/portal/shell';

const NAV: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: 'overview' },
  { name: 'Onboarding', href: '/dashboard/onboarding', icon: 'onboarding' },
  { name: 'Contracts', href: '/dashboard/contracts', icon: 'contracts' },
  { name: 'Files', href: '/dashboard/files', icon: 'files' },
  { name: 'Invoices', href: '/dashboard/invoices', icon: 'invoices' },
];

export const metadata = { title: 'Client Portal' };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Identity + role were already verified by middleware for this exact
  // request — trust its result instead of re-calling auth.getUser() and
  // re-querying `profiles` for role, which used to happen on every
  // navigation on top of what middleware had just done.
  const userId = headers().get('x-user-id');
  const role = headers().get('x-user-role');
  if (!userId) redirect('/login');
  if (role === 'admin') redirect('/admin');

  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', userId)
    .maybeSingle();

  if (!profile) redirect('/login');

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
