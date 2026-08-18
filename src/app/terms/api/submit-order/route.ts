import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateBrandedEmail } from './../../../utils/emailTemplate';
import { generateOrderPDFBuffer } from './../../../utils/generateOrderPDF';

// Falls back to the hardcoded address if ADMIN_NOTIFY_EMAIL isn't set, so this
// keeps working even before the env var is added to .env.local / hosting config.
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_EMAIL || 'helper@touchdomain.co.za';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientName, clientEmail, clientPhone, serviceName, servicePrice, features, website } = body;

    // Honeypot check — real visitors never see or fill this field. If it's
    // filled, silently report success without sending any mail or doing any work.
    if (website) {
      return NextResponse.json({ status: 'success', message: 'Order submitted successfully!' }, { status: 200 });
    }

    if (!clientName || !clientEmail || !clientPhone || !serviceName) {
      return NextResponse.json({ status: 'error', message: 'All fields are required.' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });

    // Generate the PDF Buffer
    const pdfBuffer = await generateOrderPDFBuffer({ clientName, clientEmail, clientPhone, serviceName, servicePrice, features });

    // 1. Email to Admin
    const adminMailOptions = {
      from: `"Touch Domain Orders" <${process.env.SMTP_USER}>`,
      replyTo: clientEmail,
      to: ADMIN_NOTIFY_EMAIL,
      subject: `New Service Order: ${serviceName}`,
      text: `New order received.\n\nService: ${serviceName}\nEstimated Price: R ${servicePrice || 'TBD'}\nName: ${clientName}\nEmail: ${clientEmail}\nPhone: ${clientPhone}`,
    };

    // 2. Email to Visitor
    const clientMessageHTML = `
        <p>Hi ${clientName},</p>
        <p>Welcome to Touch Domain — your order for <strong>${serviceName}</strong>${servicePrice ? ` at an estimated investment of <strong>R ${servicePrice}</strong>` : ''} just came through.</p>
        <p>Here's exactly what happens next: a member of our digital engineering team will reach out on ${clientPhone} to walk through the scope with you, confirm the final details, and get your project moving. No surprises, no upsell ambush — just a straightforward conversation.</p>
        <p>Your full order summary is attached to this email for your records.</p>
        <br/>
        <p>Looking forward to building this with you,</p>
        <p><strong>The Touch Domain Team</strong><br/>
        <a href="mailto:${ADMIN_NOTIFY_EMAIL}" style="color: #9972ab;">${ADMIN_NOTIFY_EMAIL}</a></p>
    `;

    const finalBrandedHTML = generateBrandedEmail('Welcome to Touch Domain', clientMessageHTML);

    const clientMailOptions = {
      from: `"Touch Domain" <${process.env.SMTP_USER}>`,
      to: clientEmail, 
      subject: `Order Confirmed: ${serviceName}`,
      html: finalBrandedHTML,
      attachments: [
        {
          filename: `Touch_Domain_Order_${serviceName.replace(/\s+/g, '_')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Fire both concurrently, but don't let a bad client address take the
    // admin notification down with it. The admin email is business-critical
    // (it's the actual lead) — the client confirmation is best-effort.
    const [adminResult, clientResult] = await Promise.allSettled([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(clientMailOptions)
    ]);

    if (adminResult.status === 'rejected') {
      console.error('Order admin notification failed:', adminResult.reason);
      return NextResponse.json({ status: 'error', message: 'Failed to submit order.' }, { status: 500 });
    }

    if (clientResult.status === 'rejected') {
      // Admin got the lead — that's what matters. Log the client-side failure
      // (e.g. typo'd email) but don't tell the client their order failed.
      console.error('Order client confirmation failed:', clientResult.reason);
    }

    return NextResponse.json({ status: 'success', message: 'Order submitted successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Order submission error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to submit order.' }, { status: 500 });
  }
}