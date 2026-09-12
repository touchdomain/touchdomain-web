import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-3 border-b border-td-purple/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-td-dark sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn('mb-3 text-base font-bold normal-case tracking-normal text-td-purple', className)}>
      {children}
    </h2>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-td-purple/10 bg-white p-4 shadow-[0_1px_3px_rgba(69,44,99,0.04)] sm:p-6', className)}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
          <p className="mt-1.5 truncate text-xl font-bold text-td-dark sm:text-2xl">{value}</p>
          {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
        </div>
        {Icon && <Icon className="h-5 w-5 text-td-accent" />}
      </div>
    </Card>
  );
}

const BADGE_TONES = {
  neutral: 'bg-gray-100 text-gray-600',
  purple: 'bg-td-purple/10 text-td-purple',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-600',
} as const;

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: keyof typeof BADGE_TONES;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        BADGE_TONES[tone]
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-td-purple/20 bg-white/50 p-6 text-center sm:p-10">
      <p className="text-sm font-medium text-td-dark">{title}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-td-purple px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-td-accent disabled:opacity-50';
export const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-full border border-td-purple/25 px-5 py-2.5 text-sm font-semibold text-td-purple transition-colors hover:bg-td-purple hover:text-white disabled:opacity-50';
export const inputClass =
  'w-full rounded-lg border border-td-purple/15 bg-white px-3.5 py-2.5 text-sm text-td-dark placeholder:text-gray-400 outline-none transition-colors focus:border-td-accent focus:ring-1 focus:ring-td-accent';

export function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={btnPrimary}>
      {children}
    </Link>
  );
}
