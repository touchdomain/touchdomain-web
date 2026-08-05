import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateBrandedEmail } from './../../../utils/emailTemplate';

const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_EMAIL || 'helper@touchdomain.co.za';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { consultationName, consultationEmail, consultationPhone, consultationDateTime, website } = body;

    // Honeypot check — silently report success without sending mail or doing any work.
    if (website) {
      return NextResponse.json({ status: 'success', message: 'Consultation booked successfully! We will be in touch.' }, { status: 200 });
    }

    if (!consultationName || !consultationEmail || !consultationDateTime) {
      return NextResponse.json({ status: 'error', message: 'Name, email, and date are required.' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // 1. Email to YOU (Touch Domain Admin)
    const mailOptions = {
      from: `"${consultationName}" <${process.env.SMTP_USER}>`,
      replyTo: consultationEmail,
      to: ADMIN_NOTIFY_EMAIL, 
      subject: `New Consultation Booking: ${consultationName}`,
      text: `
You have a new consultation request!

Name: ${consultationName}
Email: ${consultationEmail}
Phone: ${consultationPhone || 'Not provided'}
Requested Date & Time: ${new Date(consultationDateTime).toLocaleString('en-ZA')}
      `,
    };

    // 2. Define the inner body content for the client email
    const clientMessageHTML = `
        <p>Hi ${consultationName || 'there'},</p>
        <p>You're booked in. Here's what we've got on our end:</p>
        <ul style="background: #f8f9fa; padding: 15px 30px; border-radius: 5px; list-style-type: none; border-left: 4px solid #9972ab;">
            <li style="margin-bottom: 5px;"><strong>Email:</strong> ${consultationEmail}</li>
            <li style="margin-bottom: 5px;"><strong>Phone:</strong> ${consultationPhone || 'Not provided'}</li>
            <li><strong>Requested Date & Time:</strong> ${new Date(consultationDateTime).toLocaleString('en-ZA')}</li>
        </ul>
        <p>We'll call you at that time to talk through what you're building and how we can help. If a video call or email suits you better, just reply here and let us know — we'll work around you.</p>
        <br/>
        <p>Talk soon,</p>
        <p><strong>The Touch Domain Team</strong><br/>
        <a href="mailto:${ADMIN_NOTIFY_EMAIL}" style="color: #9972ab;">${ADMIN_NOTIFY_EMAIL}</a></p>
    `;

    // 3. Wrap it in the branded template
    const finalBrandedHTML = generateBrandedEmail("You're Booked In", clientMessageHTML);

    // 4. Email to the VISITOR (Auto-Responder)
    const clientMailOptions = {
      from: `"Touch Domain" <${process.env.SMTP_USER}>`,
      to: consultationEmail, 
      subject: `You're booked in with Touch Domain`,
      text: `Hi ${consultationName || 'there'},\n\nYou're booked in. Here's what we've got on our end:\n\nEmail: ${consultationEmail}\nPhone: ${consultationPhone || 'Not provided'}\nRequested Date & Time: ${new Date(consultationDateTime).toLocaleString('en-ZA')}\n\nWe'll call you at that time to talk through what you're building and how we can help. If a video call or email suits you better, just reply here and let us know.\n\nTalk soon,\nThe Touch Domain Team\n${ADMIN_NOTIFY_EMAIL}`,
      html: finalBrandedHTML 
    };

    // 5. Fire emails concurrently; only the admin leg can fail the request —
    // that's the actual booking. A bad client address shouldn't block it.
    const emailJobs: Promise<any>[] = [transporter.sendMail(mailOptions)];
    if (consultationEmail) {
        emailJobs.push(transporter.sendMail(clientMailOptions));
    }

    const results = await Promise.allSettled(emailJobs);
    const [adminResult, clientResult] = results;

    if (adminResult.status === 'rejected') {
      console.error('Consultation admin notification failed:', adminResult.reason);
      return NextResponse.json({ status: 'error', message: 'Failed to book consultation. Please try again.' }, { status: 500 });
    }

    if (clientResult && clientResult.status === 'rejected') {
      console.error('Consultation client confirmation failed:', clientResult.reason);
    }

    return NextResponse.json({ status: 'success', message: 'Consultation booked successfully! We will be in touch.' }, { status: 200 });

  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to book consultation. Please try again.' }, { status: 500 });
  }
}