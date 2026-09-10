import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// We extract your standard info here to keep it out of the UI
const TD_INFO = {
  legal: 'TOUCHDOMAIN (Pty) Ltd',
  trading: 'Touch Domain',
  reg: '2026/686289/07',
  address: '96 Makgathe Street, Ipelegeng, Schweizer-Reneke, 2780',
  phone: '081 327 6153',
  email: 'info@touchdomain.co.za',
  signatory: 'Thabo Mtsweni'
};

export async function generateContractPdf(data: any) {
  // Initialize standard A4 PDF
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const MARGIN = 54, PAGE_W = 595.28;
  
  // Create your standard Letterhead header (Replicated from your script)
  doc.setFillColor(31, 92, 79); // Teal Header
  doc.rect(0, 0, PAGE_W, 54, 'F');
  
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('Touch Domain', MARGIN, 34);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${TD_INFO.legal}  ·  Reg. ${TD_INFO.reg}`, PAGE_W - MARGIN, 22, { align: 'right' });
  doc.text(`${TD_INFO.address}`, PAGE_W - MARGIN, 32, { align: 'right' });
  doc.text(`${TD_INFO.phone}  ·  ${TD_INFO.email}`, PAGE_W - MARGIN, 42, { align: 'right' });
  
  doc.setTextColor(20, 20, 20);

  // Generate Document based on selection
  if (data.docType === 'sa') {
    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.text('SERVICE AGREEMENT', PAGE_W / 2, 100, { align: 'center' });
    
    doc.setDrawColor(23, 27, 26);
    doc.line(MARGIN, 110, PAGE_W - MARGIN, 110);
    
    doc.setFontSize(10.5);
    doc.setFont('times', 'normal');
    doc.text(`This Agreement is entered into between ${TD_INFO.legal} and ${data.clientCompany} ("the Client").`, MARGIN, 140, { maxWidth: PAGE_W - MARGIN * 2 });
    
    // AutoTable for Milestones
    autoTable(doc, {
      startY: 200,
      head: [['Milestone', 'Percentage', 'Amount']],
      body: [
        ['Deposit upon SOW execution', '50%', `R ${(data.totalFee * 0.5).toLocaleString()}`],
        ['Staging site sign-off', '25%', `R ${(data.totalFee * 0.25).toLocaleString()}`],
        ['Final deployment', '25%', `R ${(data.totalFee * 0.25).toLocaleString()}`],
      ],
      headStyles: { fillColor: [31, 92, 79] }
    });
  }

  // Finalize and trigger browser download
  const slug = (data.clientCompany || 'client').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  doc.save(`TouchDomain-${data.docType}-${slug}.pdf`);
}