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
  banking: {
    bank: 'First National Bank',
    account: 'TOUCHDOMAIN (Pty) Ltd',
    number: '—',
    branch: '250655',
  },
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;

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
    // jspdf-autotable stashes the end position here.
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

  if (data.docType === 'sa') {
    c.heading('1. Scope of Work & Deliverables');
    c.paragraph('Touch Domain will provide the following deliverables:');
    c.bullets((data.deliverables && data.deliverables.length ? data.deliverables : ['As set out in the accompanying proposal.']));
    if (data.outOfScope?.length) {
      c.paragraph('The following are expressly out of scope and will be quoted separately if required:');
      c.bullets(data.outOfScope);
    }
    if (data.clientMaterials?.length) {
      c.heading('2. Client Responsibilities');
      c.paragraph('The Client will supply, in a timely manner:');
      c.bullets(data.clientMaterials);
    }

    c.heading(`${data.clientMaterials?.length ? '3' : '2'}. Fees & Payment Schedule`);
    const fee = data.totalFee ?? 0;
    c.paragraph(`The total once-off project fee is ${money(fee)} (excluding VAT where applicable), payable as follows:`);
    c.table(
      ['Milestone', 'Portion', 'Amount (ZAR)'],
      [
        ['Deposit on signature of this Agreement', '50%', money(fee * 0.5)],
        ['Staging / draft sign-off', '25%', money(fee * 0.25)],
        ['Final delivery & deployment', '25%', money(fee * 0.25)],
      ]
    );
    c.paragraph('Work commences once the deposit reflects. Accounts unpaid for more than 14 calendar days past due may result in work being paused until settled.');

    c.heading(`${data.clientMaterials?.length ? '4' : '3'}. Revisions`);
    c.paragraph(`The fee includes ${data.revisions ?? 2} round(s) of consolidated revisions per major deliverable. Additional rounds are billed at Touch Domain's standard hourly rate, agreed in writing beforehand.`);
  } else {
    c.heading('1. Services & Plan');
    c.paragraph(`Touch Domain will provide the "${data.planLabel || 'selected'}" plan on the terms below.`);
    if (data.planIncludes?.length) c.bullets(data.planIncludes);
    c.heading('2. Fees & Billing');
    c.paragraph(
      `The recurring fee is ${money(data.monthlyFee ?? 0)} per month, billed monthly in advance${data.termMonths ? ` on a minimum ${data.termMonths}-month term` : ' on a month-to-month basis'}. Either party may cancel on 30 days' written notice. Non-payment beyond 14 days past due may result in suspension of the hosted service, with data retained per our backup policy.`
    );
  }

  const ipNo = data.docType === 'sa' ? '5' : '3';
  c.heading(`${ipNo}. Intellectual Property`);
  c.paragraph(
    'Final project deliverables become the property of the Client on receipt of full and final payment, subject to any third-party software, font, or content licensing. Touch Domain retains the right to display completed work in its portfolio unless the Client requests otherwise in writing. Pre-existing tools, code libraries, and methodologies remain the property of Touch Domain.'
  );

  c.heading(`${data.docType === 'sa' ? '6' : '4'}. Confidentiality`);
  c.paragraph('Each party will keep confidential any non-public business information disclosed during the engagement and will not share it with third parties without prior written consent, except where required by law.');

  c.heading(`${data.docType === 'sa' ? '7' : '5'}. Limitation of Liability & Force Majeure`);
  c.paragraph(
    "Touch Domain's total liability under this Agreement is limited to the fees paid by the Client for the affected work. Neither party is liable for delays caused by circumstances beyond reasonable control, including load-shedding, network or hosting-provider outages, or third-party service disruption."
  );

  c.heading(`${data.docType === 'sa' ? '8' : '6'}. Governing Law`);
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

  c.title('TAX INVOICE');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(`Invoice No: ${data.invoiceNumber}`, MARGIN, c.y);
  doc.text(`Issue date: ${dateZA(data.issueDate)}`, PAGE_W - MARGIN, c.y, { align: 'right' });
  c.y += 13;
  doc.text(`Due date: ${dateZA(data.dueDate)}`, PAGE_W - MARGIN, c.y, { align: 'right' });
  c.y += 20;

  c.heading('Bill To');
  c.paragraph(
    [data.clientCompany, data.clientName, data.clientAddress, data.clientEmail].filter(Boolean).join('\n'),
    { size: 9, gap: 12 }
  );

  const rows = data.lineItems.map((li) => [
    li.description,
    String(li.quantity),
    money(li.unitPrice),
    money(li.quantity * li.unitPrice),
  ]);
  const subtotal = data.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);
  c.table(['Description', 'Qty', 'Unit price', 'Amount'], rows);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...PURPLE);
  doc.text('Total due:', PAGE_W - MARGIN - 140, c.y, { align: 'right' });
  doc.text(money(subtotal), PAGE_W - MARGIN, c.y, { align: 'right' });
  c.y += 24;

  c.heading('Payment Details');
  c.paragraph(
    `Bank: ${TD.banking.bank}\nAccount name: ${TD.banking.account}\nAccount number: ${TD.banking.number}\nBranch code: ${TD.banking.branch}\nReference: ${data.invoiceNumber}`,
    { size: 9, gap: 10 }
  );
  if (data.notes) {
    c.heading('Notes');
    c.paragraph(data.notes, { size: 9 });
  }
  c.paragraph(`${TD.legal}  ·  Reg. ${TD.reg}  ·  ${TD.email}  ·  ${TD.phone}`, { size: 8 });

  drawFooter(doc, `Invoice ${data.invoiceNumber}`);
  return doc;
}

export const generateInvoiceBlob = (data: InvoiceData): Blob =>
  generateInvoiceDoc(data).output('blob');

// ── Browser download helper ───────────────────────────────────────────
export function downloadDoc(doc: jsPDF, filename: string) {
  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
