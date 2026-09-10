'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LogOut, Menu, X,
  LayoutDashboard, Users, FolderKanban, ReceiptText, FileSignature,
  ClipboardList, FolderOpen,
  type LucideIcon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

// Server components (the portal layouts) can't hand a component reference
// across the RSC boundary, so nav items carry a string key resolved here.
const ICONS = {
  overview: LayoutDashboard,
  clients: Users,
  projects: FolderKanban,
  invoices: ReceiptText,
  contracts: FileSignature,
  onboarding: ClipboardList,
  files: FolderOpen,
} satisfies Record<string, LucideIcon>;

export type NavIcon = keyof typeof ICONS;

export interface NavItem {
  name: string;
  href: string;
  icon: NavIcon;
}

interface PortalShellProps {
  navItems: NavItem[];
  variant: 'admin' | 'client';
  user: { name: string; email: string };
  children: React.ReactNode;
}

export default function PortalShell({ navItems, variant, user, children }: PortalShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await createClient().auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) =>
    href === `/${variant === 'admin' ? 'admin' : 'dashboard'}`
      ? pathname === href
      : pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex min-h-screen bg-[#f7f5f8] text-td-dark">
      {open && (
        <div
          className="fixed inset-0 z-40 bg-td-purple/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-td-purple/10 bg-white transition-transform duration-300 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-td-purple/10 px-5">
          <Link href={variant === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2">
            <Image src="/branding/logo-nav.png" alt="Touch Domain" width={116} height={30} className="h-7 w-auto object-contain" />
          </Link>
          {variant === 'admin' && (
            <span className="rounded-full bg-td-purple/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-td-purple">
              Admin
            </span>
          )}
          <button onClick={() => setOpen(false)} className="text-gray-400 lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = ICONS[item.icon];
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-td-purple/10 text-td-purple'
                    : 'text-gray-500 hover:bg-td-purple/[0.04] hover:text-td-dark'
                )}
              >
                <Icon className={cn('h-[18px] w-[18px] shrink-0', active ? 'text-td-purple' : 'text-gray-400')} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-td-purple/10 p-3">
          <div className="px-2 pb-2">
            <p className="truncate text-sm font-semibold text-td-dark">{user.name}</p>
            <p className="truncate text-xs text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-td-purple/10 bg-white px-4 lg:hidden">
          <button onClick={() => setOpen(true)} className="text-td-purple" aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>
          <Image src="/branding/logo-nav.png" alt="Touch Domain" width={116} height={30} className="h-7 w-auto object-contain" />
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
