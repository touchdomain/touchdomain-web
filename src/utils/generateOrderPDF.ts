import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage, PDFImage } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { CUSTOMER_CONTACT_EMAIL } from '../lib/mailer';

interface OrderData {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceName: string;
  servicePrice?: string;
  features: string[];
  orderRef?: string; // optional — falls back to a generated reference if omitted
}

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
};

// ── A4 layout constants (kept identical to generateQuotePDF.ts, so the two
// documents feel like one family — same margins, same header/footer rhythm) ──
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const HEADER_HEIGHT = 120; // restored to match the original file's working header
const FOOTER_HEIGHT = 40;
const MARGIN = 45;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const CONTENT_TOP = PAGE_HEIGHT - HEADER_HEIGHT - 35;
const CONTENT_BOTTOM = FOOTER_HEIGHT + 30; // anything below this triggers a page break

// ── Brand tokens (same values as generateQuotePDF.ts — matches touchdomain-brand-guidelines.html) ──
const BRAND = {
  plum: hexToRgb('#452c63'),
  mauve: hexToRgb('#9972ab'),
  lavTint: hexToRgb('#f5f0fa'), // corrected — was off-palette #faf8fb
  lavBorder: hexToRgb('#e6dcee'),
  ink: hexToRgb('#2a1b3d'), // corrected — was a generic #222222
  grey: hexToRgb('#6b5c7d'), // corrected — was a generic #666666
  hairline: hexToRgb('#e4dced'),
  green: hexToRgb('#2e7d32'),
  white: rgb(1, 1, 1),
};

const wrapText = (text: string, maxWidth: number, font: PDFFont, size: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(testLine, size) <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
};

