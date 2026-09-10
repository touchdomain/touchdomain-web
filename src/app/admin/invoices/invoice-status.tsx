'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { setInvoiceStatus } from '@/lib/actions/invoices';
import type { InvoiceStatus } from '@/lib/database.types';

const OPTIONS: InvoiceStatus[] = ['unpaid', 'paid', 'overdue', 'cancelled'];

export default function InvoiceStatusControl({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: InvoiceStatus;
}) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          const res = await setInvoiceStatus(invoiceId, e.target.value as InvoiceStatus);
          if (!res.success) toast.error(res.error);
          else toast.success('Invoice updated.');
        })
      }
      className="rounded-lg border border-td-purple/15 bg-white px-3 py-1.5 text-xs font-semibold capitalize text-td-purple outline-none focus:border-td-accent"
    >
      {OPTIONS.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}
