import { ExternalLink } from 'lucide-react';
import { getAllInvoices } from '@/lib/admin-data';
import { PageHeader, Card, EmptyState } from '@/components/portal/ui';
import InvoiceStatusControl from './invoice-status';

export const metadata = { title: 'Invoices' };

const money = (n: number) => 'R ' + n.toLocaleString('en-ZA', { minimumFractionDigits: 2 });

export default async function AdminInvoicesPage() {
  const invoices = await getAllInvoices();
  const outstanding = invoices
    .filter((i) => i.status === 'unpaid' || i.status === 'overdue')
    .reduce((s, i) => s + Number(i.amount_zar), 0);

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Invoices"
        subtitle={
          outstanding > 0
            ? `${money(outstanding)} outstanding across ${invoices.length} invoice(s).`
            : `${invoices.length} invoice(s) on record.`
        }
      />

      {invoices.length === 0 ? (
        <EmptyState title="No invoices issued yet." hint="Generate one from a project page." />
      ) : (
        <div className="space-y-2">
          {invoices.map((inv) => (
            <Card key={inv.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
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
                {inv.pdf_drive_file_id && (
                  <a
                    href={`https://drive.google.com/file/d/${inv.pdf_drive_file_id}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-td-purple hover:text-td-accent"
                  >
                    PDF <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
