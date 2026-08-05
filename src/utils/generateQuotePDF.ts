import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

interface QuoteData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  selections: Record<string, string>;
  estimatedTotal: number | string;
  estimatedMonthly?: number | string;
}

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
};

const PAGE_WIDTH = 595.28;
const A4_HEIGHT = 841.89; // used as a ceiling — long quotes still get a full page + pagination
const MIN_PAGE_HEIGHT = 480; // a very short quote (e.g. no add-ons selected) still gets breathing room
const HEADER_HEIGHT = 150; // solid brand band, not just a thin strip
const FOOTER_HEIGHT = 40;

export const generateQuotePDFBuffer = async (data: QuoteData): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.create();

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Embed the real logo mark (white version, since it now sits inside a solid
  // purple header band rather than floating on white below a thin strip).
  let logoImage = null;
  try {
    // Real vector logo (actual custom lettering, not a font approximation),
    // recolored white for use on the solid purple header band.
    const logoPath = path.join(process.cwd(), 'public', 'branding', 'logo-real-white.png');
    const logoBytes = fs.readFileSync(logoPath);
    logoImage = await pdfDoc.embedPng(logoBytes);
  } catch (err) {
    console.error('Quote PDF: white logo asset not found, falling back to text wordmark.', err);
  }

  // ── Estimate how tall this document actually needs to be ──
  // A quote with 2 selections and one with 20 shouldn't render on an identical
  // full A4 canvas — that's what was causing "mostly blank page, have to zoom
  // in to read the small text" on short quotes. We size the page to the real
  // content instead, capped at a full A4 (where the existing pagination logic
  // below takes over for genuinely long quotes).
  const selectionCount = data.selections ? Object.keys(data.selections).length : 0;
  const hasMonthly = !!(data.estimatedMonthly && Number(String(data.estimatedMonthly).replace(/,/g, '')) > 0);
  const estimatedContentHeight =
    HEADER_HEIGHT +          // header band
    36 +                     // title + underline
    34 +                     // intro line 1 + 2
    (data.clientPhone ? 72 : 54) + // date/name/email(/phone)
    45 +                     // "What You Selected" heading + spacing
    (selectionCount * 20) +  // one line per selection
    45 +                     // divider + spacing before totals
    22 +                     // total line
    (hasMonthly ? 20 : 0) +  // optional monthly line
    100 +                    // disclaimer box
    FOOTER_HEIGHT +
    40;                      // top/bottom breathing margin

  const PAGE_HEIGHT = Math.max(MIN_PAGE_HEIGHT, Math.min(estimatedContentHeight, A4_HEIGHT));

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  const drawHeader = (p: typeof page, pageHeight: number) => {
    // Solid brand band with decorative accent circles that echo the
    // half-circle motif already used throughout the site, so this reads
    // as a genuine piece of brand collateral rather than a plain purple
    // box with text on it.
    p.drawRectangle({ x: 0, y: pageHeight - HEADER_HEIGHT, width: PAGE_WIDTH, height: HEADER_HEIGHT, color: hexToRgb('#452c63') });
    p.drawEllipse({ x: PAGE_WIDTH + 15, y: pageHeight + 10, xScale: 85, yScale: 85, color: hexToRgb('#5a3a7a') });
    p.drawEllipse({ x: PAGE_WIDTH - 30, y: pageHeight - HEADER_HEIGHT + 15, xScale: 45, yScale: 45, color: hexToRgb('#9972ab') });
    p.drawRectangle({ x: 0, y: pageHeight - HEADER_HEIGHT - 4, width: PAGE_WIDTH, height: 4, color: hexToRgb('#9972ab') });

    let logoBottomY = pageHeight - 20;
    if (logoImage) {
      const logoScale = 160 / logoImage.width;
      const logoW = logoImage.width * logoScale;
      const logoH = logoImage.height * logoScale;
      logoBottomY = pageHeight - 20 - logoH;
      p.drawImage(logoImage, { x: (PAGE_WIDTH - logoW) / 2, y: logoBottomY, width: logoW, height: logoH });
    } else {
      const titleText = 'TOUCH DOMAIN';
      const titleWidth = helveticaBold.widthOfTextAtSize(titleText, 22);
      logoBottomY = pageHeight - 55;
      p.drawText(titleText, { x: (PAGE_WIDTH - titleWidth) / 2, y: logoBottomY, size: 22, font: helveticaBold, color: rgb(1, 1, 1) });
    }

    // Generous, deliberate gap between the logo lockup and the tagline
    // rather than the two crowding each other.
    const subText = 'Crafting Brands. Engineering Digital Experiences.';
    const subWidth = helvetica.widthOfTextAtSize(subText, 9.5);
    p.drawText(subText, { x: (PAGE_WIDTH - subWidth) / 2, y: logoBottomY - 22, size: 9.5, font: helvetica, color: hexToRgb('#e4d9ec') });
  };

  const drawFooter = (p: typeof page) => {
    p.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: FOOTER_HEIGHT, color: hexToRgb('#452c63') });
    const footText = 'touchdomain.co.za   |   info@touchdomain.co.za   |   081 327 6153';
    const footWidth = helvetica.widthOfTextAtSize(footText, 9);
    p.drawText(footText, { x: (PAGE_WIDTH - footWidth) / 2, y: (FOOTER_HEIGHT - 9) / 2, size: 9, font: helvetica, color: rgb(1, 1, 1) });
  };

  drawHeader(page, PAGE_HEIGHT);
  let cursorY = PAGE_HEIGHT - HEADER_HEIGHT - 34;
  const leftMargin = 50;

  // ─── DOCUMENT TITLE ───
  page.drawText('Your Custom Quote Estimate', { x: leftMargin, y: cursorY, size: 18, font: helveticaBold, color: hexToRgb('#452c63') });
  const underlineWidth = helveticaBold.widthOfTextAtSize('Your Custom Quote Estimate', 18);
  page.drawLine({ start: { x: leftMargin, y: cursorY - 6 }, end: { x: leftMargin + underlineWidth, y: cursorY - 6 }, thickness: 2, color: hexToRgb('#9972ab') });
  cursorY -= 32;

  const introLine1 = `Hi ${data.clientName || 'there'} — thanks for building this out with us.`;
  const introLine2 = "Here's exactly what you selected, and what it comes to.";
  page.drawText(introLine1, { x: leftMargin, y: cursorY, size: 11.5, font: helvetica, color: hexToRgb('#333333') });
  cursorY -= 16;
  page.drawText(introLine2, { x: leftMargin, y: cursorY, size: 11.5, font: helvetica, color: hexToRgb('#333333') });
  cursorY -= 30;

  // ─── CLIENT DETAILS ───
  const textColor = hexToRgb('#333333');
  page.drawText(`Date: ${new Date().toLocaleDateString('en-ZA')}`, { x: leftMargin, y: cursorY, size: 11, font: helvetica, color: textColor });
  cursorY -= 17;
  page.drawText(`Prepared For: ${data.clientName}`, { x: leftMargin, y: cursorY, size: 11, font: helvetica, color: textColor });
  cursorY -= 17;
  page.drawText(`Email: ${data.clientEmail}`, { x: leftMargin, y: cursorY, size: 11, font: helvetica, color: textColor });
  cursorY -= 17;
  if (data.clientPhone) {
    page.drawText(`Phone: ${data.clientPhone}`, { x: leftMargin, y: cursorY, size: 11, font: helvetica, color: textColor });
    cursorY -= 17;
  }
  cursorY -= 18;

  // ─── PROJECT SELECTIONS ───
  page.drawText('What You Selected', { x: leftMargin, y: cursorY, size: 14, font: helveticaBold, color: hexToRgb('#452c63') });
  cursorY -= 24;

  const ensureSpace = (p: typeof page, y: number) => {
    if (y < FOOTER_HEIGHT + 40) {
      drawFooter(p);
      const newPage = pdfDoc.addPage([PAGE_WIDTH, A4_HEIGHT]);
      drawHeader(newPage, A4_HEIGHT);
      return { page: newPage, cursorY: A4_HEIGHT - HEADER_HEIGHT - 30 };
    }
    return { page: p, cursorY: y };
  };

  if (data.selections && Object.keys(data.selections).length > 0) {
    Object.entries(data.selections).forEach(([category, option]) => {
        const bullet = `• ${category}:`;
        page.drawText(bullet, { x: leftMargin, y: cursorY, size: 12, font: helveticaBold, color: textColor });

        const bulletWidth = helveticaBold.widthOfTextAtSize(bullet, 12);
        page.drawText(` ${option}`, { x: leftMargin + bulletWidth, y: cursorY, size: 12, font: helvetica, color: textColor });

        cursorY -= 20;

        const adjusted = ensureSpace(page, cursorY);
        page = adjusted.page;
        cursorY = adjusted.cursorY;
    });
  } else {
    page.drawText('No specific service tiers selected.', { x: leftMargin, y: cursorY, size: 12, font: helvetica, color: textColor });
    cursorY -= 20;
  }
  cursorY -= 16;

  // ─── ESTIMATED TOTAL ───
  if (cursorY - 80 < FOOTER_HEIGHT + 20) {
    drawFooter(page);
    page = pdfDoc.addPage([PAGE_WIDTH, A4_HEIGHT]);
    drawHeader(page, A4_HEIGHT);
    cursorY = A4_HEIGHT - HEADER_HEIGHT - 30;
  }

  page.drawLine({ start: { x: leftMargin, y: cursorY }, end: { x: PAGE_WIDTH - leftMargin, y: cursorY }, thickness: 1, color: hexToRgb('#eeeeee') });
  cursorY -= 25;

  const totalText = `Estimated Project Total (Once-Off): R ${data.estimatedTotal || 'TBD'}`;
  const totalWidth = helveticaBold.widthOfTextAtSize(totalText, 14);
  page.drawText(totalText, { x: PAGE_WIDTH - leftMargin - totalWidth, y: cursorY, size: 14, font: helveticaBold, color: hexToRgb('#452c63') });
  cursorY -= 22;

  if (hasMonthly) {
    const monthlyText = `Optional Monthly Retainer: R ${data.estimatedMonthly} / month`;
    const monthlyWidth = helvetica.widthOfTextAtSize(monthlyText, 12);
    page.drawText(monthlyText, { x: PAGE_WIDTH - leftMargin - monthlyWidth, y: cursorY, size: 12, font: helvetica, color: hexToRgb('#9972ab') });
    cursorY -= 20;
  }
  cursorY -= 18;

  // ─── DISCLAIMER FOOTER ───
  const rectY = cursorY - 55;
  page.drawRectangle({ x: leftMargin, y: rectY, width: 495, height: 65, color: hexToRgb('#faf8fb'), borderColor: hexToRgb('#e6dcee'), borderWidth: 1 });

  const line1 = "This is an estimate, not an invoice — the number above reflects exactly what you selected,";
  const line2 = "priced honestly with no hidden extras. We'll be in touch shortly to walk through the details";
  const line3 = "together and lock in a final, tailored quotation before any work begins.";

  page.drawText(line1, { x: leftMargin + 15, y: rectY + 44, size: 10, font: helveticaOblique, color: hexToRgb('#666666') });
  page.drawText(line2, { x: leftMargin + 15, y: rectY + 29, size: 10, font: helveticaOblique, color: hexToRgb('#666666') });
  page.drawText(line3, { x: leftMargin + 15, y: rectY + 14, size: 10, font: helveticaOblique, color: hexToRgb('#666666') });

  drawFooter(page);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};