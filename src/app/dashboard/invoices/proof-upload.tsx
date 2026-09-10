'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Paperclip, CheckCircle2, Clock } from 'lucide-react';
import { submitPaymentProof } from '@/lib/actions/payment-proofs';
import { inputClass } from '@/components/portal/ui';

interface ExistingProof {
  id: string;
  file_name: string;
  reviewed: boolean;
  created_at: string;
}

export default function ProofUpload({
  invoiceId,
  proofs,
}: {
  invoiceId: string;
  proofs: ExistingProof[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error('Choose a screenshot or PDF first.');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('invoiceId', invoiceId);
    if (note.trim()) fd.append('note', note.trim());
    if (amount.trim()) fd.append('amountZar', amount.trim());
    start(async () => {
      const res = await submitPaymentProof(fd);
      if (res.success) {
        toast.success('Proof of payment sent — we’ll confirm once it clears.');
        setOpen(false);
        setNote('');
        setAmount('');
        if (fileRef.current) fileRef.current.value = '';
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="mt-2 w-full border-t border-td-purple/10 pt-2">
      {proofs.map((p) => (
        <p key={p.id} className="flex items-center gap-1.5 text-xs text-gray-400">
          {p.reviewed ? (
            <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Proof confirmed</>
          ) : (
            <><Clock className="h-3.5 w-3.5 text-amber-500" /> Proof received — under review</>
          )}
          <span className="text-gray-300">· {new Date(p.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
        </p>
      ))}

      {open ? (
        <form onSubmit={submit} className="mt-2 space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            className="block w-full text-xs text-gray-500 file:mr-3 file:rounded-full file:border-0 file:bg-td-purple/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-td-purple"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="Amount paid (optional)"
            className={`${inputClass} h-8 py-1 text-sm`}
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Note — e.g. paid by ATM deposit at Schweizer-Reneke branch, ref 12345"
            className={`${inputClass} resize-y text-sm`}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-full bg-td-purple px-4 py-1.5 text-xs font-semibold text-white hover:bg-td-accent disabled:opacity-50"
            >
              {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Send proof
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-td-dark">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-td-purple hover:text-td-accent"
        >
          <Paperclip className="h-3.5 w-3.5" /> Upload proof of payment
        </button>
      )}
    </div>
  );
}