export const generateOrderPDFBuffer = async (data: OrderData): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.create();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Logo embedding — this part was already correct in the original file
  // (properly awaited, properly drawn). Kept as-is, just hoisted so it only
  // needs to happen once even if the order spans multiple pages.
  let logoImage: PDFImage | null = null;
  let logoDims = { width: 0, height: 0 };
  try {
    const logoPath = path.join(process.cwd(), 'public', 'branding', 'touch-domain-logo-white.png');
    const logoBytes = fs.readFileSync(logoPath);
    logoImage = await pdfDoc.embedPng(logoBytes);
    const targetWidth = 140; // matches the original file's working logo size exactly
    const scale = targetWidth / logoImage.width;
    logoDims = { width: targetWidth, height: logoImage.height * scale };
  } catch {
    logoImage = null; // falls back to text wordmark in drawHeader
  }

  const orderRef = data.orderRef || `TD-ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const pages: PDFPage[] = [];

  const drawHeader = (p: PDFPage) => {
    p.drawRectangle({ x: 0, y: PAGE_HEIGHT - HEADER_HEIGHT, width: PAGE_WIDTH, height: HEADER_HEIGHT, color: BRAND.plum });
    p.drawRectangle({ x: 0, y: PAGE_HEIGHT - HEADER_HEIGHT - 3, width: PAGE_WIDTH, height: 3, color: BRAND.mauve });

    if (logoImage) {
      p.drawImage(logoImage, {
        x: (PAGE_WIDTH - logoDims.width) / 2,
        y: PAGE_HEIGHT - 20 - logoDims.height,
        width: logoDims.width,
        height: logoDims.height,
      });
    } else {
      const titleText = 'TOUCH DOMAIN';
      const titleWidth = fontBold.widthOfTextAtSize(titleText, 20);
      p.drawText(titleText, { x: (PAGE_WIDTH - titleWidth) / 2, y: PAGE_HEIGHT - 46, size: 20, font: fontBold, color: BRAND.white });
    }

    // Brand-voice-aligned subline: specific, not generic agency copy.
    const subText = 'Your Order Confirmation';
    const subWidth = fontRegular.widthOfTextAtSize(subText, 10);
    p.drawText(subText, { x: (PAGE_WIDTH - subWidth) / 2, y: PAGE_HEIGHT - HEADER_HEIGHT + 14, size: 10, font: fontRegular, color: hexToRgb('#e4d9ec') });
  };

  const drawFooter = (p: PDFPage, pageIndex: number, pageTotal: number) => {
    p.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: FOOTER_HEIGHT, color: BRAND.plum });
    const footText = `touchdomain.co.za   |   ${CUSTOMER_CONTACT_EMAIL}   |   081 327 6153`;
    p.drawText(footText, { x: MARGIN, y: (FOOTER_HEIGHT - 8.5) / 2, size: 8.5, font: fontRegular, color: BRAND.white });

    const pageLabel = `${orderRef}   ·   Page ${pageIndex} of ${pageTotal}`;
    const pageLabelWidth = fontRegular.widthOfTextAtSize(pageLabel, 8);
    p.drawText(pageLabel, { x: PAGE_WIDTH - MARGIN - pageLabelWidth, y: (FOOTER_HEIGHT - 8) / 2, size: 8, font: fontRegular, color: hexToRgb('#cbb9db') });
  };

  const newPage = (): PDFPage => {
    const p = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawHeader(p);
    pages.push(p);
    return p;
  };

  let page = newPage();
  let cursorY = CONTENT_TOP;

  // Ensures enough room remains before drawing the next block; page-breaks
  // otherwise. This is the fix for the original file's missing pagination —
  // a package with a long feature list can no longer run text into the footer.
  const ensureSpace = (neededHeight: number) => {
    if (cursorY - neededHeight < CONTENT_BOTTOM) {
      page = newPage();
      cursorY = CONTENT_TOP;
    }
  };

  // ─── DOCUMENT TITLE + REFERENCE ───
  page.drawText('ORDER CONFIRMATION', { x: MARGIN, y: cursorY, size: 18, font: fontBold, color: BRAND.plum });
  const refWidth = fontRegular.widthOfTextAtSize(orderRef, 9.5);
  page.drawText(orderRef, { x: PAGE_WIDTH - MARGIN - refWidth, y: cursorY + 4, size: 9.5, font: fontRegular, color: BRAND.grey });
  cursorY -= 24;

  const introText = `Hi ${data.clientName}, thank you for choosing Touch Domain. Here are your confirmed order details.`;
  const introLines = wrapText(introText, CONTENT_WIDTH, fontRegular, 10);
  introLines.forEach(line => {
    page.drawText(line, { x: MARGIN, y: cursorY, size: 10, font: fontRegular, color: BRAND.grey });
    cursorY -= 14;
  });

  cursorY -= 16;

  // ─── TWO-COLUMN META DATA SECTION ───
  const col1X = MARGIN;
  const col2X = PAGE_WIDTH / 2 + 10;
  const metaYStart = cursorY;

  page.drawText('CLIENT DETAILS', { x: col1X, y: metaYStart, size: 9, font: fontBold, color: BRAND.mauve });
  page.drawText(data.clientName, { x: col1X, y: metaYStart - 15, size: 10.5, font: fontBold, color: BRAND.ink });
  page.drawText(data.clientEmail, { x: col1X, y: metaYStart - 28, size: 9.5, font: fontRegular, color: BRAND.grey });
  if (data.clientPhone) {
    page.drawText(data.clientPhone, { x: col1X, y: metaYStart - 41, size: 9.5, font: fontRegular, color: BRAND.grey });
  }

  const dateStr = new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
  page.drawText('ORDER INFORMATION', { x: col2X, y: metaYStart, size: 9, font: fontBold, color: BRAND.mauve });
  page.drawText(`Date: ${dateStr}`, { x: col2X, y: metaYStart - 15, size: 9.5, font: fontRegular, color: BRAND.ink });
  page.drawText('Status: Confirmed', { x: col2X, y: metaYStart - 28, size: 9.5, font: fontBold, color: BRAND.green });

  cursorY = metaYStart - 58;

  page.drawLine({ start: { x: MARGIN, y: cursorY }, end: { x: PAGE_WIDTH - MARGIN, y: cursorY }, thickness: 1, color: BRAND.hairline });
  cursorY -= 26;

  // ─── PACKAGE SUMMARY — a highlighted card. This is the headline fact of an
  // order confirmation, so it gets the same visual weight the total gets on
  // the quote document, not plain text sitting level with everything else. ───
  ensureSpace(20);
  page.drawText('PACKAGE SUMMARY', { x: MARGIN, y: cursorY, size: 9, font: fontBold, color: BRAND.mauve });
  cursorY -= 18;

  const serviceNameLines = wrapText(data.serviceName, CONTENT_WIDTH - 140, fontBold, 15);
  const summaryHeight = Math.max(serviceNameLines.length * 19, 19) + 24;
  ensureSpace(summaryHeight + 10);

  page.drawRectangle({ x: MARGIN, y: cursorY - summaryHeight, width: CONTENT_WIDTH, height: summaryHeight, color: BRAND.plum });

  let nameY = cursorY - 26;
  serviceNameLines.forEach(line => {
    page.drawText(line, { x: MARGIN + 18, y: nameY, size: 15, font: fontBold, color: BRAND.white });
    nameY -= 19;
  });

  if (data.servicePrice) {
    const priceText = `R ${data.servicePrice}`;
    const priceWidth = fontBold.widthOfTextAtSize(priceText, 16);
    page.drawText(priceText, { x: PAGE_WIDTH - MARGIN - 18 - priceWidth, y: cursorY - 26, size: 16, font: fontBold, color: BRAND.white });
  }

  cursorY -= summaryHeight + 22;

  // ─── FEATURES LIST — card rows, matching the visual language used for the
  // selections list on the quote document, instead of a flat bullet list. ───
  if (data.features && data.features.length > 0) {
    ensureSpace(20);
    page.drawText("WHAT'S INCLUDED", { x: MARGIN, y: cursorY, size: 9, font: fontBold, color: BRAND.mauve });
    cursorY -= 20;

    for (const feature of data.features) {
      const lines = wrapText(feature, CONTENT_WIDTH - 30, fontRegular, 9.5);
      const rowHeight = lines.length * 13 + 12;

      ensureSpace(rowHeight + 6);

      page.drawRectangle({ x: MARGIN, y: cursorY - rowHeight + 8, width: CONTENT_WIDTH, height: rowHeight, color: BRAND.lavTint });
      page.drawRectangle({ x: MARGIN, y: cursorY - rowHeight + 8, width: 3, height: rowHeight, color: BRAND.mauve });

      let rowY = cursorY - 3;
      lines.forEach(line => {
        page.drawText(line, { x: MARGIN + 14, y: rowY, size: 9.5, font: fontRegular, color: BRAND.ink });
        rowY -= 13;
      });

      cursorY -= rowHeight + 6;
    }
  }

  cursorY -= 14;

  // ─── DISCLAIMER / NEXT STEPS BOX ───
  const disclaimerText = "This confirms we've received your order and locks in the agreed scope above. A team member will reach out shortly with onboarding details.";
  const disclaimerLines = wrapText(disclaimerText, CONTENT_WIDTH - 30, fontItalic, 8.5);
  const boxHeight = disclaimerLines.length * 12 + 20;

  ensureSpace(boxHeight + 10);

  page.drawRectangle({
    x: MARGIN, y: cursorY - boxHeight, width: CONTENT_WIDTH, height: boxHeight,
    color: BRAND.lavTint, borderColor: BRAND.lavBorder, borderWidth: 1,
  });
  let lineY = cursorY - 15;
  disclaimerLines.forEach(line => {
    page.drawText(line, { x: MARGIN + 15, y: lineY, size: 8.5, font: fontItalic, color: BRAND.grey });
    lineY -= 12;
  });

  // ─── FOOTERS — drawn last, once the true page count is known ───
  pages.forEach((p, i) => drawFooter(p, i + 1, pages.length));

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};