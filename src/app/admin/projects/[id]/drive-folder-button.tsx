'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { FolderPlus, Loader2 } from 'lucide-react';
import { syncProjectDriveFolder } from '@/lib/actions/admin';

export default function DriveFolderButton({ projectId }: { projectId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() =>
        start(async () => {
          const res = await syncProjectDriveFolder(projectId);
          if (res.success) toast.success('Drive folder created.');
          else toast.error(res.error);
        })
      }
      disabled={pending}
      className="inline-flex items-center gap-1 text-td-purple hover:text-td-accent"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FolderPlus className="h-3.5 w-3.5" />}
      Create Drive folder
    </button>
  );
}
