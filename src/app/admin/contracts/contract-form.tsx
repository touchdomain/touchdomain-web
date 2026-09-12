'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FileDown, Loader2, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  generateContractDoc,
  generateContractBlob,
  generateInvoiceDoc,
  generateInvoiceBlob,
  downloadDoc,
  TD_BANKING,
  type ContractData,
  type ContractDocType,
  type InvoiceData,
  type InvoiceLineItem,
} from '@/lib/pdf/generate';
import { createInvoice } from '@/lib/actions/invoices';
import { fileDocumentToClient } from '@/lib/actions/files';
import { sendContractForSignature, lookupSowReference } from '@/lib/actions/contracts';
import {
  PACKAGES,
  HOSTING_PLANS,
  EMAIL_PLANS,
  CAREPLAN_PLANS,
  RETAINER_PLANS,
} from '@/lib/pricing-data';
import {
  suggestTier,
  tierLabel,
  scheduleTemplate,
  buildSchedule,
  addDays,
  TIER_BANDS,
  type PaymentTier,
  type SmallStructure,
} from '@/lib/payment-schedule';
import { Card, SectionTitle, inputClass, btnPrimary, btnSecondary } from '@/components/portal/ui';

interface ClientOption {
  id: string;
  full_name: string;
  company_name: string | null;
  email: string;
}

interface ProjectOption {
  id: string;
  client_id: string;
  title: string;
}

type DocType = ContractDocType | 'invoice';

const DOC_TYPES: { id: DocType; label: string }[] = [
  { id: 'sa', label: 'Service Agreement + SOW' },
  { id: 'hosting', label: 'Hosting & Email Addendum' },
  { id: 'careplan', label: 'Care Plan / Retainer' },
  { id: 'invoice', label: 'Invoice (standalone)' },
];

const RECURRING = { ...HOSTING_PLANS, ...EMAIL_PLANS, ...CAREPLAN_PLANS, ...RETAINER_PLANS };
const money = (n: number) => 'R ' + n.toLocaleString('en-ZA', { minimumFractionDigits: 0 });
const toLines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);

