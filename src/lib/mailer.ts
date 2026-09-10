// Shared email addressing for the API routes, PDF generators, and the
// branded email template.
//
// Both addresses currently resolve to helper@touchdomain.co.za — the only
// mailbox that touches customer traffic. admin@touchdomain.co.za is
// reserved for account-security / sensitive actions and must NOT receive
// form submissions or appear in customer-facing copy. Change them here if
// that ever needs to split.

// What customers SEE and REPLY TO on anything we send them (auto-responder
// footer + reply-to, quote/order PDF footers).
export const CUSTOMER_CONTACT_EMAIL = 'helper@touchdomain.co.za';

// Where the internal copy of every form submission (contact, consultation,
// quote, order, review) is delivered.
export const LEAD_NOTIFY_EMAIL = 'helper@touchdomain.co.za';

// ── Shared transport + portal invite email ──────────────────────────
import 'server-only';
import nodemailer from 'nodemailer';
import { generateBrandedEmail } from '@/utils/emailTemplate';

export function getMailTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    throw new Error('SMTP is not configured (SMTP_HOST / SMTP_USER / SMTP_PASSWORD)');
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
}

/**
 * Emails a portal invite / set-password link. `link` is a Supabase
 * action_link from auth.admin.generateLink().
 */
export async function sendPortalInvite(opts: {
  to: string;
  name: string;
  link: string;
  role: 'admin' | 'client';
}) {
  const { to, name, link, role } = opts;
  const heading = role === 'admin' ? 'Your Touch Domain staff access' : 'Your Touch Domain client portal';
  const intro =
    role === 'admin'
      ? 'You have been given staff access to the Touch Domain portal.'
      : 'Your client portal is ready — this is where you will track your project, complete onboarding, upload assets, and view invoices.';

  const html = generateBrandedEmail(
    heading,
    `
      <p>Hi ${name || 'there'},</p>
      <p>${intro}</p>
      <p>Click below to set your password and sign in. This link expires in 24 hours.</p>
      <p style="margin:28px 0;">
        <a href="${link}" style="background:#452c63;color:#fff;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:600;display:inline-block;">
          Set my password
        </a>
      </p>
      <p style="font-size:13px;color:#666;">If the button doesn't work, copy this link into your browser:<br/>
        <span style="word-break:break-all;">${link}</span>
      </p>
      <p>— Your Helper at Touch Domain</p>
    `
  );

  await getMailTransport().sendMail({
    from: `"Touch Domain" <${process.env.SMTP_USER}>`,
    replyTo: CUSTOMER_CONTACT_EMAIL,
    to,
    subject: heading,
    html,
    text: `${intro}\n\nSet your password: ${link}\n\n(This link expires in 24 hours.)`,
  });
}
