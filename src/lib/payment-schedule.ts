// Payment-schedule logic for project contracts and installment invoices.
// Pure functions — safe to import from both server actions and client forms.

import type { PaymentMilestone, PaymentStatus } from '@/lib/database.types';

export type PaymentTier = 'small' | 'standard' | 'large';

export interface TierBand {
  tier: PaymentTier;
  label: string;
  /** Inclusive lower bound in ZAR. */
  min: number;
  hint: string;
}

export const TIER_BANDS: TierBand[] = [
  { tier: 'small', label: 'Small', min: 0, hint: 'Under R15,000' },
  { tier: 'standard', label: 'Standard', min: 15_000, hint: 'R15,000 – R60,000' },
  { tier: 'large', label: 'Large / Enterprise', min: 60_000, hint: 'R60,000+ or multi-month' },
];

export function suggestTier(totalFeeZar: number): PaymentTier {
  if (totalFeeZar >= 60_000) return 'large';
  if (totalFeeZar >= 15_000) return 'standard';
  return 'small';
}

export function tierLabel(tier: PaymentTier): string {
  return TIER_BANDS.find((b) => b.tier === tier)?.label ?? tier;
}

/** How a small project splits — 100% upfront, or 60/40. */
export type SmallStructure = 'upfront' | 'sixty_forty';

export interface ScheduleTemplateRow {
  label: string;
  percentage: number;
  /** Days after signing this installment falls due. */
  dueOffsetDays: number;
}

/**
 * The standard installment template for a tier. `dueOffsetDays` is relative to
 * the agreement date; the deposit is always due on signing (offset 0).
 */
export function scheduleTemplate(
  tier: PaymentTier,
  small: SmallStructure = 'upfront'
): ScheduleTemplateRow[] {
  if (tier === 'small') {
    return small === 'upfront'
      ? [{ label: 'Full payment on signature', percentage: 100, dueOffsetDays: 0 }]
      : [
          { label: 'Deposit on signature', percentage: 60, dueOffsetDays: 0 },
          { label: 'Balance before deployment', percentage: 40, dueOffsetDays: 21 },
        ];
  }
  if (tier === 'standard') {
    return [
      { label: 'Deposit on signature', percentage: 50, dueOffsetDays: 0 },
      { label: 'Staging / draft sign-off', percentage: 25, dueOffsetDays: 21 },
      { label: 'Final delivery & deployment', percentage: 25, dueOffsetDays: 35 },
    ];
  }
  return [
    { label: 'Deposit on signature', percentage: 40, dueOffsetDays: 0 },
    { label: 'Design / prototype approval', percentage: 30, dueOffsetDays: 21 },
    { label: 'Staging build & testing complete', percentage: 20, dueOffsetDays: 45 },
    { label: 'Final delivery & handover', percentage: 10, dueOffsetDays: 70 },
  ];
}

export interface DraftMilestone {
  label: string;
  percentage: number | null;
  amount_zar: number;
  due_date: string | null; // yyyy-mm-dd
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Add whole days to a yyyy-mm-dd date, returning yyyy-mm-dd. */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Build a concrete schedule from a template: resolves percentages to amounts
 * (absorbing rounding into the final row so the total is exact) and offsets to
 * calendar dates from `agreementDate`.
 */
export function buildSchedule(
  template: ScheduleTemplateRow[],
  totalFeeZar: number,
  agreementDate: string
): DraftMilestone[] {
  const rows = template.map((t) => ({
    label: t.label,
    percentage: t.percentage,
    amount_zar: round2((totalFeeZar * t.percentage) / 100),
    due_date: addDays(agreementDate, t.dueOffsetDays),
  }));
  const allButLast = rows.slice(0, -1).reduce((s, r) => s + r.amount_zar, 0);
  if (rows.length) rows[rows.length - 1].amount_zar = round2(totalFeeZar - allButLast);
  return rows;
}

// ── Rollups for display ──────────────────────────────────────────────
export interface ScheduleSummary {
  total: number;
  paid: number;
  outstanding: number;
  next: PaymentMilestone | null;
}

export function summariseSchedule(milestones: PaymentMilestone[]): ScheduleSummary {
  const live = milestones.filter((m) => m.status !== 'waived');
  const total = live.reduce((s, m) => s + Number(m.amount_zar), 0);
  const paid = live.reduce((s, m) => s + Number(m.amount_paid_zar), 0);
  const next =
    [...live]
      .filter((m) => m.status !== 'paid')
      .sort((a, b) => (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999'))[0] ?? null;
  return { total, paid, outstanding: round2(total - paid), next };
}

/** Derive a milestone's status from how much has been paid against it. */
export function statusForPayment(
  amountZar: number,
  amountPaidZar: number,
  current: PaymentStatus
): PaymentStatus {
  if (current === 'waived') return 'waived';
  if (amountPaidZar <= 0) return current === 'invoiced' ? 'invoiced' : 'pending';
  if (amountPaidZar >= amountZar) return 'paid';
  return 'partial';
}

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, 'neutral' | 'purple' | 'green' | 'amber' | 'red'> = {
  pending: 'neutral',
  invoiced: 'purple',
  partial: 'amber',
  paid: 'green',
  waived: 'neutral',
};
