'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, Download } from 'lucide-react';
import {
  generateInvoiceDoc,
  generateInvoiceBlob,
  downloadDoc,
  TD_BANKING,
  type InvoiceLineItem,
  type InvoiceData,
} from '@/lib/pdf/generate';
import { createInvoice } from '@/lib/actions/invoices';
import { Card, SectionTitle, inputClass, btnPrimary, btnSecondary } from '@/components/portal/ui';

interface MilestoneCtx {
  id: string;
  label: string;
  percentage: number | null;
  amountZar: number;
  dueDate: string | null;
}
interface ScheduleRow {
  label: string;
  amountZar: number;
  dueDate: string | null;
  paid: boolean;
}
interface Props {
  projectId: string;
  clientId: string;
  defaultInvoiceNumber: string;
  defaultTerms: string;
  client: { name: string; company: string | null; email: string; address?: string };
  milestone: MilestoneCtx | null;
  schedule: ScheduleRow[];
  projectTotal: number | null;
  paidToDate: number;
}

const today = () => new Date().toISOString().split('T')[0];
const plusDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

export default function InvoiceGenerator({
  projectId,
  clientId,
  defaultInvoiceNumber,
  defaultTerms,
  client,
  milestone,
  schedule,
  projectTotal,
  paidToDate,
}: Props) {
  const router = useRouter();
  const [invoiceNumber, setInvoiceNumber] = useState(defaultInvoiceNumber);
  const [issueDate, setIssueDate] = useState(today());
  const [dueDate, setDueDate] = useState(milestone?.dueDate || plusDays(7));
  const [reference, setReference] = useState('');
  const [terms, setTerms] = useState(defaultTerms);
  const [notes, setNotes] = useState('');
  const [isTaxInvoice, setIsTaxInvoice] = useState(false);
  const [vatNumber, setVatNumber] = useState('');
  const [bank, setBank] = useState({ ...TD_BANKING });

  const covers = milestone
    ? `${milestone.label}${milestone.percentage != null ? ` (${milestone.percentage}%)` : ''}`
    : '';

  const [items, setItems] = useState<InvoiceLineItem[]>(
    milestone
      ? [{ description: covers || 'Deposit to commence work', quantity: 1, unitPrice: milestone.amountZar }]
      : [{ description: '', quantity: 1, unitPrice: 0 }]
  );
  const [saving, setSaving] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0),
    [items]
  );
  const total = isTaxInvoice ? Math.round(subtotal * 1.15 * 100) / 100 : subtotal;

  const setItem = (i: number, patch: Partial<InvoiceLineItem>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const build = (): InvoiceData => ({
    invoiceNumber: invoiceNumber.trim(),
    issueDate,
    dueDate,
    clientName: client.name,
    clientCompany: client.company ?? undefined,
    clientEmail: client.email,
    clientAddress: client.address,
    lineItems: items.filter((it) => it.description.trim()),
    notes: notes.trim() || undefined,
    reference: reference.trim() || undefined,
    paymentTerms: terms.trim() || undefined,
    covers: covers || undefined,
    isTaxInvoice,
    vatNumber: isTaxInvoice ? vatNumber.trim() || undefined : undefined,
    banking: bank,
    schedule: schedule.length > 1 ? schedule.map((s) => ({ label: s.label, amountZar: s.amountZar, dueDate: s.dueDate, paid: s.paid })) : undefined,
    projectTotal: projectTotal ?? undefined,
    paidToDate,
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
      if (milestone) fd.append('milestoneId', milestone.id);
      fd.append('invoiceNumber', invoiceNumber.trim());
      fd.append('amountZar', String(total));
      fd.append('dueDate', dueDate);
      if (covers) fd.append('description', covers);
      if (reference.trim()) fd.append('reference', reference.trim());
      fd.append('isTaxInvoice', String(isTaxInvoice));

      const res = await createInvoice(fd);
      if (res.success) {
        if (res.data?.filed) toast.success('Invoice issued and filed to Drive.');
        else toast.warning(res.error || 'Invoice recorded, but the PDF was not filed to Drive.');
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
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-td-dark">Reference (SOW / plan)</span>
            <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. SOW TD-2026-014" className={inputClass} />
          </label>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Billing: {client.name}{client.company ? ` · ${client.company}` : ''} · {client.email}
          {covers && <> · covers <b className="text-td-dark">{covers}</b></>}
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

        <div className="mt-4 space-y-1 border-t border-td-purple/10 pt-3 text-right text-sm">
          {isTaxInvoice && (
            <>
              <div className="text-gray-500">Subtotal <span className="ml-3 font-medium text-td-dark">R {subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span></div>
              <div className="text-gray-500">VAT 15% <span className="ml-3 font-medium text-td-dark">R {(total - subtotal).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span></div>
            </>
          )}
          <div className="text-gray-500">Total due <span className="ml-3 text-lg font-bold text-td-purple">R {total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span></div>
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-medium text-td-dark">Payment terms</span>
          <textarea rows={2} value={terms} onChange={(e) => setTerms(e.target.value)} className={`${inputClass} resize-y`} />
        </label>

        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-medium text-td-dark">Notes (optional)</span>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} resize-y`} />
        </label>
      </Card>

      <Card>
        <SectionTitle>VAT & banking</SectionTitle>
        <label className="flex items-start gap-2.5">
          <input
            type="checkbox"
            checked={isTaxInvoice}
            onChange={(e) => setIsTaxInvoice(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-td-purple/30 text-td-purple focus:ring-td-accent"
          />
          <span className="text-sm text-td-dark">
            This is a <b>Tax Invoice</b> (Touch Domain is VAT-registered)
            <span className="mt-0.5 block text-xs text-gray-400">
              Leave off until registered. Off = heading reads &quot;INVOICE&quot;, no VAT line, and the PDF states Touch Domain is not a registered VAT vendor.
            </span>
          </span>
        </label>
        {isTaxInvoice && (
          <label className="mt-3 block max-w-xs">
            <span className="mb-1 block text-sm font-medium text-td-dark">VAT registration number</span>
            <input value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} placeholder="4XXXXXXXXX" className={inputClass} />
          </label>
        )}

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Bank" value={bank.bank} onChange={(v) => setBank((b) => ({ ...b, bank: v }))} />
          <Field label="Account holder" value={bank.holder} onChange={(v) => setBank((b) => ({ ...b, holder: v }))} />
          <Field label="Account number" value={bank.account} onChange={(v) => setBank((b) => ({ ...b, account: v }))} />
          <Field label="Branch code" value={bank.branch} onChange={(v) => setBank((b) => ({ ...b, branch: v }))} />
        </div>
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

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-td-dark">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </label>
  );
}
