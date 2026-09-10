'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { MoreVertical, Loader2 } from 'lucide-react';
import { resendInvite, setUserRole, deleteUserAccount } from '@/lib/actions/admin';
import type { UserRole } from '@/lib/database.types';

export default function UserActions({
  userId,
  name,
  role,
  isSelf,
}: {
  userId: string;
  name: string;
  role: UserRole;
  isSelf: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const run = (fn: () => Promise<{ success: boolean; error?: string }>, ok: string) =>
    start(async () => {
      const res = await fn();
      if (res.success) toast.success(ok);
      else toast.error(res.error);
      setOpen(false);
    });

  const doResend = () =>
    start(async () => {
      const res = await resendInvite(userId);
      setOpen(false);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      const link = res.data?.link;
      if (link) {
        try { await navigator.clipboard.writeText(link); } catch { /* clipboard blocked */ }
      }
      toast.success(
        res.data?.emailed
          ? 'Set-password email sent (link also copied to your clipboard).'
          : 'Email unavailable — invite link copied to your clipboard. Send it to them directly.'
      );
    });

  const del = () => {
    if (!confirm(`Permanently delete ${name}'s account and all their portal data? This cannot be undone. Export any invoice PDFs from Drive first — SARS requires tax records to be kept for 5 years.`)) return;
    run(() => deleteUserAccount(userId), `${name}'s account was deleted.`);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-td-purple/[0.06] hover:text-td-dark"
        aria-label="Account actions"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-td-purple/10 bg-white py-1 shadow-lg">
          <button onClick={doResend} className={item}>
            Resend set-password link
          </button>
          {!isSelf && (
            <button
              onClick={() =>
                run(
                  () => setUserRole(userId, role === 'admin' ? 'client' : 'admin'),
                  role === 'admin' ? `${name} is now a client.` : `${name} is now an admin.`
                )
              }
              className={item}
            >
              {role === 'admin' ? 'Change to client' : 'Make admin'}
            </button>
          )}
          {!isSelf && (
            <button onClick={del} className={`${item} text-red-600 hover:bg-red-50`}>
              Delete account (POPIA)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const item = 'block w-full px-3 py-2 text-left text-sm text-td-dark hover:bg-td-purple/[0.06]';
