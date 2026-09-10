import Link from 'next/link';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { getClientContext, getClientMilestones, getClientOnboarding, getClientPaymentSchedule } from '@/lib/portal-data';
import { PageHeader, Card, SectionTitle, Badge, EmptyState } from '@/components/portal/ui';
import { summariseSchedule, PAYMENT_STATUS_TONE } from '@/lib/payment-schedule';

const money = (n: number) => 'R ' + n.toLocaleString('en-ZA', { minimumFractionDigits: 2 });
const shortDate = (d: string) =>
  new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_LABEL: Record<string, string> = {
  discovery: 'Discovery',
  in_progress: 'In progress',
  review: 'In review',
  completed: 'Completed',
  paused: 'Paused',
};

export default async function DashboardOverviewPage() {
  const { profile, project } = await getClientContext();
  const [milestones, onboarding, payments] = await Promise.all([
    project ? getClientMilestones(project.id) : Promise.resolve([]),
    getClientOnboarding(),
    project ? getClientPaymentSchedule(project.id) : Promise.resolve([]),
  ]);
  const pay = summariseSchedule(payments);

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const onboardingDone = onboarding?.status === 'submitted' || onboarding?.status === 'reviewed';

  return (
    <div className="max-w-4xl">
      <PageHeader title={`Welcome back, ${firstName}`} subtitle="Where your project stands right now." />

      {!project ? (
        <EmptyState
          title="Your project space is being set up."
          hint="Once your project kicks off, milestones and progress will appear here. In the meantime you can start the onboarding questionnaire."
        />
      ) : (
        <div className="space-y-6">
          {!onboardingDone && (
            <Card className="border-td-accent/30 bg-td-purple/[0.03]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-td-purple">Finish your onboarding questionnaire</p>
                  <p className="mt-0.5 text-xs text-gray-500">It tells us everything we need to get moving.</p>
                </div>
                <Link href="/dashboard/onboarding" className="inline-flex items-center gap-1.5 text-sm font-semibold text-td-purple hover:text-td-accent">
                  Continue <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Card>
          )}

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <SectionTitle className="mb-0">{project.title}</SectionTitle>
              <Badge tone={project.status === 'completed' ? 'green' : project.status === 'paused' ? 'amber' : 'purple'}>
                {STATUS_LABEL[project.status] ?? project.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Overall progress</span>
              <span className="font-semibold text-td-dark">{project.progress_percentage}%</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-td-purple/10">
              <div className="h-full rounded-full bg-td-accent transition-all" style={{ width: `${project.progress_percentage}%` }} />
            </div>
            {project.target_launch_date && (
              <p className="mt-3 text-xs text-gray-400">
                Target launch: {new Date(project.target_launch_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </Card>

          {payments.length > 0 && (
            <Card>
              <SectionTitle>Payments</SectionTitle>
              <p className="mb-4 text-sm text-gray-500">
                Total <b className="text-td-dark">{money(pay.total)}</b> · Paid{' '}
                <b className="text-td-dark">{money(pay.paid)}</b> · Outstanding{' '}
                <b className="text-td-dark">{money(pay.outstanding)}</b>
                {pay.next && (
                  <>
                    {' '}· Next{' '}
                    <b className="text-td-dark">
                      {money(Number(pay.next.amount_zar) - Number(pay.next.amount_paid_zar))}
                    </b>
                    {pay.next.due_date ? ` due ${shortDate(pay.next.due_date)}` : ''}
                  </>
                )}
              </p>
              <ul className="space-y-2">
                {payments.map((m) => {
                  const remaining = Number(m.amount_zar) - Number(m.amount_paid_zar);
                  return (
                    <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-td-purple/10 p-3">
                      <div>
                        <p className="text-sm font-medium text-td-dark">{m.label}</p>
                        <p className="text-xs text-gray-400">
                          {money(Number(m.amount_zar))}
                          {m.due_date && m.status !== 'paid' ? ` · due ${shortDate(m.due_date)}` : ''}
                          {m.status === 'partial' ? ` · ${money(remaining)} still due` : ''}
                        </p>
                      </div>
                      <Badge tone={PAYMENT_STATUS_TONE[m.status]}>
                        {m.status === 'invoiced' ? 'awaiting payment' : m.status}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs text-gray-400">
                Invoices and payment details are under <Link href="/dashboard/invoices" className="text-td-accent hover:underline">Invoices</Link>.
              </p>
            </Card>
          )}

          <Card>
            <SectionTitle>Milestones</SectionTitle>
            {milestones.length === 0 ? (
              <p className="text-sm italic text-gray-400">Milestones will be added as your project is scoped.</p>
            ) : (
              <ol className="relative ml-2 space-y-5 border-l border-td-purple/15">
                {milestones.map((m) => (
                  <li key={m.id} className="relative pl-6">
                    <span className="absolute -left-[9px] top-0.5">
                      {m.is_completed
                        ? <CheckCircle2 className="h-4 w-4 text-td-accent" fill="white" />
                        : <Circle className="h-4 w-4 text-td-purple/25" />}
                    </span>
                    <p className={`text-sm font-medium ${m.is_completed ? 'text-gray-400 line-through' : 'text-td-dark'}`}>
                      {m.title}
                    </p>
                    {m.due_date && (
                      <p className="text-xs text-gray-400">
                        {m.is_completed && m.completed_at
                          ? `Completed ${new Date(m.completed_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}`
                          : `Due ${new Date(m.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}`}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
