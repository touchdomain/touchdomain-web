'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FileDown, Loader2 } from 'lucide-react';
import {
  generateContractDoc,
  downloadDoc,
  type ContractData,
  type ContractDocType,
} from '@/lib/pdf/generate';
import { PACKAGES, HOSTING_PLANS, EMAIL_PLANS, CAREPLAN_PLANS, RETAINER_PLANS } from '@/lib/pricing-data';
import { Card, SectionTitle, inputClass, btnPrimary } from '@/components/portal/ui';

interface ClientOption {
  id: string;
  full_name: string;
  company_name: string | null;
  email: string;
}

const DOC_TYPES: { id: ContractDocType; label: string }[] = [
  { id: 'sa', label: 'Service Agreement + SOW' },
  { id: 'hosting', label: 'Hosting & Email Addendum' },
  { id: 'careplan', label: 'Care Plan / Retainer' },
];

const RECURRING = { ...HOSTING_PLANS, ...EMAIL_PLANS, ...CAREPLAN_PLANS, ...RETAINER_PLANS };

export default function ContractForm({ clients }: { clients: ClientOption[] }) {
  const [docType, setDocType] = useState<ContractDocType>('sa');
  const [busy, setBusy] = useState(false);

  const [f, setF] = useState({
    agreementDate: new Date().toISOString().split('T')[0],
    clientContact: '', clientCompany: '', clientReg: '', clientAddress: '',
    projectName: '', sowRef: '',
    deliverables: '', outOfScope: '', clientMaterials: '',
    totalFee: 0, revisions: 2,
    planKey: '', planLabel: '', monthlyFee: 0, planIncludes: '', termMonths: 0,
  });
  const set = (k: keyof typeof f, v: string | number) => setF((p) => ({ ...p, [k]: v }));

  const pickClient = (id: string) => {
    const c = clients.find((x) => x.id === id);
    if (c) setF((p) => ({ ...p, clientContact: c.full_name, clientCompany: c.company_name ?? '' }));
  };

  const pickPackage = (key: string) => {
    const pkg = PACKAGES[key];
    if (pkg) setF((p) => ({ ...p, deliverables: pkg.deliverables.join('\n'), totalFee: pkg.fee }));
  };

  const pickPlan = (key: string) => {
    const plan = RECURRING[key];
    if (plan) setF((p) => ({ ...p, planKey: key, planLabel: plan.label, monthlyFee: plan.fee, planIncludes: plan.includes.join('\n') }));
  };

  const toLines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);

  const generate = () => {
    if (!f.clientCompany.trim() || !f.clientAddress.trim()) {
      return toast.error('Client company and address are required.');
    }
    setBusy(true);
    try {
      const data: ContractData = {
        docType,
        agreementDate: f.agreementDate,
        clientContact: f.clientContact,
        clientCompany: f.clientCompany,
        clientReg: f.clientReg || undefined,
        clientAddress: f.clientAddress,
        projectName: f.projectName || undefined,
        sowRef: f.sowRef || undefined,
        ...(docType === 'sa'
          ? {
              deliverables: toLines(f.deliverables),
              outOfScope: toLines(f.outOfScope),
              clientMaterials: toLines(f.clientMaterials),
              totalFee: Number(f.totalFee),
              revisions: Number(f.revisions),
            }
          : {
              planLabel: f.planLabel,
              monthlyFee: Number(f.monthlyFee),
              planIncludes: toLines(f.planIncludes),
              termMonths: Number(f.termMonths) || undefined,
            }),
      };
      const slug = (f.clientCompany || 'client').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      downloadDoc(generateContractDoc(data), `TouchDomain-${docType}-${slug}.pdf`);
      toast.success('Contract PDF generated.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to generate contract');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <SectionTitle>Document type</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {DOC_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setDocType(t.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                docType === t.id ? 'border-td-purple bg-td-purple text-white' : 'border-td-purple/20 text-td-dark hover:border-td-accent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>Client & project</SectionTitle>
        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-semibold text-gray-400">Autofill from a client (optional)</span>
          <select onChange={(e) => pickClient(e.target.value)} className={inputClass}>
            <option value="">— select —</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name || c.full_name}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Contact name" value={f.clientContact} onChange={(v) => set('clientContact', v)} />
          <Field label="Company / legal name *" value={f.clientCompany} onChange={(v) => set('clientCompany', v)} />
          <Field label="Client registration no." value={f.clientReg} onChange={(v) => set('clientReg', v)} />
          <Field label="Agreement date" type="date" value={f.agreementDate} onChange={(v) => set('agreementDate', v)} />
          <div className="sm:col-span-2">
            <Field label="Client address *" value={f.clientAddress} onChange={(v) => set('clientAddress', v)} />
          </div>
          <Field label="Project name" value={f.projectName} onChange={(v) => set('projectName', v)} />
          <Field label="SOW reference" value={f.sowRef} onChange={(v) => set('sowRef', v)} />
        </div>
      </Card>

      {docType === 'sa' ? (
        <Card>
          <SectionTitle>Scope & fees</SectionTitle>
          <label className="mb-3 block">
            <span className="mb-1 block text-xs font-semibold text-gray-400">Quick-fill from a package</span>
            <select onChange={(e) => pickPackage(e.target.value)} className={inputClass}>
              <option value="">— select —</option>
              {Object.values(PACKAGES).map((p) => <option key={p.key} value={p.key}>{p.label} (R{p.fee.toLocaleString('en-ZA')})</option>)}
            </select>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextArea label="Deliverables (one per line)" value={f.deliverables} onChange={(v) => set('deliverables', v)} />
            <TextArea label="Out of scope (one per line)" value={f.outOfScope} onChange={(v) => set('outOfScope', v)} />
            <TextArea label="Client to supply (one per line)" value={f.clientMaterials} onChange={(v) => set('clientMaterials', v)} />
            <div className="space-y-3">
              <Field label="Total fee (ZAR)" type="number" value={String(f.totalFee)} onChange={(v) => set('totalFee', Number(v))} />
              <Field label="Included revision rounds" type="number" value={String(f.revisions)} onChange={(v) => set('revisions', Number(v))} />
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <SectionTitle>Plan & billing</SectionTitle>
          <label className="mb-3 block">
            <span className="mb-1 block text-xs font-semibold text-gray-400">Quick-fill from a plan</span>
            <select value={f.planKey} onChange={(e) => pickPlan(e.target.value)} className={inputClass}>
              <option value="">— select —</option>
              {Object.values(RECURRING).map((p) => <option key={p.key} value={p.key}>{p.label} (R{p.fee}/mo)</option>)}
            </select>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Plan label" value={f.planLabel} onChange={(v) => set('planLabel', v)} />
            <Field label="Monthly fee (ZAR)" type="number" value={String(f.monthlyFee)} onChange={(v) => set('monthlyFee', Number(v))} />
            <Field label="Minimum term (months, 0 = month-to-month)" type="number" value={String(f.termMonths)} onChange={(v) => set('termMonths', Number(v))} />
            <div className="sm:col-span-2">
              <TextArea label="Plan includes (one per line)" value={f.planIncludes} onChange={(v) => set('planIncludes', v)} />
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-end">
        <button onClick={generate} disabled={busy} className={btnPrimary}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />} Generate PDF
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-td-dark">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-td-dark">{label}</span>
      <textarea rows={5} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} resize-y`} />
    </label>
  );
}
