'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'Onboarding', href: '/dashboard/onboarding', icon: ClipboardIcon },
  { name: 'Files', href: '/dashboard/files', icon: FolderIcon },
  { name: 'Invoices', href: '/dashboard/invoices', icon: CreditCardIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-300">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform flex-col justify-between border-r border-slate-800 bg-slate-900 transition-transform duration-300 lg:static lg:flex lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 flex' : '-translate-x-full hidden'
        }`}
      >
        <div className="flex h-full flex-col pb-4">
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-800">
            <span className="text-xl font-bold tracking-tight text-white">
              TOUCHDOMAIN
            </span>
          </div>
          <nav className="mt-6 flex-1 space-y-1 px-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-white'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="px-4 mt-auto">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <LogoutIcon className="mr-3 h-5 w-5 shrink-0 text-slate-500 group-hover:text-red-400" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex h-16 items-center border-b border-slate-800 bg-slate-900 px-4 sm:px-6 lg:hidden">
          <button
            type="button"
            className="text-slate-400 hover:text-white focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <span className="ml-4 text-lg font-bold text-white">TOUCHDOMAIN</span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// Inline SVG Icons for clean dependencies
function HomeIcon(props: any) { return <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>; }
function ClipboardIcon(props: any) { return <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 15.75h3.75M18 9.75v10.5a2.25 2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 2.25 0 01-2.25-2.25V9.75M18 9.75v-2.4a2.25 2.25 2.25 0 00-2.25-2.25H15m3 4.5h-3m-3-4.5H9m-3 4.5H3m3-4.5v-2.4a2.25 2.25 2.25 0 012.25-2.25h3" /></svg>; }
function FolderIcon(props: any) { return <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 2.25 0 014.5 9.75h15A2.25 2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 2.25 0 002.25 6v12a2.25 2.25 2.25 0 002.25 2.25h15A2.25 2.25 2.25 0 0021.75 18V9a2.25 2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>; }
function CreditCardIcon(props: any) { return <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 2.25 0 004.5 19.5z" /></svg>; }
function LogoutIcon(props: any) { return <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 2.25 0 0013.5 3h-6a2.25 2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 2.25 0 007.5 21h6a2.25 2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>; }
function MenuIcon(props: any) { return <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>; }