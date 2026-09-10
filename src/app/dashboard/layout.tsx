import { redirect } from 'next/navigation';
import { LayoutDashboard, ClipboardList, FolderOpen, ReceiptText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import PortalShell, { type NavItem } from '@/components/portal/shell';

const NAV: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Onboarding', href: '/dashboard/onboarding', icon: ClipboardList },
  { name: 'Files', href: '/dashboard/files', icon: FolderOpen },
  { name: 'Invoices', href: '/dashboard/invoices', icon: ReceiptText },
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
