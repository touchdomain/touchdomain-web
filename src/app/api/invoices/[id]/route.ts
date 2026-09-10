import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Streams an invoice PDF to the signed-in user. RLS on `invoices` and on the
 * `invoices` storage bucket means a client only ever gets their own; admins
 * get any. No PDF stored → 404.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: invoice } = await supabase
    .from('invoices')
    .select('invoice_number, pdf_storage_path')
    .eq('id', params.id)
    .maybeSingle();

  if (!invoice?.pdf_storage_path) {
    return NextResponse.json({ error: 'Invoice PDF not found' }, { status: 404 });
  }

  const { data: file, error } = await supabase.storage
    .from('invoices')
    .download(invoice.pdf_storage_path);
  if (error || !file) {
    return NextResponse.json({ error: 'Could not read the PDF' }, { status: 404 });
  }

  return new NextResponse(file, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoice.invoice_number}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
