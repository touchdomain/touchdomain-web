'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { inputClass, btnPrimary } from '@/components/portal/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    let dest = '/dashboard';
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (profile?.role === 'admin') dest = '/admin';
    }
    router.push(dest);
    router.refresh();
  };

  return (
    <div className="w-full max-w-sm rounded-2xl border border-td-purple/10 bg-white p-8 shadow-[0_4px_24px_rgba(69,44,99,0.08)]">
      <h1 className="text-center text-xl font-bold text-td-dark">Portal sign in</h1>
      <p className="mt-1 text-center text-sm text-gray-500">
        Client zone and staff management.
      </p>

      <form className="mt-7 space-y-4" onSubmit={handleLogin}>
        <div>
          <label className="mb-1 block text-sm font-medium text-td-dark">Email address</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="name@company.co.za"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-td-dark">Password</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
        </div>
        <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link href="/set-password" className="font-semibold text-td-purple hover:text-td-accent">
          First time here, or forgot your password?
        </Link>
      </p>

      <p className="mt-5 text-center text-xs text-gray-400">
        Trouble signing in? Email{' '}
        <a href="mailto:helper@touchdomain.co.za" className="text-td-accent hover:underline">
          helper@touchdomain.co.za
        </a>
      </p>
    </div>
  );
}
