import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { downloadFromDrive } from '@/lib/gdrive';

/**
 * Streams an invoice PDF to the signed-in user. RLS on `invoices` means a
 * client only ever resolves their own row; admins resolve any. The PDF lives
 * in the Shared Drive (which clients can't see directly), so the service
 * account fetches the bytes and this route proxies them.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: invoice } = await supabase
    .from('invoices')
    .select('invoice_number, pdf_drive_file_id')
    .eq('id', params.id)
    .maybeSingle();

  if (!invoice?.pdf_drive_file_id) {
    return NextResponse.json({ error: 'Invoice PDF not found' }, { status: 404 });
  }

  try {
    const bytes = await downloadFromDrive(invoice.pdf_drive_file_id);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${invoice.invoice_number}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Could not read the PDF from Drive' }, { status: 502 });
  }
}