// "2026-03" -> { period: "1–31 March 2026", monthYear: "March 2026", next: "1 April 2026" }
function periodParts(yyyymm: string) {
  const [y, m] = yyyymm.split('-').map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0);
  const next = new Date(y, m, 1);
  const my = start.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
  return {
    period: `1–${end.getDate()} ${my}`,
    monthYear: my,
    next: next.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

export default function ContractForm({
  clients,
  projects,
  nextInvoiceNumber,
  nextSowReference,
}: {
  clients: ClientOption[];
  projects: ProjectOption[];
  nextInvoiceNumber: string;
  nextSowReference: string;
}) {
  const router = useRouter();
  const [docType, setDocType] = useState<DocType>('sa');
  const [busy, setBusy] = useState(false);
  const [invoiceClientId, setInvoiceClientId] = useState('');
  const [contractClientId, setContractClientId] = useState('');
  const [contractProjectId, setContractProjectId] = useState('');
  const [invoiceProjectId, setInvoiceProjectId] = useState('');

  const [f, setF] = useState({
    agreementDate: new Date().toISOString().split('T')[0],
    clientContact: '', clientCompany: '', clientReg: '', clientAddress: '',
    projectName: '', sowRef: nextSowReference,
    deliverables: '', outOfScope: '', clientMaterials: '',
    totalFee: 0, revisions: 2, warrantyDays: 30,
    startDays: 3, draftDays: 14, feedbackDays: 21, finalDays: 35,
    planKey: '', planLabel: '', monthlyFee: 0, planIncludes: '', termMonths: 0,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  // Payment schedule (SA)
  const [tier, setTier] = useState<PaymentTier>('standard');
  const [small, setSmall] = useState<SmallStructure>('upfront');
  const [scheduleRows, setScheduleRows] = useState(() =>
    buildSchedule(scheduleTemplate('standard'), 0, f.agreementDate)
  );
  const regenSchedule = (t = tier, s = small, fee = f.totalFee, date = f.agreementDate) =>
    setScheduleRows(buildSchedule(scheduleTemplate(t, s), Number(fee) || 0, date));

  // Invoice
  const thisMonth = new Date().toISOString().slice(0, 7);
  const [inv, setInv] = useState({
    kind: 'once' as 'once' | 'recurring',
    invoiceNumber: nextInvoiceNumber,
    issueDate: new Date().toISOString().split('T')[0],
    termsDays: 7,
    reference: '',
    terms: '',
    notes: '',
    isTaxInvoice: false,
    vatNumber: '',
    periodMonth: thisMonth, // yyyy-mm, recurring only
  });
  const setI = <K extends keyof typeof inv>(k: K, v: (typeof inv)[K]) => setInv((p) => ({ ...p, [k]: v }));
  const [bank, setBank] = useState({ ...TD_BANKING });
  const [items, setItems] = useState<InvoiceLineItem[]>([{ description: '', quantity: 1, unitPrice: 0 }]);
  const setItem = (i: number, patch: Partial<InvoiceLineItem>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const invSubtotal = useMemo(
    () => items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0),
    [items]
  );
  const invTotal = inv.isTaxInvoice ? Math.round(invSubtotal * 1.15 * 100) / 100 : invSubtotal;

  const pickClient = (id: string) => {
    const c = clients.find((x) => x.id === id);
    if (c) setF((p) => ({ ...p, clientContact: c.full_name, clientCompany: c.company_name ?? '' }));
  };
  const pickPackage = (key: string) => {
    const pkg = PACKAGES[key];
    if (!pkg) return;
    if (docType === 'invoice') {
      setItems((p) => [...p.filter((it) => it.description.trim()), { description: pkg.label, quantity: 1, unitPrice: pkg.fee }]);
    } else {
      setF((p) => ({ ...p, deliverables: pkg.deliverables.join('\n'), totalFee: pkg.fee }));
      regenSchedule(tier, small, pkg.fee);
    }
  };
  const pickPlan = (key: string) => {
    const plan = RECURRING[key];
    if (plan) setF((p) => ({ ...p, planKey: key, planLabel: plan.label, monthlyFee: plan.fee, planIncludes: plan.includes.join('\n') }));
  };
  const addPlanLine = (key: string) => {
    const plan = RECURRING[key];
    if (!plan) return;
    const rec = periodParts(inv.periodMonth);
    setItems((p) => [
      ...p.filter((it) => it.description.trim()),
      { description: `${plan.label} — ${rec.monthYear}`, quantity: 1, unitPrice: plan.fee },
    ]);
  };

  const invoiceValid = () =>
    inv.invoiceNumber.trim().length > 3 && items.some((it) => it.description.trim() && it.unitPrice > 0);
  const invoiceDueDate = () => addDays(inv.issueDate, Number(inv.termsDays) || 0);

  const buildInvoice = (): InvoiceData => {
    const rec = inv.kind === 'recurring' ? periodParts(inv.periodMonth) : null;
    const defaultTerms =
      inv.kind === 'recurring'
        ? 'Payable monthly in advance. This service continues month to month; either party may cancel on 30 days’ written notice.'
        : 'Payable on the due date shown. Work on the related project proceeds once payment reflects; accounts more than 14 calendar days past due may pause work.';
    return {
      invoiceNumber: inv.invoiceNumber.trim(),
      issueDate: inv.issueDate,
      dueDate: invoiceDueDate(),
      clientName: f.clientContact || f.clientCompany,
      clientCompany: f.clientCompany || undefined,
      clientAddress: f.clientAddress || undefined,
      lineItems: items.filter((it) => it.description.trim()),
      reference: inv.reference.trim() || undefined,
      paymentTerms: inv.terms.trim() || defaultTerms,
      notes: inv.notes.trim() || undefined,
      isTaxInvoice: inv.isTaxInvoice,
      vatNumber: inv.isTaxInvoice ? inv.vatNumber.trim() || undefined : undefined,
      banking: bank,
      billingPeriod: rec?.period,
      recurringNote: rec
        ? `This is a recurring monthly charge for ongoing services. Next invoice: ${rec.next}. To pause or cancel, give 30 days' written notice.`
        : undefined,
    };
  };

  const fileInvoiceToPortal = async () => {
    if (!invoiceValid()) return toast.error('Add an invoice number and at least one line item.');
    if (!invoiceClientId) return toast.error('Pick which portal client this invoice is for.');
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', generateInvoiceBlob(buildInvoice()), `${inv.invoiceNumber.trim()}.pdf`);
      fd.append('clientId', invoiceClientId);
      if (invoiceProjectId) fd.append('projectId', invoiceProjectId);
      fd.append('invoiceNumber', inv.invoiceNumber.trim());
      fd.append('amountZar', String(invTotal));
      fd.append('dueDate', invoiceDueDate());
      if (inv.reference.trim()) fd.append('reference', inv.reference.trim());
      fd.append('isTaxInvoice', String(inv.isTaxInvoice));
      const desc =
        inv.kind === 'recurring' ? `Recurring — ${periodParts(inv.periodMonth).monthYear}` : 'Ad-hoc invoice';
      fd.append('description', desc);
      const res = await createInvoice(fd);
      if (res.success) {
        if (res.data?.filed) toast.success('Invoice filed to the client’s portal.');
        else toast.warning(res.error || 'Invoice recorded, but the PDF was not filed to Drive.');
        router.push('/admin/invoices');
      } else {
        toast.error(res.error);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to file invoice');
    } finally {
      setBusy(false);
    }
  };

  const buildContract = (): ContractData | null => {
    if (docType === 'invoice') return null;
    if (!f.clientCompany.trim() || !f.clientAddress.trim()) {
      toast.error('Client company and address are required.');
      return null;
    }
    return {
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
            warrantyDays: Number(f.warrantyDays),
            paymentTierLabel: tierLabel(tier),
            paymentSchedule: scheduleRows.map((r) => ({
              label: r.label,
              percentage: r.percentage,
              amountZar: Number(r.amount_zar),
              dueDate: r.due_date,
            })),
            timeline: [
              { label: 'Project start', date: addDays(f.agreementDate, Number(f.startDays)) },
              { label: 'Draft / first review', date: addDays(f.agreementDate, Number(f.draftDays)) },
              { label: 'Client feedback due', date: addDays(f.agreementDate, Number(f.feedbackDays)) },
              { label: 'Final delivery', date: addDays(f.agreementDate, Number(f.finalDays)) },
            ],
          }
        : {
            planLabel: f.planLabel,
            monthlyFee: Number(f.monthlyFee),
            planIncludes: toLines(f.planIncludes),
            termMonths: Number(f.termMonths) || undefined,
          }),
    };
  };

  const contractFileName = () => {
    const slug = (f.clientCompany || 'client').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const kind = docType === 'sa' ? 'Service-Agreement' : docType === 'hosting' ? 'Hosting-Addendum' : 'Care-Plan';
    return `TouchDomain-${kind}-${slug}.pdf`;
  };

  const contractTitle = () =>
    docType === 'sa'
      ? `Service Agreement - ${f.projectName || f.clientCompany}`
      : docType === 'hosting'
        ? `Hosting & Email Addendum - ${f.clientCompany}`
        : `Care Plan Agreement - ${f.clientCompany}`;

  const doContractPortal = async (mode: 'sign' | 'file') => {
    const data = buildContract();
    if (!data) return;
    if (!contractClientId) return toast.error('Pick which portal client this is for.');
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', generateContractBlob(data), contractFileName());
      fd.append('clientId', contractClientId);
      if (mode === 'sign') {
        fd.append('docType', docType);
        fd.append('title', contractTitle());
        if (f.sowRef.trim()) fd.append('sowRef', f.sowRef.trim());
        if (contractProjectId) fd.append('projectId', contractProjectId);
        const res = await sendContractForSignature(fd);
        if (res.success) {
          toast.success('Sent to the client’s portal for signature.');
          router.push('/admin/contracts');
        } else toast.error(res.error);
      } else {
        fd.append('label', contractTitle());
        const res = await fileDocumentToClient(fd);
        if (res.success) toast.success('Filed to the client’s Files tab.');
        else toast.error(res.error);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send contract');
    } finally {
      setBusy(false);
    }
  };

  const generate = () => {
    if (docType === 'invoice') {
      if (!invoiceValid()) return toast.error('Add an invoice number and at least one line item.');
      setBusy(true);
      try {
        downloadDoc(generateInvoiceDoc(buildInvoice()), `${inv.invoiceNumber.trim()}.pdf`);
        toast.success('Invoice PDF generated.');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to generate invoice');
      } finally {
        setBusy(false);
      }
      return;
    }

    const data = buildContract();
    if (!data) return;
    setBusy(true);
    try {
      downloadDoc(generateContractDoc(data), contractFileName());
      toast.success('Contract PDF generated.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to generate document');
    } finally {
      setBusy(false);
    }
  };

  const scheduleTotal = scheduleRows.reduce((s, r) => s + (Number(r.amount_zar) || 0), 0);

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
        <label className="mt-4 block max-w-xs">
          <span className="mb-1 block text-xs font-semibold text-gray-400">
            {docType === 'invoice' ? 'Issue date' : 'Agreement date'}
          </span>
          <input
            type="date"
            value={docType === 'invoice' ? inv.issueDate : f.agreementDate}
            onChange={(e) => {
              if (docType === 'invoice') setI('issueDate', e.target.value);
              else { set('agreementDate', e.target.value); regenSchedule(tier, small, f.totalFee, e.target.value); }
            }}
            className={inputClass}
          />
        </label>
      </Card>

      <Card>
        <SectionTitle>Client &amp; project</SectionTitle>
        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-semibold text-gray-400">Autofill from a client (optional)</span>
          <select onChange={(e) => pickClient(e.target.value)} className={inputClass}>
            <option value="">— select —</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name || c.full_name}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={docType === 'invoice' ? 'Contact / attention' : 'Contact name'} value={f.clientContact} onChange={(v) => set('clientContact', v)} />
          <Field label="Company / legal name *" value={f.clientCompany} onChange={(v) => set('clientCompany', v)} />
          {docType !== 'invoice' && <Field label="Client registration no." value={f.clientReg} onChange={(v) => set('clientReg', v)} />}
          <div className="sm:col-span-2">
            <Field label="Client address *" value={f.clientAddress} onChange={(v) => set('clientAddress', v)} />
          </div>
          {docType !== 'invoice' && <Field label="Project name" value={f.projectName} onChange={(v) => set('projectName', v)} />}
          {docType !== 'invoice' && (
            <Field label="SOW reference" value={f.sowRef} onChange={(v) => set('sowRef', v)} help="Auto-generated — edit if you want to reuse an existing reference." />
          )}
          {docType !== 'invoice' && (
            <div className="sm:col-span-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-td-dark">Related project (optional)</span>
                <select
                  value={contractProjectId}
                  onChange={async (e) => {
                    const id = e.target.value;
                    setContractProjectId(id);
                    const proj = projects.find((p) => p.id === id);
                    if (proj) {
                      set('projectName', proj.title);
                      const res = await lookupSowReference(proj.client_id, id);
                      if (res.success && res.data?.sowReference) set('sowRef', res.data.sowReference);
                    }
                  }}
                  className={inputClass}
                >
                  <option value="">— none —</option>
                  {projects.map((p) => {
                    const c = clients.find((cl) => cl.id === p.client_id);
                    return <option key={p.id} value={p.id}>{p.title} — {c?.company_name || c?.full_name || 'client'}</option>;
                  })}
                </select>
              </label>
              <p className="mt-1 text-xs text-gray-400">Links this document to a project so invoices raised against it can auto-fill the SOW reference.</p>
            </div>
          )}
        </div>
      </Card>

      {docType === 'sa' && (
        <>
          <Card>
            <SectionTitle>Scope &amp; fees</SectionTitle>
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
                <NumField label="Total fee (ZAR)" value={f.totalFee} onChange={(v) => { set('totalFee', v); const t = suggestTier(v); setTier(t); regenSchedule(t, small, v); }} />
                <NumField label="Included revision rounds" value={f.revisions} onChange={(v) => set('revisions', v)} />
                <NumField label="Warranty period (days)" value={f.warrantyDays} onChange={(v) => set('warrantyDays', v)} />
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle>Timeline (days after signing)</SectionTitle>
            <p className="mb-3 text-xs text-gray-400">Resolved to calendar dates from the agreement date when the PDF is generated.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <NumField label="Start" value={f.startDays} onChange={(v) => set('startDays', v)} />
              <NumField label="Draft" value={f.draftDays} onChange={(v) => set('draftDays', v)} />
              <NumField label="Feedback due" value={f.feedbackDays} onChange={(v) => set('feedbackDays', v)} />
              <NumField label="Final delivery" value={f.finalDays} onChange={(v) => set('finalDays', v)} />
            </div>
          </Card>

          <Card>
            <SectionTitle>Payment schedule</SectionTitle>
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-gray-400">Structure</span>
                <select value={tier} onChange={(e) => { const t = e.target.value as PaymentTier; setTier(t); regenSchedule(t); }} className={inputClass}>
                  {TIER_BANDS.map((b) => <option key={b.tier} value={b.tier}>{b.label} — {b.hint}</option>)}
                </select>
              </label>
              {tier === 'small' && (
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-400">Small-project split</span>
                  <select value={small} onChange={(e) => { const s = e.target.value as SmallStructure; setSmall(s); regenSchedule(tier, s); }} className={inputClass}>
                    <option value="upfront">100% on signature</option>
                    <option value="sixty_forty">60% / 40%</option>
                  </select>
                </label>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-gray-400"><th className="pb-2 pr-2">Milestone</th><th className="pb-2 px-2">Amount</th><th className="pb-2 pl-2">Due</th><th /></tr></thead>
                <tbody>
                  {scheduleRows.map((r, i) => (
                    <tr key={i} className="border-t border-td-purple/5">
                      <td className="py-1.5 pr-2"><input value={r.label} onChange={(e) => setScheduleRows((p) => p.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} className={`${inputClass} h-8 py-1`} /></td>
                      <td className="py-1.5 px-2"><input type="number" min={0} value={r.amount_zar} onChange={(e) => setScheduleRows((p) => p.map((x, idx) => idx === i ? { ...x, amount_zar: Number(e.target.value) } : x))} className={`${inputClass} h-8 w-28 py-1 text-right`} /></td>
                      <td className="py-1.5 pl-2"><input type="date" value={r.due_date ?? ''} onChange={(e) => setScheduleRows((p) => p.map((x, idx) => idx === i ? { ...x, due_date: e.target.value } : x))} className={`${inputClass} h-8 py-1`} /></td>
                      <td className="pl-2"><button onClick={() => setScheduleRows((p) => p.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <button onClick={() => setScheduleRows((p) => [...p, { label: '', percentage: null, amount_zar: 0, due_date: f.agreementDate }])} className="inline-flex items-center gap-1.5 text-sm font-semibold text-td-purple hover:text-td-accent">
                <Plus className="h-4 w-4" /> Add row
              </button>
              <span className={`text-xs ${Math.abs(scheduleTotal - Number(f.totalFee)) > 1 ? 'text-red-500' : 'text-gray-400'}`}>
                Rows {money(scheduleTotal)} vs fee {money(Number(f.totalFee))}
              </span>
            </div>
          </Card>
        </>
      )}

      {(docType === 'hosting' || docType === 'careplan') && (
        <Card>
          <SectionTitle>Plan &amp; billing</SectionTitle>
          <label className="mb-3 block">
            <span className="mb-1 block text-xs font-semibold text-gray-400">Quick-fill from a plan</span>
            <select value={f.planKey} onChange={(e) => pickPlan(e.target.value)} className={inputClass}>
              <option value="">— select —</option>
              {Object.values(RECURRING).map((p) => <option key={p.key} value={p.key}>{p.label} (R{p.fee}/mo)</option>)}
            </select>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Plan label" value={f.planLabel} onChange={(v) => set('planLabel', v)} />
            <NumField label="Monthly fee (ZAR)" value={f.monthlyFee} onChange={(v) => set('monthlyFee', v)} />
            <NumField label="Minimum term (months, 0 = month-to-month)" value={f.termMonths} onChange={(v) => set('termMonths', v)} />
            <div className="sm:col-span-2">
              <TextArea label="Plan includes (one per line)" value={f.planIncludes} onChange={(v) => set('planIncludes', v)} />
            </div>
          </div>
        </Card>
      )}

      {docType === 'invoice' && (
        <>
          <Card>
            <SectionTitle>Invoice details</SectionTitle>
            <div className="mb-3 flex gap-2">
              {(['once', 'recurring'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setI('kind', k)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                    inv.kind === k ? 'border-td-purple bg-td-purple text-white' : 'border-td-purple/20 text-td-dark hover:border-td-accent'
                  }`}
                >
                  {k === 'once' ? 'Once-off / project' : 'Recurring (monthly)'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Invoice number *" value={inv.invoiceNumber} onChange={(v) => setI('invoiceNumber', v)} />
              <NumField label="Payment terms (days)" value={inv.termsDays} onChange={(v) => setI('termsDays', v)} />
              <Field label={inv.kind === 'recurring' ? 'Relates to (plan)' : 'Reference (SOW / plan)'} value={inv.reference} onChange={(v) => setI('reference', v)} />
              {inv.kind === 'recurring' && (
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-td-dark">Billing month</span>
                  <input type="month" value={inv.periodMonth} onChange={(e) => setI('periodMonth', e.target.value)} className={inputClass} />
                </label>
              )}
            </div>
            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-semibold text-gray-400">Charge against a project (optional — auto-fills the reference from its SOW)</span>
              <select
                value={invoiceProjectId}
                onChange={async (e) => {
                  const id = e.target.value;
                  setInvoiceProjectId(id);
                  const proj = projects.find((p) => p.id === id);
                  if (proj) {
                    if (!invoiceClientId) setInvoiceClientId(proj.client_id);
                    const res = await lookupSowReference(proj.client_id, id);
                    if (res.success && res.data?.sowReference) setI('reference', res.data.sowReference);
                  }
                }}
                className={inputClass}
              >
                <option value="">— none —</option>
                {projects.map((p) => {
                  const c = clients.find((cl) => cl.id === p.client_id);
                  return <option key={p.id} value={p.id}>{p.title} — {c?.company_name || c?.full_name || 'client'}</option>;
                })}
              </select>
            </label>
            {inv.kind === 'recurring' ? (
              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-semibold text-gray-400">Quick-add a recurring plan as a line item</span>
                <select value="" onChange={(e) => addPlanLine(e.target.value)} className={inputClass}>
                  <option value="">— select —</option>
                  {Object.values(RECURRING).map((p) => <option key={p.key} value={p.key}>{p.label} (R{p.fee}/mo)</option>)}
                </select>
              </label>
            ) : (
              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-semibold text-gray-400">Quick-add a package as a line item</span>
                <select value="" onChange={(e) => pickPackage(e.target.value)} className={inputClass}>
                  <option value="">— select —</option>
                  {Object.values(PACKAGES).map((p) => <option key={p.key} value={p.key}>{p.label} (R{p.fee.toLocaleString('en-ZA')})</option>)}
                </select>
              </label>
            )}
            <TextArea label="Payment terms (shown on the PDF — leave blank for the default)" value={inv.terms} onChange={(v) => setI('terms', v)} />
          </Card>

          <Card>
            <SectionTitle>Line items</SectionTitle>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-[1fr_56px_96px_28px] items-center gap-2">
                  <input placeholder="Description" value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} className={inputClass} />
                  <input type="number" min={1} value={it.quantity} onChange={(e) => setItem(i, { quantity: Number(e.target.value) })} className={`${inputClass} text-center`} />
                  <input type="number" min={0} placeholder="0" value={it.unitPrice || ''} onChange={(e) => setItem(i, { unitPrice: Number(e.target.value) })} className={`${inputClass} text-right`} />
                  <button onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))} disabled={items.length === 1} className="text-gray-300 hover:text-red-500 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <button onClick={() => setItems((p) => [...p, { description: '', quantity: 1, unitPrice: 0 }])} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-td-purple hover:text-td-accent">
              <Plus className="h-4 w-4" /> Add line
            </button>
            <div className="mt-3 border-t border-td-purple/10 pt-2 text-right text-sm">
              {inv.isTaxInvoice && (
                <>
                  <div className="text-gray-500">Subtotal <b className="ml-3 text-td-dark">{money(invSubtotal)}</b></div>
                  <div className="text-gray-500">VAT 15% <b className="ml-3 text-td-dark">{money(invTotal - invSubtotal)}</b></div>
                </>
              )}
              <div className="text-gray-500">Total <b className="ml-3 text-lg text-td-purple">{money(invTotal)}</b></div>
            </div>
            <TextArea label="Notes (optional)" value={inv.notes} onChange={(v) => setI('notes', v)} />
          </Card>

          <Card>
            <SectionTitle>VAT &amp; banking</SectionTitle>
            <label className="flex items-start gap-2.5">
              <input type="checkbox" checked={inv.isTaxInvoice} onChange={(e) => setI('isTaxInvoice', e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-td-purple/30 text-td-purple focus:ring-td-accent" />
              <span className="text-sm text-td-dark">
                This is a <b>Tax Invoice</b> (Touch Domain is VAT-registered)
                <span className="mt-0.5 block text-xs text-gray-400">Leave off until registered — the PDF then reads &quot;INVOICE&quot; and states Touch Domain is not a registered VAT vendor.</span>
              </span>
            </label>
            {inv.isTaxInvoice && (
              <Field label="VAT registration number" value={inv.vatNumber} onChange={(v) => setI('vatNumber', v)} />
            )}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Bank" value={bank.bank} onChange={(v) => setBank((b) => ({ ...b, bank: v }))} />
              <Field label="Account holder" value={bank.holder} onChange={(v) => setBank((b) => ({ ...b, holder: v }))} />
              <Field label="Account number" value={bank.account} onChange={(v) => setBank((b) => ({ ...b, account: v }))} />
              <Field label="Branch code" value={bank.branch} onChange={(v) => setBank((b) => ({ ...b, branch: v }))} />
            </div>
          </Card>
        </>
      )}

      <Card>
        <SectionTitle>Send to a client&apos;s portal</SectionTitle>
        <p className="mb-3 text-xs text-gray-400">
          {docType === 'invoice'
            ? 'Records the invoice against the client and files the PDF to their Drive folder — it appears under their Invoices.'
            : 'The client signs it in their portal; once you countersign, the executed PDF is filed to their Drive folder and Files tab.'}
        </p>
        <select
          value={docType === 'invoice' ? invoiceClientId : contractClientId}
          onChange={(e) => (docType === 'invoice' ? setInvoiceClientId(e.target.value) : setContractClientId(e.target.value))}
          className={inputClass}
        >
          <option value="">— download only, not sent —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.company_name || c.full_name} · {c.email}</option>
          ))}
        </select>
      </Card>

      <div className="flex flex-wrap justify-end gap-3">
        {docType === 'invoice' && invoiceClientId && (
          <button onClick={fileInvoiceToPortal} disabled={busy} className={btnSecondary}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} File to client&apos;s portal
          </button>
        )}
        {docType !== 'invoice' && contractClientId && (
          <>
            <button onClick={() => doContractPortal('file')} disabled={busy} className={btnSecondary}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} File without signing
            </button>
            <button onClick={() => doContractPortal('sign')} disabled={busy} className={btnPrimary}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send for signature
            </button>
          </>
        )}
        <button onClick={generate} disabled={busy} className={btnSecondary}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          {docType === 'invoice' ? 'Download invoice PDF' : 'Download PDF'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, help }: { label: string; value: string; onChange: (v: string) => void; help?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-td-dark">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      {help && <span className="mt-1 block text-xs text-gray-400">{help}</span>}
    </label>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-td-dark">{label}</span>
      <input type="number" min={0} value={value} onChange={(e) => onChange(Number(e.target.value))} className={inputClass} />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="mt-3 block">
      <span className="mb-1 block text-sm font-medium text-td-dark">{label}</span>
      <textarea rows={5} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} resize-y`} />
    </label>
  );
}
