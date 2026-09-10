import { ExternalLink } from 'lucide-react';
import { getClientInvoices } from '@/lib/portal-data';
import { PageHeader, Card, Badge, EmptyState } from '@/components/portal/ui';
import type { InvoiceStatus } from '@/lib/database.types';

export const metadata = { title: 'Invoices' };

const TONE: Record<InvoiceStatus, 'green' | 'amber' | 'red' | 'neutral'> = {
  paid: 'green',
  unpaid: 'amber',
  overdue: 'red',
  cancelled: 'neutral',
};

const money = (n: number) => 'R ' + n.toLocaleString('en-ZA', { minimumFractionDigits: 2 });

export default async function InvoicesPage() {
  const invoices = await getClientInvoices();
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
          {invoices.map((inv) => (
            <Card key={inv.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-semibold text-td-dark">{inv.invoice_number}</p>
                <p className="text-xs text-gray-400">
                  Due {new Date(inv.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-td-dark">{money(Number(inv.amount_zar))}</span>
                <Badge tone={TONE[inv.status]}>{inv.status}</Badge>
                {inv.pdf_storage_path ? (
                  <a
                    href={`/api/invoices/${inv.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-td-purple hover:text-td-accent"
                  >
                    View / download PDF <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : inv.pdf_drive_file_id ? (
                  <a
                    href={`https://drive.google.com/file/d/${inv.pdf_drive_file_id}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-td-purple hover:text-td-accent"
                  >
                    PDF <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-gray-400">
        Payment details are on each invoice PDF. Questions? Email{' '}
        <a href="mailto:helper@touchdomain.co.za" className="text-td-accent hover:underline">helper@touchdomain.co.za</a>.
      </p>
    </div>
  );
}
