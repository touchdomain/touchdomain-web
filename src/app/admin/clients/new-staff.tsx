'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, UserPlus, X } from 'lucide-react';
import { createAdminAccount } from '@/lib/actions/admin';
import { Card, inputClass, btnPrimary, btnSecondary } from '@/components/portal/ui';

export default function NewStaff() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await createAdminAccount({ email: email.trim(), fullName: fullName.trim() });
    setBusy(false);
    if (!res.success) return toast.error(res.error);
    if (res.data?.invited) toast.success(`${fullName} added as staff — invite email sent.`);
    else toast.warning(res.data?.note || 'Staff account created, but the invite email did not send.');
    setOpen(false);
    setFullName('');
    setEmail('');
    router.refresh();
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={btnSecondary}>
        <UserPlus className="h-4 w-4" /> Add staff
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-td-purple/40 p-4 backdrop-blur-sm sm:p-10" onClick={() => !busy && setOpen(false)}>
      <Card className="w-full max-w-md" >
        <div className="mb-4 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-lg font-bold text-td-dark">Add a staff member</h2>
          <button onClick={() => setOpen(false)} disabled={busy} className="text-gray-400 hover:text-td-dark"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-td-dark">Full name *</span>
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-td-dark">Email *</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </label>
          <p className="text-xs text-gray-400">
            They get full admin access to the portal (clients, projects, invoices, contracts) and an
            email to set their password.
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)} disabled={busy} className={btnSecondary}>Cancel</button>
            <button type="submit" disabled={busy} className={btnPrimary}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Add staff
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
