import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

interface OrderData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  servicePrice?: string;
  features: string[];
}

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
};

const PAGE_WIDTH = 595.28;
const A4_HEIGHT = 841.89; // ceiling — a package with many feature lines still gets a full page
const MIN_PAGE_HEIGHT = 460;
const HEADER_HEIGHT = 150;
const FOOTER_HEIGHT = 40;

export const generateOrderPDFBuffer = async (data: OrderData): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.create();

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  let logoImage = null;
  try {
    // Real vector logo (actual custom lettering, not a font approximation),
    // recolored white for use on the solid purple header band.
    const logoPath = path.join(process.cwd(), 'public', 'branding', 'logo-real-white.png');
    const logoBytes = fs.readFileSync(logoPath);
    logoImage = await pdfDoc.embedPng(logoBytes);
  } catch (err) {
    console.error('Order PDF: white logo asset not found, falling back to text wordmark.', err);
  }

  // Same principle as the quote PDF: size the page to the actual content
  // (a 3-feature Launchpad order and a 10-feature custom order shouldn't
  // render on an identical full-A4 canvas), capped at A4 for genuinely
  // long feature lists.
  const featureCount = data.features ? data.features.length : 0;
  const estimatedContentHeight =
    HEADER_HEIGHT +
    36 +                          // title + underline
    34 +                          // intro line 1 + 2
    (data.clientPhone ? 72 : 54) + // date/name/email/phone
    20 +                          // spacing before package section
    25 +                          // "Your Package" heading
    20 +                          // package name
    (data.servicePrice ? 22 : 0) + // price line
    18 +                          // "What's Included" heading
    (featureCount * 15) +
    25 +                          // spacing before disclaimer
    100 +                         // disclaimer box
    FOOTER_HEIGHT +
    30;

  const PAGE_HEIGHT = Math.max(MIN_PAGE_HEIGHT, Math.min(estimatedContentHeight, A4_HEIGHT));

  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  // ─── BRANDING HEADER — solid band with decorative accent circles that
  // echo the half-circle motif already used throughout the site, so this
  // reads as a genuine piece of brand collateral rather than a plain
  // purple box with text on it. ───
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - HEADER_HEIGHT, width: PAGE_WIDTH, height: HEADER_HEIGHT, color: hexToRgb('#452c63') });
  page.drawEllipse({ x: PAGE_WIDTH + 15, y: PAGE_HEIGHT + 10, xScale: 85, yScale: 85, color: hexToRgb('#5a3a7a') });
  page.drawEllipse({ x: PAGE_WIDTH - 30, y: PAGE_HEIGHT - HEADER_HEIGHT + 15, xScale: 45, yScale: 45, color: hexToRgb('#9972ab') });
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - HEADER_HEIGHT - 4, width: PAGE_WIDTH, height: 4, color: hexToRgb('#9972ab') });

  let logoBottomY = PAGE_HEIGHT - 20;
  if (logoImage) {
    const logoScale = 160 / logoImage.width;
    const logoW = logoImage.width * logoScale;
    const logoH = logoImage.height * logoScale;
    logoBottomY = PAGE_HEIGHT - 20 - logoH;
    page.drawImage(logoImage, { x: (PAGE_WIDTH - logoW) / 2, y: logoBottomY, width: logoW, height: logoH });
  } else {
    const titleText = 'TOUCH DOMAIN';
    const titleWidth = helveticaBold.widthOfTextAtSize(titleText, 22);
    logoBottomY = PAGE_HEIGHT - 55;
    page.drawText(titleText, { x: (PAGE_WIDTH - titleWidth) / 2, y: logoBottomY, size: 22, font: helveticaBold, color: rgb(1, 1, 1) });
  }

  // Generous, deliberate gap between the logo lockup and the tagline
  // rather than the two crowding each other.
  const subText = 'Crafting Brands. Engineering Digital Experiences.';
  const subWidth = helvetica.widthOfTextAtSize(subText, 9.5);
  page.drawText(subText, { x: (PAGE_WIDTH - subWidth) / 2, y: logoBottomY - 22, size: 9.5, font: helvetica, color: hexToRgb('#e4d9ec') });

  let cursorY = PAGE_HEIGHT - HEADER_HEIGHT - 34;
  const leftMargin = 50;

  // ─── DOCUMENT TITLE ───
  page.drawText('Order Confirmation', { x: leftMargin, y: cursorY, size: 18, font: helveticaBold, color: hexToRgb('#333333') });
  const underlineWidth = helveticaBold.widthOfTextAtSize('Order Confirmation', 18);
  page.drawLine({ start: { x: leftMargin, y: cursorY - 6 }, end: { x: leftMargin + underlineWidth, y: cursorY - 6 }, thickness: 2, color: hexToRgb('#9972ab') });
  cursorY -= 32;

  const introLine1 = `Hi ${data.clientName} — welcome to Touch Domain.`;
  const introLine2 = "We've locked in your order details below. Here's everything, in writing.";
  page.drawText(introLine1, { x: leftMargin, y: cursorY, size: 11.5, font: helvetica, color: hexToRgb('#333333') });
  cursorY -= 16;
  page.drawText(introLine2, { x: leftMargin, y: cursorY, size: 11.5, font: helvetica, color: hexToRgb('#333333') });
  cursorY -= 30;

  // ─── CLIENT DETAILS ───
  const textColor = hexToRgb('#333333');
  page.drawText(`Date: ${new Date().toLocaleDateString('en-ZA')}`, { x: leftMargin, y: cursorY, size: 11, font: helvetica, color: textColor });
  cursorY -= 17;
  page.drawText(`Client Name: ${data.clientName}`, { x: leftMargin, y: cursorY, size: 11, font: helvetica, color: textColor });
  cursorY -= 17;
  page.drawText(`Email: ${data.clientEmail}`, { x: leftMargin, y: cursorY, size: 11, font: helvetica, color: textColor });
  cursorY -= 17;
  page.drawText(`Phone: ${data.clientPhone}`, { x: leftMargin, y: cursorY, size: 11, font: helvetica, color: textColor });
  cursorY -= 34;

  // ─── ORDER DETAILS ───
  page.drawText('Your Package', { x: leftMargin, y: cursorY, size: 14, font: helveticaBold, color: hexToRgb('#452c63') });
  cursorY -= 22;

  page.drawText(`${data.serviceName}`, { x: leftMargin, y: cursorY, size: 13, font: helveticaBold, color: textColor });
  cursorY -= 19;

  if (data.servicePrice) {
    page.drawText(`Estimated Investment: R ${data.servicePrice}`, { x: leftMargin, y: cursorY, size: 12, font: helveticaBold, color: hexToRgb('#9972ab') });
    cursorY -= 20;
  }

  if (data.features && data.features.length > 0) {
    page.drawText("What's Included:", { x: leftMargin, y: cursorY, size: 11, font: helveticaBold, color: hexToRgb('#452c63') });
    cursorY -= 17;
    data.features.forEach(feature => {
      page.drawText(`- ${feature}`, { x: leftMargin + 10, y: cursorY, size: 10, font: helvetica, color: hexToRgb('#555555') });
      cursorY -= 15;
    });
  }
  cursorY -= 18;

  // ─── DISCLAIMER FOOTER ───
  const rectY = cursorY - 55;
  page.drawRectangle({ x: leftMargin, y: rectY, width: 495, height: 65, color: hexToRgb('#faf8fb'), borderColor: hexToRgb('#e6dcee'), borderWidth: 1 });

  const line1 = "This confirms we've received your order, and locks in the price shown above.";
  const line2 = "A member of the team will be in touch shortly to walk through scope together";
  const line3 = "and get things moving — no surprises, just the next honest conversation.";

  page.drawText(line1, { x: leftMargin + 15, y: rectY + 44, size: 10, font: helveticaOblique, color: hexToRgb('#666666') });
  page.drawText(line2, { x: leftMargin + 15, y: rectY + 29, size: 10, font: helveticaOblique, color: hexToRgb('#666666') });
  page.drawText(line3, { x: leftMargin + 15, y: rectY + 14, size: 10, font: helveticaOblique, color: hexToRgb('#666666') });

  // ─── FOOTER BAND ───
  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: FOOTER_HEIGHT, color: hexToRgb('#452c63') });
  const footText = 'touchdomain.co.za   |   info@touchdomain.co.za   |   081 327 6153';
  const footWidth = helvetica.widthOfTextAtSize(footText, 9);
  page.drawText(footText, { x: (PAGE_WIDTH - footWidth) / 2, y: (FOOTER_HEIGHT - 9) / 2, size: 9, font: helvetica, color: rgb(1, 1, 1) });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};