'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Loader2, PenLine } from 'lucide-react';
import { countersignContract, voidContract } from '@/lib/actions/contracts';
import { inputClass } from '@/components/portal/ui';

export default function Countersign({
  contractId,
  status,
  defaultName,
}: {
  contractId: string;
  status: string;
  defaultName: string;
}) {
  const [name, setName] = useState(defaultName);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ success: boolean; error?: string }>, ok: string) =>
    start(async () => {
      const res = await fn();
      if (res.success) toast.success(ok);
      else toast.error(res.error);
    });

  if (status === 'client_signed') {
    return open ? (
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className={`${inputClass} h-8 w-48 py-1 text-sm`}
        />
        <button
          onClick={() => run(() => countersignContract(contractId, { signerName: name.trim() }), 'Countersigned — executed PDF filed to Drive.')}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-full bg-td-purple px-4 py-1.5 text-xs font-semibold text-white hover:bg-td-accent disabled:opacity-50"
        >
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Confirm countersignature
        </button>
        <button onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-td-dark">Cancel</button>
      </div>
    ) : (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-td-purple hover:text-td-accent"
      >
        <PenLine className="h-3.5 w-3.5" /> Countersign
      </button>
    );
  }

  if (status === 'sent' || status === 'draft') {
    return (
      <button
        onClick={() => run(() => voidContract(contractId), 'Contract voided.')}
        disabled={pending}
        className="mt-2 text-xs text-gray-400 hover:text-red-500"
      >
        Void
      </button>
    );
  }

  return null;
}
