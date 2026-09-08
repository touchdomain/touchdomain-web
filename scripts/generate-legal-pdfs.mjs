// Generates a branded PDF for each legal document into public/legal/.
//
//   node scripts/generate-legal-pdfs.mjs
//
// Run this after editing src/data/legal.mjs, then commit the regenerated
// files. The content comes straight from legal.mjs so the PDFs and the web
// pages never drift.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { LEGAL_DOCS } from '../src/data/legal.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public', 'legal');
const LOGO_PATH = path.join(ROOT, 'public', 'branding', 'touch-domain-logo-white.png');

const PURPLE = rgb(0x45 / 255, 0x2c / 255, 0x63 / 255);
const ACCENT = rgb(0x99 / 255, 0x72 / 255, 0xab / 255);
const TEXT = rgb(0.2, 0.2, 0.2);
const MUTED = rgb(0.45, 0.45, 0.45);
const WHITE = rgb(1, 1, 1);
const RULE = rgb(0.88, 0.84, 0.91);

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MX = 55;
const CONTENT_W = PAGE_W - MX * 2;
const HEADER_H = 70;
const FOOTER_H = 34;
const BODY_TOP = PAGE_H - HEADER_H - 28;
const BODY_BOTTOM = FOOTER_H + 24;

async function renderDoc(doc, logoBytes) {
  const pdf = await PDFDocument.create();
  const reg = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = logoBytes ? await pdf.embedPng(logoBytes) : null;

  let page;
  let y = 0;
  let pageNo = 0;

  const drawHeader = () => {
    page.drawRectangle({ x: 0, y: PAGE_H - HEADER_H, width: PAGE_W, height: HEADER_H, color: PURPLE });
    page.drawRectangle({ x: 0, y: PAGE_H - HEADER_H - 3, width: PAGE_W, height: 3, color: ACCENT });
    if (logo) {
      // Size by height so a tall logo still sits inside the header band.
      const h = 44;
      const w = (logo.width / logo.height) * h;
      page.drawImage(logo, { x: MX, y: PAGE_H - HEADER_H / 2 - h / 2, width: w, height: h });
    } else {
      page.drawText('TOUCH DOMAIN', { x: MX, y: PAGE_H - HEADER_H / 2 - 6, size: 15, font: bold, color: WHITE });
    }
    const tag = 'touchdomain.co.za';
    page.drawText(tag, {
      x: PAGE_W - MX - reg.widthOfTextAtSize(tag, 9),
      y: PAGE_H - HEADER_H / 2 - 4, size: 9, font: reg, color: rgb(0.89, 0.85, 0.93),
    });
  };

  const drawFooter = () => {
    page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: FOOTER_H, color: PURPLE });
    page.drawText(`${doc.title} · Effective ${doc.effectiveDate}`, {
      x: MX, y: (FOOTER_H - 8) / 2, size: 8, font: reg, color: WHITE,
    });
    const right = `Page ${pageNo}`;
    page.drawText(right, {
      x: PAGE_W - MX - reg.widthOfTextAtSize(right, 8),
      y: (FOOTER_H - 8) / 2, size: 8, font: reg, color: WHITE,
    });
  };

  const newPage = () => {
    if (page) drawFooter();
    page = pdf.addPage([PAGE_W, PAGE_H]);
    pageNo += 1;
    drawHeader();
    y = BODY_TOP;
  };

  const ensure = (needed) => {
    if (y - needed < BODY_BOTTOM) newPage();
  };

  const wrap = (text, font, size, maxW) => {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  // Draw wrapped lines starting at x, one per row, paginating as needed.
  const drawWrapped = (lines, x, size, font, color, lh) => {
    lines.forEach((ln, i) => {
      if (i > 0) ensure(lh);
      page.drawText(ln, { x, y, size, font, color });
      y -= lh;
    });
  };

  const paragraph = (text) => {
    const size = 10, lh = 14;
    const lines = wrap(text, reg, size, CONTENT_W);
    ensure(lh);
    drawWrapped(lines, MX, size, reg, TEXT, lh);
    y -= 8;
  };

  const bullet = (text) => {
    const size = 10, lh = 14, hang = 14;
    const lines = wrap(text, reg, size, CONTENT_W - hang);
    ensure(lh);
    page.drawText('•', { x: MX + 2, y, size, font: reg, color: ACCENT });
    drawWrapped(lines, MX + hang, size, reg, TEXT, lh);
    y -= 5;
  };

  const kvRow = (label, value) => {
    const size = 10, lh = 14;
    const labelText = `${label}:  `;
    const labelW = bold.widthOfTextAtSize(labelText, size);
    const lines = wrap(value, reg, size, CONTENT_W - labelW);
    ensure(lh);
    page.drawText(labelText, { x: MX, y, size, font: bold, color: PURPLE });
    drawWrapped(lines, MX + labelW, size, reg, TEXT, lh);
    y -= 4;
  };

  // ── title block (page 1) ──
  newPage();
  for (const ln of wrap(doc.title, bold, 22, CONTENT_W)) {
    ensure(28);
    page.drawText(ln, { x: MX, y, size: 22, font: bold, color: PURPLE });
    y -= 28;
  }
  page.drawText(doc.subtitle, { x: MX, y, size: 11, font: reg, color: ACCENT });
  y -= 16;
  page.drawText(`Effective date: ${doc.effectiveDate}`, { x: MX, y, size: 9, font: reg, color: MUTED });
  y -= 12;
  page.drawLine({ start: { x: MX, y }, end: { x: PAGE_W - MX, y }, thickness: 1, color: RULE });
  y -= 22;

  // ── body blocks ──
  for (const block of doc.blocks) {
    if ('h' in block) {
      y -= 6;
      ensure(58); // keep the heading with at least the first ~3 lines that follow
      page.drawText(block.h, { x: MX, y, size: 12.5, font: bold, color: PURPLE });
      y -= 18;
    } else if ('sh' in block) {
      y -= 2;
      ensure(44);
      page.drawText(block.sh, { x: MX, y, size: 10.5, font: bold, color: PURPLE });
      y -= 15;
    } else if ('p' in block) {
      paragraph(block.p);
    } else if ('ul' in block) {
      for (const item of block.ul) bullet(item);
      y -= 4;
    } else if ('kv' in block) {
      for (const [label, value] of block.kv) kvRow(label, value);
      y -= 4;
    }
  }

  drawFooter();
  return pdf.save();
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let logoBytes = null;
  try {
    logoBytes = fs.readFileSync(LOGO_PATH);
  } catch {
    console.warn('white logo not found — PDFs will use a text wordmark');
  }

  for (const doc of LEGAL_DOCS) {
    const bytes = await renderDoc(doc, logoBytes);
    const outPath = path.join(OUT_DIR, path.basename(doc.pdf));
    fs.writeFileSync(outPath, bytes);
    console.log(`  ${path.relative(ROOT, outPath)}  (${(bytes.length / 1024).toFixed(1)} kB)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
