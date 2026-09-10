'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { inputClass, btnPrimary } from '@/components/portal/ui';

type Phase = 'checking' | 'ready' | 'no-session' | 'saving';

export default function SetPasswordPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [resendEmail, setResendEmail] = useState('');

  useEffect(() => {
    const supabase = createClient();
    // The ssr browser client consumes the code/hash from the URL on load;
    // give it a tick, then check for a session.
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      setPhase(data.session ? 'ready' : 'no-session');
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error('Use at least 8 characters.');
    if (password !== confirm) return toast.error('Passwords do not match.');

    setPhase('saving');
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
      setPhase('ready');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    let dest = '/dashboard';
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (profile?.role === 'admin') dest = '/admin';
    }
    toast.success('Password set. Signing you in…');
    router.push(dest);
    router.refresh();
  };

  const resend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(resendEmail.trim(), {
      redirectTo: `${window.location.origin}/set-password`,
    });
    if (error) toast.error(error.message);
    else toast.success('If that email has an account, a new link is on its way.');
  };

  return (
    <div className="w-full max-w-sm rounded-2xl border border-td-purple/10 bg-white p-8 shadow-[0_4px_24px_rgba(69,44,99,0.08)]">
      {phase === 'checking' && (
        <p className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Verifying your link…
        </p>
      )}

      {(phase === 'ready' || phase === 'saving') && (
        <>
          <h1 className="text-center text-xl font-bold text-td-dark">Set your password</h1>
          <p className="mt-1 text-center text-sm text-gray-500">Choose a password to finish setting up your account.</p>
          <form className="mt-7 space-y-4" onSubmit={save}>
            <div>
              <label className="mb-1 block text-sm font-medium text-td-dark">New password</label>
              <input type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="At least 8 characters" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-td-dark">Confirm password</label>
              <input type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={phase === 'saving'} className={`${btnPrimary} w-full`}>
              {phase === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
              {phase === 'saving' ? 'Saving…' : 'Set password & sign in'}
            </button>
          </form>
        </>
      )}

      {phase === 'no-session' && (
        <>
          <h1 className="text-center text-xl font-bold text-td-dark">Link expired</h1>
          <p className="mt-1 text-center text-sm text-gray-500">
            Set-up links last 24 hours. Enter your email and we&apos;ll send a fresh one.
          </p>
          <form className="mt-7 space-y-4" onSubmit={resend}>
            <input type="email" required value={resendEmail} onChange={(e) => setResendEmail(e.target.value)} className={inputClass} placeholder="name@company.co.za" />
            <button type="submit" className={`${btnPrimary} w-full`}>Send a new link</button>
          </form>
          <p className="mt-5 text-center text-xs text-gray-400">
            Still stuck? Email{' '}
            <a href="mailto:helper@touchdomain.co.za" className="text-td-accent hover:underline">helper@touchdomain.co.za</a>
          </p>
        </>
      )}
    </div>
  );
}
