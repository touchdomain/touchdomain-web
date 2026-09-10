import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Touch Domain brand ────────────────────────────────────────────────
const PURPLE: [number, number, number] = [69, 44, 99];   // #452C63
const ACCENT: [number, number, number] = [153, 114, 171]; // #9972AB
const INK: [number, number, number] = [26, 26, 26];
const MUTED: [number, number, number] = [110, 110, 110];

const TD = {
  legal: 'TOUCHDOMAIN (Pty) Ltd',
  trading: 'Touch Domain',
  reg: '2026/686289/07',
  address: '96 Makgathe Street, Ipelegeng, Schweizer-Reneke, 2780',
  phone: '+27 81 327 6153',
  email: 'helper@touchdomain.co.za',
  web: 'www.touchdomain.co.za',
  signatory: 'Thabo Mtsweni',
};

export interface BankingDetails {
  bank: string;
  holder: string;
  account: string;
  branch: string;
  accountType?: string;
  swift?: string;
}

/** Default banking block — override per-invoice via InvoiceData.banking. */
export const TD_BANKING: BankingDetails = {
  bank: 'Standard Bank',
  holder: 'Touch Domain',
  account: '10286525788',
  branch: '051001', // universal / electronic-payments branch code
  accountType: 'MyMoBiz Current Account',
  swift: 'SBZAZAJJ',
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;

const VAT_RATE = 0.15;

const money = (n: number) =>
  'R ' + n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const dateZA = (iso: string) => {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
};

function newDoc(): jsPDF {
  return new jsPDF({ unit: 'pt', format: 'a4' });
}

function drawLetterhead(doc: jsPDF) {
  doc.setFillColor(...PURPLE);
  doc.rect(0, 0, PAGE_W, 58, 'F');
  doc.setFillColor(...ACCENT);
  doc.rect(0, 58, PAGE_W, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text('TOUCH DOMAIN', MARGIN, 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(228, 217, 236);
  doc.text(`${TD.legal}  ·  Reg. ${TD.reg}`, PAGE_W - MARGIN, 20, { align: 'right' });
  doc.text(TD.address, PAGE_W - MARGIN, 30, { align: 'right' });
  doc.text(`${TD.phone}  ·  ${TD.email}`, PAGE_W - MARGIN, 40, { align: 'right' });

  doc.setTextColor(...INK);
}

function drawFooter(doc: jsPDF, label: string) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(224, 214, 232);
    doc.line(MARGIN, PAGE_H - 40, PAGE_W - MARGIN, PAGE_H - 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(`${label}  ·  ${TD.web}`, MARGIN, PAGE_H - 28);
    doc.text(`Page ${i} of ${pages}`, PAGE_W - MARGIN, PAGE_H - 28, { align: 'right' });
  }
}

// Flowing text writer with pagination.
class Cursor {
  y = 92;
  constructor(private doc: jsPDF) {}

  private ensure(space: number) {
    if (this.y + space > PAGE_H - 60) {
      this.doc.addPage();
      drawLetterhead(this.doc);
      this.y = 92;
    }
  }

  heading(text: string) {
    this.ensure(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(11.5);
    this.doc.setTextColor(...PURPLE);
    this.doc.text(text, MARGIN, this.y);
    this.y += 16;
  }

  title(text: string) {
    this.ensure(40);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(18);
    this.doc.setTextColor(...PURPLE);
    this.doc.text(text, PAGE_W / 2, this.y, { align: 'center' });
    this.y += 10;
    this.doc.setDrawColor(...ACCENT);
    this.doc.setLineWidth(1);
    this.doc.line(MARGIN, this.y, PAGE_W - MARGIN, this.y);
    this.y += 22;
  }

  paragraph(text: string, opts: { size?: number; gap?: number } = {}) {
    const size = opts.size ?? 9.5;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(size);
    this.doc.setTextColor(...INK);
    const lines = this.doc.splitTextToSize(text, CONTENT_W) as string[];
    for (const line of lines) {
      this.ensure(size + 4);
      this.doc.text(line, MARGIN, this.y);
      this.y += size + 3.5;
    }
    this.y += opts.gap ?? 8;
  }

  bullets(items: string[]) {
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(...INK);
    for (const item of items) {
      const lines = this.doc.splitTextToSize(item, CONTENT_W - 14) as string[];
      this.ensure(13 * lines.length);
      this.doc.setTextColor(...ACCENT);
      this.doc.text('•', MARGIN + 2, this.y);
      this.doc.setTextColor(...INK);
      lines.forEach((line, i) => {
        this.doc.text(line, MARGIN + 14, this.y);
        this.y += 13;
        if (i < lines.length - 1) this.ensure(13);
      });
      this.y += 2;
    }
    this.y += 6;
  }

  space(n: number) { this.y += n; }

  table(head: string[], body: (string | number)[][]) {
    autoTable(this.doc, {
      startY: this.y,
      head: [head],
      body: body.map((r) => r.map(String)),
      margin: { left: MARGIN, right: MARGIN },
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 6, textColor: INK },
      headStyles: { fillColor: PURPLE, textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [247, 244, 249] },
    });
    this.y = ((this.doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? this.y) + 18;
  }

  signatures() {
    this.ensure(90);
    this.y += 20;
    const colW = (CONTENT_W - 30) / 2;
    this.doc.setDrawColor(...MUTED);
    this.doc.line(MARGIN, this.y, MARGIN + colW, this.y);
    this.doc.line(MARGIN + colW + 30, this.y, PAGE_W - MARGIN, this.y);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8);
    this.doc.setTextColor(...MUTED);
    this.doc.text(`For and on behalf of ${TD.legal}`, MARGIN, this.y + 12);
    this.doc.text(`${TD.signatory}, Director  ·  Date:`, MARGIN, this.y + 24);
    this.doc.text('For and on behalf of the Client', MARGIN + colW + 30, this.y + 12);
    this.doc.text('Name, Title  ·  Date:', MARGIN + colW + 30, this.y + 24);
    this.y += 24;
  }
}

// ── Types ─────────────────────────────────────────────────────────────
export type ContractDocType = 'sa' | 'hosting' | 'careplan';

export interface ContractMilestone {
  label: string;
  percentage: number | null;
  amountZar: number;
  dueDate?: string | null;
}

export interface TimelineEntry {
  label: string;
  date: string; // yyyy-mm-dd, already resolved from days-after-signing
}

export interface ContractData {
  docType: ContractDocType;
  agreementDate: string;
  clientContact: string;
  clientCompany: string;
  clientReg?: string;
  clientAddress: string;
  projectName?: string;
  sowRef?: string;
  // Service Agreement
  deliverables?: string[];
  outOfScope?: string[];
  clientMaterials?: string[];
  totalFee?: number;
  revisions?: number;
  /** Milestone payment breakdown (from the payment-schedule engine). */
  paymentSchedule?: ContractMilestone[];
  paymentTierLabel?: string;
  /** Timeline entries as resolved calendar dates. */
  timeline?: TimelineEntry[];
  warrantyDays?: number;
  // Hosting / Care Plan
  planLabel?: string;
  monthlyFee?: number;
  planIncludes?: string[];
  termMonths?: number;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceScheduleRow {
  label: string;
  amountZar: number;
  dueDate?: string | null;
  paid?: boolean;
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  clientAddress?: string;
  lineItems: InvoiceLineItem[];
  notes?: string;
  reference?: string;
  /** What this invoice bills, e.g. "Deposit (50%) — to commence work". */
  covers?: string;
  /** Recurring services: the period this invoice covers, e.g. "1–31 March 2026". */
  billingPeriod?: string;
  /** Recurring services: e.g. "Recurring monthly. Next invoice: 1 April 2026." */
  recurringNote?: string;
  /** VAT handling. Off = "INVOICE" + non-vendor disclaimer, no VAT line. */
  isTaxInvoice?: boolean;
  vatNumber?: string;
  banking?: BankingDetails;
  /** The wider project payment schedule, shown for context. */
  schedule?: InvoiceScheduleRow[];
  projectTotal?: number;
  paidToDate?: number;
}

// ── Contracts ─────────────────────────────────────────────────────────
export function generateContractDoc(data: ContractData): jsPDF {
  const doc = newDoc();
  drawLetterhead(doc);
  const c = new Cursor(doc);

  const titles: Record<ContractDocType, string> = {
    sa: 'SERVICE AGREEMENT & STATEMENT OF WORK',
    hosting: 'HOSTING & EMAIL SERVICES ADDENDUM',
    careplan: 'CARE PLAN / RETAINER AGREEMENT',
  };
  c.title(titles[data.docType]);

  c.paragraph(
    `This Agreement is entered into on ${dateZA(data.agreementDate)} between ${TD.legal} (Registration No. ${TD.reg}), of ${TD.address} ("Touch Domain"), and ${data.clientCompany}${data.clientReg ? ` (Registration No. ${data.clientReg})` : ''}, of ${data.clientAddress}, represented by ${data.clientContact} ("the Client").`
  );
  if (data.projectName || data.sowRef) {
    c.paragraph(
      `Project: ${data.projectName || '—'}${data.sowRef ? `   ·   SOW Reference: ${data.sowRef}` : ''}`,
      { size: 9 }
    );
  }

  let n = 1;
  const heading = (t: string) => c.heading(`${n++}. ${t}`);

  if (data.docType === 'sa') {
    heading('Scope of Work & Deliverables');
    c.paragraph('Touch Domain will provide the following deliverables:');
    c.bullets(data.deliverables && data.deliverables.length ? data.deliverables : ['As set out in the accompanying proposal.']);
    if (data.outOfScope?.length) {
      c.paragraph('The following are expressly out of scope and will be quoted separately if required:');
      c.bullets(data.outOfScope);
    }
    if (data.clientMaterials?.length) {
      heading('Client Responsibilities');
      c.paragraph('The Client will supply, in a timely manner:');
      c.bullets(data.clientMaterials);
    }

    if (data.timeline?.length) {
      heading('Indicative Timeline');
      c.paragraph('Dates below are calculated from the agreement date and assume the Client meets feedback deadlines. Delays in Client feedback or materials shift subsequent dates by the same period.');
      c.table(['Stage', 'Target date'], data.timeline.map((t) => [t.label, dateZA(t.date)]));
    }

    heading('Fees & Payment Schedule');
    const fee = data.totalFee ?? 0;
    c.paragraph(
      `The total project fee is ${money(fee)} (Touch Domain is not a registered VAT vendor; no VAT is charged). Payment is due per the schedule below${data.paymentTierLabel ? ` (${data.paymentTierLabel} project structure)` : ''}:`
    );
    const schedule = data.paymentSchedule?.length
      ? data.paymentSchedule
      : [
          { label: 'Deposit on signature of this Agreement', percentage: 50, amountZar: fee * 0.5 },
          { label: 'Staging / draft sign-off', percentage: 25, amountZar: fee * 0.25 },
          { label: 'Final delivery & deployment', percentage: 25, amountZar: fee * 0.25 },
        ];
    c.table(
      ['Milestone', '%', 'Amount', 'Due'],
      schedule.map((m) => [
        m.label,
        m.percentage != null ? `${m.percentage}%` : '—',
        money(m.amountZar),
        m.dueDate ? dateZA(m.dueDate) : 'On milestone',
      ])
    );
    c.paragraph('Work commences once the deposit reflects. Each subsequent milestone is invoiced as it is reached. Accounts unpaid for more than 14 calendar days past due may result in work being paused until settled. If the Client terminates the project after the deposit, amounts already invoiced remain payable and work product is delivered up to the last paid milestone.');

    heading('Revisions');
    c.paragraph(`The fee includes ${data.revisions ?? 2} round(s) of consolidated revisions per major deliverable. Additional rounds are billed at Touch Domain's standard hourly rate, agreed in writing beforehand.`);

    heading('Warranty & Sign-off');
    c.paragraph(`On final delivery, Touch Domain will correct defects reported within ${data.warrantyDays ?? 30} calendar days at no charge, provided the defect is a failure of the delivered work to function as agreed. This warranty excludes new features, third-party service faults, and changes made by the Client or others after handover.`);
  } else {
    heading('Services & Plan');
    c.paragraph(`Touch Domain will provide the "${data.planLabel || 'selected'}" plan on the terms below.`);
    if (data.planIncludes?.length) c.bullets(data.planIncludes);
    heading('Fees & Billing');
    c.paragraph(
      `The recurring fee is ${money(data.monthlyFee ?? 0)} per month, billed monthly in advance${data.termMonths ? ` on a minimum ${data.termMonths}-month term` : ' on a month-to-month basis'}. Touch Domain is not a registered VAT vendor; no VAT is charged. Either party may cancel on 30 days' written notice. Non-payment beyond 14 days past due may result in suspension of the hosted service, with data retained per our backup policy.`
    );
  }

  heading('Intellectual Property');
  c.paragraph(
    'Final project deliverables become the property of the Client on receipt of full and final payment, subject to any third-party software, font, or content licensing. Touch Domain retains the right to display completed work in its portfolio unless the Client requests otherwise in writing. Pre-existing tools, code libraries, and methodologies remain the property of Touch Domain.'
  );

  heading('Confidentiality');
  c.paragraph('Each party will keep confidential any non-public business information disclosed during the engagement and will not share it with third parties without prior written consent, except where required by law.');

  heading('Limitation of Liability & Force Majeure');
  c.paragraph(
    "Touch Domain's total liability under this Agreement is limited to the fees paid by the Client for the affected work. Neither party is liable for delays caused by circumstances beyond reasonable control, including load-shedding, network or hosting-provider outages, or third-party service disruption."
  );

  heading('Governing Law');
  c.paragraph('This Agreement is governed by the laws of the Republic of South Africa. The parties will attempt to resolve any dispute directly and in good faith before commencing legal proceedings, and submit to the exclusive jurisdiction of the South African courts.');

  c.signatures();
  drawFooter(doc, titles[data.docType]);
  return doc;
}

export const generateContractBlob = (data: ContractData): Blob =>
  generateContractDoc(data).output('blob');

// ── Invoices ──────────────────────────────────────────────────────────
export function generateInvoiceDoc(data: InvoiceData): jsPDF {
  const doc = newDoc();
  drawLetterhead(doc);
  const c = new Cursor(doc);

  const taxInvoice = !!data.isTaxInvoice;
  c.title(taxInvoice ? 'TAX INVOICE' : 'INVOICE');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(`Invoice No: ${data.invoiceNumber}`, MARGIN, c.y);
  doc.text(`Issue date: ${dateZA(data.issueDate)}`, PAGE_W - MARGIN, c.y, { align: 'right' });
  c.y += 13;
  if (data.reference) doc.text(`Reference: ${data.reference}`, MARGIN, c.y);
  doc.text(`Due date: ${dateZA(data.dueDate)}`, PAGE_W - MARGIN, c.y, { align: 'right' });
  c.y += 20;

  c.heading('Bill To');
  c.paragraph(
    [data.clientCompany, data.clientName, data.clientAddress, data.clientEmail].filter(Boolean).join('\n'),
    { size: 9, gap: 12 }
  );

  if (data.covers) {
    c.paragraph(`This invoice covers: ${data.covers}`, { size: 9, gap: data.billingPeriod ? 4 : 10 });
  }
  if (data.billingPeriod) {
    c.paragraph(`Billing period: ${data.billingPeriod}`, { size: 9, gap: 10 });
  }

  const rows = data.lineItems.map((li) => [
    li.description,
    String(li.quantity),
    money(li.unitPrice),
    money(li.quantity * li.unitPrice),
  ]);
  const subtotal = data.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);
  const vat = taxInvoice ? Math.round(subtotal * VAT_RATE * 100) / 100 : 0;
  const total = subtotal + vat;
  c.table(['Description', 'Qty', 'Unit price', 'Amount'], rows);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  const amtRight = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(label, PAGE_W - MARGIN - 150, c.y, { align: 'right' });
    doc.text(value, PAGE_W - MARGIN, c.y, { align: 'right' });
    c.y += 15;
  };
  if (taxInvoice) {
    amtRight('Subtotal', money(subtotal));
    amtRight(`VAT @ ${(VAT_RATE * 100).toFixed(0)}%`, money(vat));
  }
  doc.setTextColor(...PURPLE);
  amtRight('Total due', money(total), true);
  doc.setTextColor(...INK);
  c.y += 8;

  if (!taxInvoice) {
    c.paragraph(
      `${TD.legal} is not a registered VAT vendor and does not qualify for compulsory registration at this time. No VAT is charged on this invoice and no VAT may be claimed against it.`,
      { size: 8, gap: 12 }
    );
  } else if (data.vatNumber) {
    c.paragraph(`VAT registration number: ${data.vatNumber}`, { size: 8, gap: 12 });
  }

  if (data.schedule?.length) {
    c.heading('Project Payment Schedule');
    if (data.projectTotal != null) {
      const paid = data.paidToDate ?? 0;
      c.paragraph(
        `Project total ${money(data.projectTotal)}  ·  Paid to date ${money(paid)}  ·  Outstanding ${money(data.projectTotal - paid)}`,
        { size: 9, gap: 8 }
      );
    }
    c.table(
      ['Installment', 'Amount', 'Due', 'Status'],
      data.schedule.map((s) => [
        s.label,
        money(s.amountZar),
        s.dueDate ? dateZA(s.dueDate) : '—',
        s.paid ? 'Paid' : 'Due',
      ])
    );
  }

  const bank = data.banking ?? TD_BANKING;
  c.heading('Payment Details');
  c.paragraph(
    [
      `Bank: ${bank.bank}`,
      `Account name: ${bank.holder}`,
      `Account number: ${bank.account || '—'}`,
      bank.accountType ? `Account type: ${bank.accountType}` : null,
      `Branch code: ${bank.branch}`,
      bank.swift ? `SWIFT: ${bank.swift}` : null,
      `Reference: ${data.invoiceNumber}`,
    ]
      .filter(Boolean)
      .join('\n'),
    { size: 9, gap: 10 }
  );
  if (data.recurringNote) {
    c.paragraph(data.recurringNote, { size: 8.5, gap: 6 });
  }
  if (data.notes) {
    c.heading('Notes');
    c.paragraph(data.notes, { size: 9 });
  }
  c.paragraph(`${TD.legal}  ·  Reg. ${TD.reg}  ·  ${TD.email}  ·  ${TD.phone}`, { size: 8 });

  drawFooter(doc, `${taxInvoice ? 'Tax Invoice' : 'Invoice'} ${data.invoiceNumber}`);
  return doc;
}

export const generateInvoiceBlob = (data: InvoiceData): Blob =>
  generateInvoiceDoc(data).output('blob');

// ── Browser download helper ───────────────────────────────────────────
export function downloadDoc(doc: jsPDF, filename: string) {
  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
