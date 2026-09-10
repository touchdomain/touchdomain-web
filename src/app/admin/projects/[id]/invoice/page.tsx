import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getProjectDetail } from '@/lib/admin-data';
import { PageHeader } from '@/components/portal/ui';
import { summariseSchedule } from '@/lib/payment-schedule';
import InvoiceGenerator from './invoice-generator';

export const metadata = { title: 'New invoice' };

export default async function NewInvoicePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { milestone?: string };
}) {
  const detail = await getProjectDetail(params.id);
  if (!detail) notFound();
  const { project, paymentMilestones } = detail;

  const milestone = searchParams.milestone
    ? paymentMilestones.find((m) => m.id === searchParams.milestone) ?? null
    : null;

  const summary = summariseSchedule(paymentMilestones);

  return (
    <div className="max-w-3xl">
      <Link
        href={`/admin/projects/${project.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-td-purple hover:text-td-accent"
      >
        <ArrowLeft className="h-4 w-4" /> {project.title}
      </Link>
      <PageHeader
        title={milestone ? `Invoice — ${milestone.label}` : 'Generate invoice'}
        subtitle="Builds the PDF, files it to the project's Drive folder, and records it against the client."
      />
      <InvoiceGenerator
        projectId={project.id}
        clientId={project.client_id}
        client={{
          name: project.profiles?.full_name ?? 'Client',
          company: project.profiles?.company_name ?? null,
          email: project.profiles?.email ?? '',
        }}
        milestone={
          milestone
            ? {
                id: milestone.id,
                label: milestone.label,
                percentage: milestone.percentage,
                amountZar: Number(milestone.amount_zar),
                dueDate: milestone.due_date,
              }
            : null
        }
        schedule={paymentMilestones
          .filter((m) => m.status !== 'waived')
          .map((m) => ({
            label: m.label,
            amountZar: Number(m.amount_zar),
            dueDate: m.due_date,
            paid: m.status === 'paid',
          }))}
        projectTotal={project.total_fee_zar != null ? Number(project.total_fee_zar) : summary.total || null}
        paidToDate={summary.paid}
      />
    </div>
  );
}
