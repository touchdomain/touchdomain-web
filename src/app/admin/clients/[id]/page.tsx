import { notFound } from 'next/navigation';
import Link from 'next/link';
import { headers } from 'next/headers';
import { ArrowLeft, ExternalLink, FolderKanban } from 'lucide-react';
import { getClientDetail } from '@/lib/admin-data';
import { PageHeader, Card, Badge, SectionTitle, EmptyState } from '@/components/portal/ui';
import UserActions from '../user-actions';
import type { InvoiceStatus, ContractStatus } from '@/lib/database.types';

export const metadata = { title: 'Client' };

const INVOICE_TONE: Record<InvoiceStatus, 'green' | 'amber' | 'red' | 'neutral'> = {
  paid: 'green',
  unpaid: 'amber',
  overdue: 'red',
  cancelled: 'neutral',
};

const CONTRACT_TONE: Record<ContractStatus, 'amber' | 'purple' | 'green' | 'neutral'> = {
  draft: 'neutral',
  sent: 'amber',
  client_signed: 'purple',
  executed: 'green',
  void: 'neutral',
};

const money = (n: number) => 'R ' + n.toLocaleString('en-ZA', { minimumFractionDigits: 2 });
const shortDate = (d: string) =>
  new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  // Middleware already verified who this is for this request.
  const meId = headers().get('x-user-id');
  const detail = await getClientDetail(params.id);
  if (!detail) notFound();
  const { profile, projects, invoices, contracts } = detail;

  return (
    <div className="max-w-4xl">
      <Link href="/admin/clients" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-td-purple hover:text-td-accent">
        <ArrowLeft className="h-4 w-4" /> Clients &amp; staff
      </Link>

      <PageHeader
        title={profile.full_name}
        subtitle={[profile.company_name, profile.email, profile.phone].filter(Boolean).join(' · ')}
        action={
          <UserActions
            userId={profile.id}
            name={profile.full_name}
            role={profile.role}
            isSelf={profile.id === meId}
            redirectAfterDelete="/admin/clients"
          />
        }
      />

      <div className="space-y-6">
        <Card>
          <SectionTitle>Projects</SectionTitle>
          {projects.length === 0 ? (
            <EmptyState title="No projects yet." />
          ) : (
            <div className="space-y-2">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/projects/${p.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-td-purple/10 p-3 hover:border-td-accent/50 hover:bg-td-purple/[0.03]"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <FolderKanban className="h-4 w-4 shrink-0 text-td-accent" />
                    <span className="truncate text-sm font-medium text-td-dark">{p.title}</span>
                  </span>
                  <Badge tone={p.status === 'completed' ? 'green' : p.status === 'paused' ? 'amber' : 'purple'}>
                    {p.progress_percentage}%
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle>Invoices</SectionTitle>
          {invoices.length === 0 ? (
            <p className="text-sm italic text-gray-400">No invoices yet.</p>
          ) : (
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-td-purple/10 p-3">
                  <div>
                    <p className="text-sm font-medium text-td-dark">{inv.invoice_number}</p>
                    <p className="text-xs text-gray-400">Due {shortDate(inv.due_date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-td-dark">{money(Number(inv.amount_zar))}</span>
                    <Badge tone={INVOICE_TONE[inv.status]}>{inv.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle>Contracts</SectionTitle>
          {contracts.length === 0 ? (
            <p className="text-sm italic text-gray-400">No contracts yet.</p>
          ) : (
            <div className="space-y-2">
              {contracts.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-td-purple/10 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-td-dark">{c.title}</p>
                    <p className="text-xs text-gray-400">Sent {shortDate(c.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={CONTRACT_TONE[c.status]}>{c.status.replace('_', ' ')}</Badge>
                    <a
                      href={`https://drive.google.com/file/d/${c.executed_drive_file_id || c.source_drive_file_id}/view`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-td-purple hover:text-td-accent"
                    >
                      Open <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
