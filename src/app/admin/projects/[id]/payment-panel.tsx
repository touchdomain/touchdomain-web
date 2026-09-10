'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, ReceiptText, Wand2 } from 'lucide-react';
import {
  savePaymentSchedule,
  recordPayment,
  updateMilestone,
  addMilestone,
  deleteMilestone,
} from '@/lib/actions/payments';
import {
  suggestTier,
  tierLabel,
  scheduleTemplate,
  buildSchedule,
  summariseSchedule,
  PAYMENT_STATUS_TONE,
  TIER_BANDS,
  type PaymentTier,
  type SmallStructure,
} from '@/lib/payment-schedule';
import { Card, SectionTitle, Badge, inputClass, btnPrimary, btnSecondary } from '@/components/portal/ui';
import type { PaymentMilestone } from '@/lib/database.types';

const money = (n: number) => 'R ' + n.toLocaleString('en-ZA', { minimumFractionDigits: 2 });
const LOCKED = new Set(['invoiced', 'partial', 'paid']);

interface Props {
  projectId: string;
  agreementDate: string; // yyyy-mm-dd — project created_at or launch anchor
  totalFeeZar: number | null;
  milestones: PaymentMilestone[];
}

export default function PaymentPanel({ projectId, agreementDate, totalFeeZar, milestones }: Props) {
  const [pending, start] = useTransition();
  const hasLocked = milestones.some((m) => LOCKED.has(m.status));
  const summary = useMemo(() => summariseSchedule(milestones), [milestones]);

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <SectionTitle className="mb-0">Payments</SectionTitle>
        {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-td-accent" />}
      </div>

      {milestones.length > 0 && (
        <p className="mb-4 text-sm text-gray-500">
          Total <b className="text-td-dark">{money(summary.total)}</b> · Paid{' '}
          <b className="text-td-dark">{money(summary.paid)}</b> · Outstanding{' '}
          <b className="text-td-dark">{money(summary.outstanding)}</b>
          {summary.next && (
            <>
              {' '}· Next{' '}
              <b className="text-td-dark">
                {money(Number(summary.next.amount_zar) - Number(summary.next.amount_paid_zar))}
              </b>
              {summary.next.due_date
                ? ` due ${new Date(summary.next.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}`
                : ''}
            </>
          )}
        </p>
      )}

      {milestones.length === 0 ? (
        <ScheduleBuilder projectId={projectId} agreementDate={agreementDate} initialFee={totalFeeZar} />
      ) : (
        <div className="space-y-2">
          {milestones.map((m) => (
            <MilestoneRow key={m.id} milestone={m} projectId={projectId} start={start} pending={pending} />
          ))}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <AddInstallment projectId={projectId} start={start} pending={pending} />
            {!hasLocked && (
              <RegenerateSchedule
                projectId={projectId}
                agreementDate={agreementDate}
                initialFee={totalFeeZar}
              />
            )}
          </div>
          {hasLocked && (
            <p className="pt-1 text-xs text-gray-400">
              Some installments are invoiced or paid — edit those rows individually; the schedule can&apos;t be regenerated wholesale.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

// ── Row ──────────────────────────────────────────────────────────────
function MilestoneRow({
  milestone: m,
  projectId,
  start,
  pending,
}: {
  milestone: PaymentMilestone;
  projectId: string;
  start: React.TransitionStartFunction;
  pending: boolean;
}) {
  const [paid, setPaid] = useState(String(m.amount_paid_zar || ''));
  const locked = LOCKED.has(m.status);
  const remaining = Number(m.amount_zar) - Number(m.amount_paid_zar);

  const savePaid = () => {
    const val = Number(paid) || 0;
    start(async () => {
      const res = await recordPayment(m.id, val);
      if (!res.success) toast.error(res.error);
      else toast.success('Payment recorded.');
    });
  };

  const waive = () => {
    start(async () => {
      const res = await updateMilestone(m.id, { status: m.status === 'waived' ? 'pending' : 'waived' });
      if (!res.success) toast.error(res.error);
    });
  };

  const remove = () => {
    start(async () => {
      const res = await deleteMilestone(m.id);
      if (!res.success) toast.error(res.error);
    });
  };

  return (
    <div className="rounded-xl border border-td-purple/10 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-td-dark">
            {m.label}
            {m.percentage != null && <span className="ml-1.5 text-xs text-gray-400">{m.percentage}%</span>}
          </p>
          <p className="text-xs text-gray-400">
            {money(Number(m.amount_zar))}
            {m.due_date &&
              ` · due ${new Date(m.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={PAYMENT_STATUS_TONE[m.status]}>{m.status}</Badge>
          {m.status === 'pending' && (
            <Link
              href={`/admin/projects/${projectId}/invoice?milestone=${m.id}`}
              className="inline-flex items-center gap-1 rounded-full border border-td-purple/25 px-2.5 py-1 text-xs font-semibold text-td-purple hover:bg-td-purple hover:text-white"
            >
              <ReceiptText className="h-3.5 w-3.5" /> Invoice
            </Link>
          )}
          {!locked && (
            <button onClick={remove} disabled={pending} className="text-gray-300 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {m.status !== 'waived' && (
        <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-td-purple/5 pt-2">
          <span className="text-xs text-gray-400">Paid to date</span>
          <input
            type="number"
            min={0}
            value={paid}
            onChange={(e) => setPaid(e.target.value)}
            className={`${inputClass} h-8 w-32 py-1 text-right text-sm`}
          />
          <button
            onClick={savePaid}
            disabled={pending}
            className="rounded-full bg-td-purple/10 px-3 py-1 text-xs font-semibold text-td-purple hover:bg-td-purple hover:text-white"
          >
            Record
          </button>
          {remaining > 0 && Number(m.amount_paid_zar) > 0 && (
            <span className="text-xs text-amber-600">{money(remaining)} still due</span>
          )}
          <button onClick={waive} disabled={pending} className="ml-auto text-xs text-gray-400 hover:text-td-dark">
            Waive
          </button>
        </div>
      )}
    </div>
  );
}

// ── Schedule builder (no schedule yet) ───────────────────────────────
function ScheduleBuilder({
  projectId,
  agreementDate,
  initialFee,
}: {
  projectId: string;
  agreementDate: string;
  initialFee: number | null;
}) {
  const [pending, start] = useTransition();
  const [fee, setFee] = useState(String(initialFee || ''));
  const [tier, setTier] = useState<PaymentTier>(suggestTier(Number(initialFee) || 0));
  const [small, setSmall] = useState<SmallStructure>('upfront');
  const [anchor, setAnchor] = useState(agreementDate);
  const [rows, setRows] = useState(() =>
    buildSchedule(scheduleTemplate(tier, small), Number(fee) || 0, agreementDate)
  );

  const regen = (t = tier, s = small, f = fee, a = anchor) => {
    setRows(buildSchedule(scheduleTemplate(t, s), Number(f) || 0, a));
  };

  const setRow = (i: number, patch: Partial<(typeof rows)[number]>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const save = () => {
    const total = Number(fee) || 0;
    const clean = rows
      .filter((r) => r.label.trim() && Number(r.amount_zar) > 0)
      .map((r) => ({
        label: r.label.trim(),
        percentage: r.percentage,
        amount_zar: Number(r.amount_zar),
        due_date: r.due_date || null,
      }));
    start(async () => {
      const res = await savePaymentSchedule(projectId, total, clean);
      if (!res.success) toast.error(res.error);
      else toast.success('Payment schedule saved.');
    });
  };

  const scheduledTotal = rows.reduce((s, r) => s + (Number(r.amount_zar) || 0), 0);

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        No payment schedule yet. Set the total fee and structure, tune the rows, then save.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-gray-400">Total project fee (ZAR)</span>
          <input
            type="number"
            min={0}
            value={fee}
            onChange={(e) => {
              setFee(e.target.value);
              const t = suggestTier(Number(e.target.value) || 0);
              setTier(t);
              regen(t, small, e.target.value);
            }}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-gray-400">Structure</span>
          <select
            value={tier}
            onChange={(e) => {
              const t = e.target.value as PaymentTier;
              setTier(t);
              regen(t);
            }}
            className={inputClass}
          >
            {TIER_BANDS.map((b) => (
              <option key={b.tier} value={b.tier}>{b.label} — {b.hint}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-gray-400">Agreement date</span>
          <input
            type="date"
            value={anchor}
            onChange={(e) => {
              setAnchor(e.target.value);
              regen(tier, small, fee, e.target.value);
            }}
            className={inputClass}
          />
        </label>
      </div>

      {tier === 'small' && (
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-gray-400">Small-project split</span>
          <select
            value={small}
            onChange={(e) => {
              const s = e.target.value as SmallStructure;
              setSmall(s);
              regen(tier, s);
            }}
            className={inputClass}
          >
            <option value="upfront">100% on signature</option>
            <option value="sixty_forty">60% deposit / 40% before deployment</option>
          </select>
        </label>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400">
              <th className="pb-2 pr-2 font-semibold">Installment</th>
              <th className="pb-2 px-2 font-semibold">Amount</th>
              <th className="pb-2 pl-2 font-semibold">Due</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-td-purple/5">
                <td className="py-1.5 pr-2">
                  <input value={r.label} onChange={(e) => setRow(i, { label: e.target.value })} className={`${inputClass} h-8 py-1`} />
                </td>
                <td className="py-1.5 px-2">
                  <input type="number" min={0} value={r.amount_zar} onChange={(e) => setRow(i, { amount_zar: Number(e.target.value) })} className={`${inputClass} h-8 w-28 py-1 text-right`} />
                </td>
                <td className="py-1.5 pl-2">
                  <input type="date" value={r.due_date ?? ''} onChange={(e) => setRow(i, { due_date: e.target.value })} className={`${inputClass} h-8 py-1`} />
                </td>
                <td className="pl-2">
                  <button onClick={() => setRows((p) => p.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setRows((p) => [...p, { label: '', percentage: null, amount_zar: 0, due_date: anchor }])}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-td-purple hover:text-td-accent"
        >
          <Plus className="h-4 w-4" /> Add row
        </button>
        <span className={`text-xs ${Math.abs(scheduledTotal - (Number(fee) || 0)) > 1 ? 'text-red-500' : 'text-gray-400'}`}>
          Rows total {money(scheduledTotal)} vs fee {money(Number(fee) || 0)}
        </span>
        <button onClick={save} disabled={pending} className={`${btnPrimary} ml-auto`}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Save schedule
        </button>
      </div>
    </div>
  );
}

function RegenerateSchedule(props: { projectId: string; agreementDate: string; initialFee: number | null }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs font-semibold text-gray-400 hover:text-td-dark">
        Regenerate schedule
      </button>
    );
  }
  return (
    <div className="w-full rounded-xl border border-td-purple/10 p-3">
      <ScheduleBuilder {...props} />
    </div>
  );
}

function AddInstallment({
  projectId,
  start,
  pending,
}: {
  projectId: string;
  start: React.TransitionStartFunction;
  pending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [due, setDue] = useState('');

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !(Number(amount) > 0)) return;
    start(async () => {
      const res = await addMilestone(projectId, {
        label: label.trim(),
        amount_zar: Number(amount),
        due_date: due || null,
      });
      if (res.success) {
        setLabel(''); setAmount(''); setDue(''); setOpen(false);
      } else toast.error(res.error);
    });
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-td-purple hover:text-td-accent">
        <Plus className="h-4 w-4" /> Add installment
      </button>
    );
  }
  return (
    <form onSubmit={add} className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-td-purple/10 p-3">
      <input autoFocus value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className={`${inputClass} h-8 flex-1 py-1`} />
      <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className={`${inputClass} h-8 w-28 py-1 text-right`} />
      <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={`${inputClass} h-8 py-1`} />
      <button type="submit" disabled={pending} className={btnSecondary}>Add</button>
      <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-400 hover:text-td-dark">Cancel</button>
    </form>
  );
}
