'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Eraser } from 'lucide-react';
import { signContractAsClient } from '@/lib/actions/contracts';
import { inputClass } from '@/components/portal/ui';

export default function SignContract({
  contractId,
  suggestedName,
}: {
  contractId: string;
  suggestedName: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(suggestedName);
  const [consent, setConsent] = useState(false);
  const [pending, start] = useTransition();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    hasInk.current = true;
  };
  const up = () => { drawing.current = false; };
  const clear = () => {
    const c = canvasRef.current!;
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
    hasInk.current = false;
  };

  const sign = () => {
    if (name.trim().length < 3) return toast.error('Enter your full legal name.');
    if (!consent) return toast.error('Tick the box to confirm you intend to sign.');
    const png = hasInk.current ? canvasRef.current!.toDataURL('image/png') : null;
    start(async () => {
      const res = await signContractAsClient(contractId, { signerName: name.trim(), consent, signaturePng: png });
      if (res.success) {
        toast.success('Signed — thank you. We’ll countersign and send you the final copy.');
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="space-y-3 rounded-xl border border-td-purple/15 bg-td-purple/[0.02] p-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-td-dark">Full legal name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </label>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-td-dark">Signature <span className="font-normal text-gray-400">(optional)</span></span>
          <button onClick={clear} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-td-dark">
            <Eraser className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
        <canvas
          ref={canvasRef}
          width={480}
          height={140}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
          className="w-full touch-none rounded-lg border border-td-purple/20 bg-white"
        />
      </div>

      <label className="flex items-start gap-2.5 text-sm text-td-dark">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-td-purple/30 text-td-purple focus:ring-td-accent"
        />
        <span>
          I have read this agreement, I am authorised to sign it, and I intend my electronic signature to be
          legally binding under the Electronic Communications and Transactions Act 25 of 2002.
        </span>
      </label>

      <button
        onClick={sign}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-td-purple px-5 py-2.5 text-sm font-semibold text-white hover:bg-td-accent disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Sign agreement
      </button>
    </div>
  );
}
