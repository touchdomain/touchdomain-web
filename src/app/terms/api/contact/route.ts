import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateBrandedEmail } from './../../../utils/emailTemplate';

const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_EMAIL || 'helper@touchdomain.co.za';

export async function POST(request: Request) {
  try {
    // 1. Get the raw JSON data
    const body = await request.json();
    const { name, email, topic, message, budget, timeline, affected, website } = body;

    // Honeypot check — silently report success without sending mail or doing any work.
    if (website) {
      return NextResponse.json({ status: 'success', message: 'Message sent successfully!' }, { status: 200 });
    }

    // 2. Basic Validation (Mirroring your PHP logic)
    if (!name || !email || !message) {
      return NextResponse.json(
        { status: 'error', message: 'Please complete all required fields.' },
        { status: 400 }
      );
    }

    // 3. Configure the Email Transporter using your .env.local variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Build the qualifying-answers block conditionally — only the fields
    // relevant to the chosen subject will ever be populated, so this stays
    // clean rather than printing empty lines for a Partnership or General
    // enquiry that never asked these questions.
    const qualifyingLines = [
      budget ? `Budget: ${budget}` : null,
      timeline ? `Timeline: ${timeline}` : null,
      affected ? `What's affected: ${affected}` : null,
    ].filter(Boolean).join('\n');

    // 4. Set up the admin notification email
    const adminMailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`, // Sent via your authenticated server
      replyTo: email, // Allows you to hit 'Reply' and email the customer directly
      to: ADMIN_NOTIFY_EMAIL, // Where you want to receive the messages
      subject: `New Enquiry: ${topic || 'General'}`,
      text: `
Name: ${name}
Email: ${email}
Subject: ${topic || 'Not specified'}
${qualifyingLines ? '\n' + qualifyingLines + '\n' : ''}
Message:
${message}
      `,
    };

    // 5. Set up the visitor auto-responder — previously this route sent
    // nothing back to the visitor, so they had no record they'd contacted us.
    const clientMessageHTML = `
        <p>Hi ${name},</p>
        <p>Got it — your message just landed in our inbox, and a real person on our team will read it, not a bot.</p>
        ${topic ? `<p>We can see this is about <strong>${topic}</strong>, so we'll make sure it gets to the right person.</p>` : ''}
        <p>For your records, here's what you sent us:</p>
        <blockquote style="background: #f8f9fa; padding: 15px 20px; border-radius: 5px; border-left: 4px solid #9972ab; color: #444; font-style: italic;">
          ${message}
        </blockquote>
        <p>We'll be back in your inbox shortly.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>The Touch Domain Team</strong><br/>
        <a href="mailto:${ADMIN_NOTIFY_EMAIL}" style="color: #9972ab;">${ADMIN_NOTIFY_EMAIL}</a></p>
    `;

    const finalBrandedHTML = generateBrandedEmail('Got It — We Have Your Message', clientMessageHTML);

    const clientMailOptions = {
      from: `"Touch Domain" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `We've got your message`,
      text: `Hi ${name},\n\nGot it — your message just landed in our inbox, and a real person on our team will read it, not a bot.\n\nFor your records, here's what you sent us:\n${message}\n\nWe'll be back in your inbox shortly.\n\nBest regards,\nThe Touch Domain Team\n${ADMIN_NOTIFY_EMAIL}`,
      html: finalBrandedHTML,
    };

    // 6. Fire both concurrently; only the admin leg can fail the request —
    // that's the actual enquiry. A bad visitor address shouldn't block it.
    const results = await Promise.allSettled([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(clientMailOptions),
    ]);
    const [adminResult, clientResult] = results;

    if (adminResult.status === 'rejected') {
      console.error('Contact admin notification failed:', adminResult.reason);
      return NextResponse.json(
        { status: 'error', message: 'Server failed to send email. Please try again later.' },
        { status: 500 }
      );
    }

    if (clientResult.status === 'rejected') {
      console.error('Contact auto-responder failed:', clientResult.reason);
    }

    return NextResponse.json(
      { status: 'success', message: 'Message sent successfully!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Server failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
}