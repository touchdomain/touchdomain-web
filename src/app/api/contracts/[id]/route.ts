import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { downloadFromDrive } from '@/lib/gdrive';

/**
 * Streams a contract PDF to the signed-in user. RLS on `contracts` scopes a
 * client to their own; admins get any. Serves the executed (signed) PDF once
 * it exists, otherwise the unsigned source. ?v=source forces the source.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: contract } = await supabase
    .from('contracts')
    .select('title, status, source_drive_file_id, executed_drive_file_id')
    .eq('id', params.id)
    .maybeSingle();
  if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const wantSource = new URL(req.url).searchParams.get('v') === 'source';
  const fileId =
    !wantSource && contract.executed_drive_file_id
      ? contract.executed_drive_file_id
      : contract.source_drive_file_id;

  try {
    const bytes = await downloadFromDrive(fileId);
    const suffix = fileId === contract.executed_drive_file_id ? 'signed' : 'unsigned';
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${contract.title} (${suffix}).pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Could not read the PDF from Drive' }, { status: 502 });
  }
}
