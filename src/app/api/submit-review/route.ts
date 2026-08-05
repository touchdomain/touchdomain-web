import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateBrandedEmail } from './../../../utils/emailTemplate';

const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_EMAIL || 'helper@touchdomain.co.za';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clientName,
      clientEmail,
      businessName,
      projectType,
      rating,
      outcome,
      testimonial,
      consentToPublish,
      consentToCaseStudy,
      website, // honeypot
    } = body;

    // Honeypot check — silently report success without sending mail or doing any work.
    if (website) {
      return NextResponse.json({ status: 'success', message: 'Thank you for your feedback!' }, { status: 200 });
    }

    if (!clientName || !clientEmail || !testimonial) {
      return NextResponse.json({ status: 'error', message: 'Name, email, and a testimonial are required.' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });

    // 1. Email to Admin — this is a moderation queue, not an auto-publish. Every
    // review needs a human read before it goes anywhere near the live site.
    const adminMailOptions = {
      from: `"Touch Domain Reviews" <${process.env.SMTP_USER}>`,
      replyTo: clientEmail,
      to: ADMIN_NOTIFY_EMAIL,
      subject: `New Review Submitted: ${clientName}${businessName ? ` (${businessName})` : ''}`,
      text: `
New client review received — review before publishing.

Name: ${clientName}
Business: ${businessName || 'Not provided'}
Email: ${clientEmail}
Project Type: ${projectType || 'Not specified'}
Rating: ${rating || 'Not provided'} / 5

Outcome / Result:
${outcome || 'Not provided'}

Testimonial:
${testimonial}

Consent to publish name/quote on website: ${consentToPublish ? 'YES' : 'NO'}
Consent to be featured as a full case study: ${consentToCaseStudy ? 'YES' : 'NO'}
      `,
    };

    // 2. Thank-you email to the client
    const clientMessageHTML = `
        <p>Hi ${clientName},</p>
        <p>Thank you — genuinely. Taking the time to write this means a lot, and it helps other businesses trust us the same way you did.</p>
        <p>We've received your feedback and, with your permission, we'll be featuring it on our site.</p>
        <br/>
        <p>Appreciate you,</p>
        <p><strong>The Touch Domain Team</strong><br/>
        <a href="mailto:${ADMIN_NOTIFY_EMAIL}" style="color: #9972ab;">${ADMIN_NOTIFY_EMAIL}</a></p>
    `;
    const finalBrandedHTML = generateBrandedEmail('Thank You For Your Feedback', clientMessageHTML);

    const clientMailOptions = {
      from: `"Touch Domain" <${process.env.SMTP_USER}>`,
      to: clientEmail,
      subject: `Thank you for your feedback`,
      text: `Hi ${clientName},\n\nThank you — genuinely. Taking the time to write this means a lot, and it helps other businesses trust us the same way you did.\n\nWe've received your feedback and, with your permission, we'll be featuring it on our site.\n\nAppreciate you,\nThe Touch Domain Team`,
      html: finalBrandedHTML,
    };

    // Only the admin leg can fail the request — that's the actual review.
    const [adminResult, clientResult] = await Promise.allSettled([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(clientMailOptions),
    ]);

    if (adminResult.status === 'rejected') {
      console.error('Review admin notification failed:', adminResult.reason);
      return NextResponse.json({ status: 'error', message: 'Failed to submit review. Please try again.' }, { status: 500 });
    }

    if (clientResult.status === 'rejected') {
      console.error('Review thank-you email failed:', clientResult.reason);
    }

    return NextResponse.json({ status: 'success', message: 'Thank you for your feedback!' }, { status: 200 });

  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to submit review. Please try again.' }, { status: 500 });
  }
}
