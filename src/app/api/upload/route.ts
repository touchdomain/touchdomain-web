import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadToDrive } from '@/lib/gdrive';

// Client asset uploads only. The client's own project + Drive folder are
// resolved server-side — the browser never chooses where a file lands.
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const BLOCKED_EXT = /\.(exe|bat|cmd|sh|msi|scr|com|dll|jar)$/i;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File must be between 1 byte and 25 MB' }, { status: 400 });
    }
    if (BLOCKED_EXT.test(file.name)) {
      return NextResponse.json({ error: 'That file type is not allowed' }, { status: 400 });
    }

    // Resolve the uploader's most recent project (RLS scopes this to the
    // caller's own rows).
    const { data: project } = await supabase
      .from('projects')
      .select('id, google_drive_folder_id')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!project) {
      return NextResponse.json(
        { error: 'No active project found for your account yet.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadToDrive(
      buffer,
      file.name,
      file.type || 'application/octet-stream',
      project.google_drive_folder_id
    );

    const { error: dbError } = await supabase.from('client_files').insert({
      client_id: user.id,
      project_id: project.id,
      file_name: uploaded.name,
      mime_type: uploaded.mimeType,
      drive_file_id: uploaded.id,
      file_size_bytes: uploaded.sizeBytes,
      view_link: uploaded.viewLink,
      download_link: uploaded.downloadLink,
    });

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, file: uploaded });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Upload Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
