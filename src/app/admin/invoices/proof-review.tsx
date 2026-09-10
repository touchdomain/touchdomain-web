'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Loader2, Check } from 'lucide-react';
import { markProofReviewed } from '@/lib/actions/payment-proofs';

interface Proof {
  id: string;
  view_link: string | null;
  note: string | null;
  amount_zar: number | null;
  reviewed: boolean;
  created_at: string;
}

export default function ProofReview({ proofs }: { proofs: Proof[] }) {
  const [pending, start] = useTransition();
  if (proofs.length === 0) return null;

  return (
    <div className="mt-3 w-full space-y-2 border-t border-td-purple/10 pt-3">
      {proofs.map((p) => (
        <div key={p.id} className="rounded-lg bg-amber-50/60 p-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-amber-800">
              Proof of payment{p.amount_zar != null ? ` — R ${Number(p.amount_zar).toLocaleString('en-ZA')}` : ''}
            </span>
            <span className="text-gray-400">
              {new Date(p.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            {p.view_link && (
              <a href={p.view_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-td-purple hover:text-td-accent">
                View <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {p.reviewed ? (
              <span className="inline-flex items-center gap-1 text-emerald-600"><Check className="h-3 w-3" /> reviewed</span>
            ) : (
              <button
                onClick={() => start(async () => {
                  const res = await markProofReviewed(p.id);
                  if (!res.success) toast.error(res.error);
                  else toast.success('Marked reviewed. Set the invoice to Paid if the funds cleared.');
                })}
                disabled={pending}
                className="inline-flex items-center gap-1 rounded-full bg-td-purple/10 px-2 py-0.5 font-semibold text-td-purple hover:bg-td-purple hover:text-white"
              >
                {pending && <Loader2 className="h-3 w-3 animate-spin" />} Mark reviewed
              </button>
            )}
          </div>
          {p.note && <p className="mt-1 whitespace-pre-wrap text-gray-600">{p.note}</p>}
        </div>
      ))}
    </div>
  );
}
