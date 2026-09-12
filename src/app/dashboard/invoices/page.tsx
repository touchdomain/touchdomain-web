import { ExternalLink } from 'lucide-react';
import { getClientInvoices, getClientPaymentProofs } from '@/lib/portal-data';
import { PageHeader, Card, Badge, EmptyState } from '@/components/portal/ui';
import type { InvoiceStatus } from '@/lib/database.types';
import ProofUpload from './proof-upload';

export const metadata = { title: 'Invoices' };

const TONE: Record<InvoiceStatus, 'green' | 'amber' | 'red' | 'neutral'> = {
  paid: 'green',
  unpaid: 'amber',
  overdue: 'red',
  cancelled: 'neutral',
};

const money = (n: number) => 'R ' + n.toLocaleString('en-ZA', { minimumFractionDigits: 2 });

export default async function InvoicesPage() {
  const [invoices, proofs] = await Promise.all([getClientInvoices(), getClientPaymentProofs()]);
  const outstanding = invoices
    .filter((i) => i.status === 'unpaid' || i.status === 'overdue')
    .reduce((s, i) => s + Number(i.amount_zar), 0);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Invoices"
        subtitle={outstanding > 0 ? `${money(outstanding)} currently outstanding.` : 'Your billing history.'}
      />

      {invoices.length === 0 ? (
        <EmptyState title="No invoices yet." />
      ) : (
        <div className="space-y-2">
          {invoices.map((inv) => {
            const invProofs = proofs.filter((p) => p.invoice_id === inv.id);
            return (
              <Card key={inv.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-td-dark">{inv.invoice_number}</p>
                    <p className="text-xs text-gray-400">
                      Due {new Date(inv.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className="text-sm font-semibold text-td-dark">{money(Number(inv.amount_zar))}</span>
                    <Badge tone={TONE[inv.status]}>{inv.status}</Badge>
                    {inv.pdf_drive_file_id && (
                      <a
                        href={`/api/invoices/${inv.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-td-purple hover:text-td-accent"
                      >
                        <span className="hidden sm:inline">View / download </span>PDF <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
                {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                  <ProofUpload
                    invoiceId={inv.id}
                    proofs={invProofs.map((p) => ({
                      id: p.id,
                      file_name: p.file_name,
                      reviewed: p.reviewed,
                      created_at: p.created_at,
                    }))}
                  />
                )}
              </Card>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-xs text-gray-400">
        Payment details are on each invoice PDF. Paid by EFT or ATM deposit? Upload the slip against the invoice
        above and we&apos;ll confirm it. Questions? Email{' '}
        <a href="mailto:helper@touchdomain.co.za" className="text-td-accent hover:underline">helper@touchdomain.co.za</a>.
      </p>
    </div>
  );
}
