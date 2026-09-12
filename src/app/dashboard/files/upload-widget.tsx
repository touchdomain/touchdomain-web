'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UploadCloud, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UploadWidget() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const upload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Uploaded ${data.file.name}`);
        router.refresh();
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch {
      toast.error('Upload failed — check your connection');
    } finally {
      setUploading(false);
      setDragging(false);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) upload(f); }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors sm:p-10',
        dragging ? 'border-td-accent bg-td-purple/[0.04]' : 'border-td-purple/20 bg-white hover:border-td-accent/50'
      )}
    >
      <div className="mb-3 rounded-full bg-td-purple/10 p-3">
        {uploading ? <Loader2 className="h-6 w-6 animate-spin text-td-purple" /> : <UploadCloud className="h-6 w-6 text-td-purple" />}
      </div>
      <p className="text-sm font-semibold text-td-dark">
        {uploading ? 'Uploading…' : 'Drag a file here, or click to browse'}
      </p>
      <p className="mt-1 text-xs text-gray-400">Up to 25&nbsp;MB. Documents, images, archives.</p>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        disabled={uploading}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }}
      />
    </div>
  );
}
