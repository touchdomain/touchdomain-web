'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Plus, X } from 'lucide-react';
import { createClientAccount, createProject } from '@/lib/actions/admin';
import { Card, inputClass, btnPrimary, btnSecondary } from '@/components/portal/ui';

export default function NewClient() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    email: '', fullName: '', companyName: '', phone: '',
    projectTitle: '', driveFolderId: '', targetLaunchDate: '',
  });
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const acc = await createClientAccount({
      email: form.email.trim(),
      fullName: form.fullName.trim(),
      companyName: form.companyName.trim(),
      phone: form.phone.trim() || undefined,
    });
    if (!acc.success) {
      toast.error(acc.error);
      setBusy(false);
      return;
    }

    if (form.projectTitle.trim()) {
      const proj = await createProject({
        clientId: acc.data!.userId,
        title: form.projectTitle.trim(),
        targetLaunchDate: form.targetLaunchDate || undefined,
        googleDriveFolderId: form.driveFolderId.trim() || undefined,
      });
      if (!proj.success) toast.error(`Client created, but project failed: ${proj.error}`);
    }

    toast.success(`${form.fullName} provisioned. They can sign in via password reset.`);
    setBusy(false);
    setOpen(false);
    setForm({ email: '', fullName: '', companyName: '', phone: '', projectTitle: '', driveFolderId: '', targetLaunchDate: '' });
    router.refresh();
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={btnPrimary}>
        <Plus className="h-4 w-4" /> New client
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-td-purple/40 p-4 backdrop-blur-sm sm:p-10" onClick={() => !busy && setOpen(false)}>
      <Card className="w-full max-w-lg" >
        <div className="mb-4 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-lg font-bold text-td-dark">Provision a client</h2>
          <button onClick={() => setOpen(false)} disabled={busy} className="text-gray-400 hover:text-td-dark"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Full name *" value={form.fullName} onChange={(v) => set('fullName', v)} required />
            <Input label="Company name *" value={form.companyName} onChange={(v) => set('companyName', v)} required />
            <Input label="Email *" type="email" value={form.email} onChange={(v) => set('email', v)} required />
            <Input label="Phone" value={form.phone} onChange={(v) => set('phone', v)} />
          </div>
          <div className="border-t border-td-purple/10 pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Optional — start a project now</p>
            <div className="space-y-3">
              <Input label="Project title" value={form.projectTitle} onChange={(v) => set('projectTitle', v)} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input label="Google Drive folder ID" value={form.driveFolderId} onChange={(v) => set('driveFolderId', v)} />
                <Input label="Target launch date" type="date" value={form.targetLaunchDate} onChange={(v) => set('targetLaunchDate', v)} />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} disabled={busy} className={btnSecondary}>Cancel</button>
            <button type="submit" disabled={busy} className={btnPrimary}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Input({
  label, value, onChange, type = 'text', required,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-td-dark">{label}</span>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </label>
  );
}
