import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateBrandedEmail } from './../../../utils/emailTemplate';
import { generateQuotePDFBuffer } from './../../../utils/generateQuotePDF';

const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_EMAIL || 'helper@touchdomain.co.za';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { clientName, clientEmail, clientPhone, selections, estimatedTotal, estimatedMonthly, website } = body;

    // Honeypot check — silently report success without sending mail or doing any work.
    if (website) {
      return NextResponse.json({ status: 'success', message: 'Quote submitted successfully!' }, { status: 200 });
    }

    // Configure the Email Transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Generate the PDF Buffer in memory
    const pdfBuffer = await generateQuotePDFBuffer({
      clientName,
      clientEmail,
      clientPhone,
      selections,
      estimatedTotal,
      estimatedMonthly
    });

    // Email to YOU (Admin)
    const adminMailOptions = {
      from: `"Touch Domain Website" <${process.env.SMTP_USER}>`,
      replyTo: clientEmail, 
      to: ADMIN_NOTIFY_EMAIL, 
      subject: `New Custom Quote Request from ${clientName || 'a Visitor'}`,
      text: `You have received a new custom quote request.\n\nDetails:\n${JSON.stringify(body, null, 2)}`,
    };

    // Define the inner body content for the client email
    const clientMessageHTML = `
        <p>Hi ${clientName || 'there'},</p>
        <p>Nice — you've just built out a custom plan for your project, and we've got it.</p>
        <p><strong>Your estimated quotation is attached</strong>, laid out exactly the way you configured it, with no vague line items or hidden extras.</p>
        <p>Our team is reviewing your selections now. We'll be in touch shortly to talk through the details and turn this estimate into a final, tailored quote.</p>
        <br/>
        <p>Speak soon,</p>
        <p><strong>The Touch Domain Team</strong><br/>
        <a href="mailto:${ADMIN_NOTIFY_EMAIL}" style="color: #9972ab;">${ADMIN_NOTIFY_EMAIL}</a></p>
    `;

    const finalBrandedHTML = generateBrandedEmail('Your Custom Quote Is Attached', clientMessageHTML);

    // Email to the VISITOR with the PDF Attachment
    const clientMailOptions = {
      from: `"Touch Domain" <${process.env.SMTP_USER}>`,
      to: clientEmail, 
      subject: `Your Custom Touch Domain Quote`,
      text: `Hi ${clientName || 'there'},\n\nNice — you've just built out a custom plan for your project, and we've got it. Your estimated quotation is attached, laid out exactly the way you configured it. We'll be in touch shortly to turn this into a final, tailored quote.\n\nSpeak soon,\nThe Touch Domain Team`,
      html: finalBrandedHTML,
      attachments: [
        {
          filename: `Touch_Domain_Estimate_${clientName?.replace(/\s+/g, '_') || 'Client'}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Fire concurrently; only the admin email leg is allowed to fail the request —
    // it's the actual lead. A bad client address shouldn't tell a real client "failed".
    const emailJobs: Promise<any>[] = [transporter.sendMail(adminMailOptions)];
    if (clientEmail) {
      emailJobs.push(transporter.sendMail(clientMailOptions));
    }

    const results = await Promise.allSettled(emailJobs);
    const [adminResult, clientResult] = results;

    if (adminResult.status === 'rejected') {
      console.error('Quote admin notification failed:', adminResult.reason);
      return NextResponse.json({ status: 'error', message: 'Failed to submit quote.' }, { status: 500 });
    }

    if (clientResult && clientResult.status === 'rejected') {
      console.error('Quote client confirmation failed:', clientResult.reason);
    }

    return NextResponse.json({ status: 'success', message: 'Quote submitted successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Quote submission error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to submit quote.' }, { status: 500 });
  }
}
