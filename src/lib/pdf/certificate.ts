import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';

const PURPLE: [number, number, number] = [69, 44, 99];
const ACCENT: [number, number, number] = [153, 114, 171];
const INK: [number, number, number] = [26, 26, 26];
const MUTED: [number, number, number] = [110, 110, 110];
const PAGE_W = 595.28;
const MARGIN = 54;

const TD = {
  legal: 'TOUCHDOMAIN (Pty) Ltd',
  reg: '2026/686289/07',
  web: 'www.touchdomain.co.za',
};

const dt = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' SAST';
};

export interface CertificateData {
  contractId: string;
  title: string;
  sourceSha256: string;
  agreementDate?: string;
  client: { name: string; signedAt: string; ip: string; signaturePng?: string | null };
  representative: { name: string; signedAt: string; ip: string };
}

/** A branded one-page signature certificate as a PDF (Uint8Array). */
export function generateSignatureCertificate(data: CertificateData): Uint8Array {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

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
  doc.text(`${TD.legal}  ·  Reg. ${TD.reg}`, PAGE_W - MARGIN, 26, { align: 'right' });

  let y = 100;
  doc.setTextColor(...PURPLE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SIGNATURE CERTIFICATE', PAGE_W / 2, y, { align: 'center' });
  y += 10;
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(1);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 26;

  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const para = (t: string) => {
    for (const line of doc.splitTextToSize(t, PAGE_W - MARGIN * 2) as string[]) {
      doc.text(line, MARGIN, y);
      y += 13;
    }
    y += 6;
  };

  para(
    `This certificate records the electronic execution of the document below through the Touch Domain client portal. Each signatory was authenticated by a portal account login before signing, and expressed their intent to be bound by ticking a consent statement.`
  );

  doc.setFont('helvetica', 'bold');
  doc.text('Document', MARGIN, y); y += 14;
  doc.setFont('helvetica', 'normal');
  para(`${data.title}`);
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  para(`Reference: ${data.contractId}`);
  para(`Source document SHA-256: ${data.sourceSha256}`);
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);

  const party = (role: string, name: string, signedAt: string, ip: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(role, MARGIN, y); y += 14;
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${name}`, MARGIN, y); y += 13;
    doc.text(`Signed: ${dt(signedAt)}`, MARGIN, y); y += 13;
    doc.text(`IP address: ${ip || 'not recorded'}`, MARGIN, y); y += 16;
  };

  y += 4;
  party('Client', data.client.name, data.client.signedAt, data.client.ip);

  if (data.client.signaturePng) {
    try {
      doc.addImage(data.client.signaturePng, 'PNG', MARGIN, y, 160, 50);
      y += 58;
    } catch {
      /* ignore a bad image */
    }
  }

  party(`For and on behalf of ${TD.legal}`, data.representative.name, data.representative.signedAt, data.representative.ip);

  y += 8;
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  para(
    `This document was concluded by electronic signature in terms of the Electronic Communications and Transactions Act 25 of 2002. The parties agree that their electronic signatures are valid and binding, and that this certificate together with the attached document constitutes the signed agreement.`
  );

  doc.setDrawColor(224, 214, 232);
  doc.line(MARGIN, 800, PAGE_W - MARGIN, 800);
  doc.setFontSize(7.5);
  doc.text(`Signature certificate  ·  ${TD.web}`, MARGIN, 814);

  return new Uint8Array(doc.output('arraybuffer'));
}

/** Merge the source contract PDF with the signature certificate. */
export async function mergeExecutedContract(
  sourcePdf: Buffer | Uint8Array,
  certificatePdf: Uint8Array
): Promise<Buffer> {
  const out = await PDFDocument.load(sourcePdf);
  const cert = await PDFDocument.load(certificatePdf);
  const pages = await out.copyPages(cert, cert.getPageIndices());
  pages.forEach((p) => out.addPage(p));
  const bytes = await out.save();
  return Buffer.from(bytes);
}
