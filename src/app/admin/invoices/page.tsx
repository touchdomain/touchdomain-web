import { ExternalLink } from 'lucide-react';
import { getAllInvoices, getPaymentProofs } from '@/lib/admin-data';
import { PageHeader, Card, EmptyState, Badge } from '@/components/portal/ui';
import InvoiceStatusControl from './invoice-status';
import ProofReview from './proof-review';

export const metadata = { title: 'Invoices' };

const money = (n: number) => 'R ' + n.toLocaleString('en-ZA', { minimumFractionDigits: 2 });

export default async function AdminInvoicesPage() {
  const [invoices, proofs] = await Promise.all([getAllInvoices(), getPaymentProofs()]);
  const outstanding = invoices
    .filter((i) => i.status === 'unpaid' || i.status === 'overdue')
    .reduce((s, i) => s + Number(i.amount_zar), 0);
  const pendingProofs = proofs.filter((p) => !p.reviewed).length;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Invoices"
        subtitle={
          outstanding > 0
            ? `${money(outstanding)} outstanding across ${invoices.length} invoice(s).`
            : `${invoices.length} invoice(s) on record.`
        }
        action={pendingProofs > 0 ? <Badge tone="amber">{pendingProofs} proof(s) to review</Badge> : undefined}
      />

      {invoices.length === 0 ? (
        <EmptyState title="No invoices issued yet." hint="Generate one from a project page." />
      ) : (
        <div className="space-y-2">
          {invoices.map((inv) => {
            const invProofs = proofs.filter((p) => p.invoice_id === inv.id);
            return (
              <Card key={inv.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-td-dark">{inv.invoice_number}</p>
                    <p className="text-xs text-gray-400">
                      {inv.profiles?.company_name || inv.profiles?.full_name || 'Client'} · due{' '}
                      {new Date(inv.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-td-dark">{money(Number(inv.amount_zar))}</span>
                    <InvoiceStatusControl invoiceId={inv.id} status={inv.status} />
                    {inv.pdf_drive_file_id ? (
                      <a
                        href={`/api/invoices/${inv.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-td-purple hover:text-td-accent"
                      >
                        PDF <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-300">no PDF</span>
                    )}
                  </div>
                </div>
                <ProofReview
                  proofs={invProofs.map((p) => ({
                    id: p.id,
                    view_link: p.view_link,
                    note: p.note,
                    amount_zar: p.amount_zar,
                    reviewed: p.reviewed,
                    created_at: p.created_at,
                  }))}
                />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
