'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, Download } from 'lucide-react';
import { generateInvoiceDoc, generateInvoiceBlob, downloadDoc, type InvoiceLineItem } from '@/lib/pdf/generate';
import { createInvoice } from '@/lib/actions/invoices';
import { Card, SectionTitle, inputClass, btnPrimary, btnSecondary } from '@/components/portal/ui';

interface Props {
  projectId: string;
  clientId: string;
  client: { name: string; company: string | null; email: string; address?: string };
}

const today = () => new Date().toISOString().split('T')[0];
const plusDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

export default function InvoiceGenerator({ projectId, clientId, client }: Props) {
  const router = useRouter();
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-`);
  const [issueDate, setIssueDate] = useState(today());
  const [dueDate, setDueDate] = useState(plusDays(14));
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceLineItem[]>([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [saving, setSaving] = useState(false);

  const total = useMemo(
    () => items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0),
    [items]
  );

  const setItem = (i: number, patch: Partial<InvoiceLineItem>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const build = () => ({
    invoiceNumber: invoiceNumber.trim(),
    issueDate,
    dueDate,
    clientName: client.name,
    clientCompany: client.company ?? undefined,
    clientEmail: client.email,
    clientAddress: client.address,
    lineItems: items.filter((it) => it.description.trim()),
    notes: notes.trim() || undefined,
  });

  const valid = () =>
    invoiceNumber.trim().length > 3 &&
    dueDate &&
    items.some((it) => it.description.trim() && it.unitPrice > 0);

  const preview = () => {
    if (!valid()) return toast.error('Add an invoice number and at least one line item.');
    downloadDoc(generateInvoiceDoc(build()), `${invoiceNumber.trim()}.pdf`);
  };

  const issue = async () => {
    if (!valid()) return toast.error('Add an invoice number and at least one line item.');
    setSaving(true);
    try {
      const blob = generateInvoiceBlob(build());
      const fd = new FormData();
      fd.append('file', blob, `${invoiceNumber.trim()}.pdf`);
      fd.append('clientId', clientId);
      fd.append('projectId', projectId);
      fd.append('invoiceNumber', invoiceNumber.trim());
      fd.append('amountZar', String(total));
      fd.append('dueDate', dueDate);

      const res = await createInvoice(fd);
      if (res.success) {
        toast.success('Invoice issued and filed to Drive.');
        router.push(`/admin/projects/${projectId}`);
      } else {
        toast.error(res.error);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to issue invoice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <SectionTitle>Invoice details</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block sm:col-span-3">
            <span className="mb-1 block text-sm font-medium text-td-dark">Invoice number</span>
            <input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-td-dark">Issue date</span>
            <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-td-dark">Due date</span>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
          </label>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Billing: {client.name}{client.company ? ` · ${client.company}` : ''} · {client.email}
        </p>
      </Card>

      <Card>
        <SectionTitle>Line items</SectionTitle>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-[1fr_60px_100px_28px] items-center gap-2">
              <input
                placeholder="Description"
                value={it.description}
                onChange={(e) => setItem(i, { description: e.target.value })}
                className={inputClass}
              />
              <input
                type="number" min={1} value={it.quantity}
                onChange={(e) => setItem(i, { quantity: Number(e.target.value) })}
                className={`${inputClass} text-center`}
              />
              <input
                type="number" min={0} step="0.01" placeholder="0.00" value={it.unitPrice || ''}
                onChange={(e) => setItem(i, { unitPrice: Number(e.target.value) })}
                className={`${inputClass} text-right`}
              />
              <button
                onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))}
                disabled={items.length === 1}
                className="text-gray-300 hover:text-red-500 disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setItems((p) => [...p, { description: '', quantity: 1, unitPrice: 0 }])}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-td-purple hover:text-td-accent"
        >
          <Plus className="h-4 w-4" /> Add line
        </button>

        <div className="mt-4 flex items-center justify-end gap-3 border-t border-td-purple/10 pt-3">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-lg font-bold text-td-purple">
            R {total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-medium text-td-dark">Notes (optional)</span>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} resize-y`} />
        </label>
      </Card>

      <div className="flex flex-wrap justify-end gap-3">
        <button onClick={preview} className={btnSecondary}>
          <Download className="h-4 w-4" /> Preview PDF
        </button>
        <button onClick={issue} disabled={saving} className={btnPrimary}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Issue invoice
        </button>
      </div>
    </div>
  );
}
