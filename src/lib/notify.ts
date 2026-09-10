import 'server-only';
import { getServiceClient } from '@/lib/auth-helpers';
import { sendPortalNotification, notifySafe, LEAD_NOTIFY_EMAIL } from '@/lib/mailer';

const money = (n: number) => 'R ' + n.toLocaleString('en-ZA', { minimumFractionDigits: 2 });
const dateZA = (d: string) =>
  new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });

async function contact(clientId: string) {
  const admin = getServiceClient();
  const { data } = await admin
    .from('profiles')
    .select('email, full_name')
    .eq('id', clientId)
    .maybeSingle();
  return data;
}

/** Client-facing portal notifications. Each is best-effort (never throws). */
export const notify = {
  contractToSign: (clientId: string, title: string) =>
    notifySafe(async () => {
      const c = await contact(clientId);
      if (!c?.email) return;
      await sendPortalNotification({
        to: c.email,
        name: c.full_name,
        subject: `Please sign: ${title}`,
        heading: 'A contract is ready for your signature',
        lines: [
          `We&rsquo;ve sent <strong>${title}</strong> to your portal.`,
          'Open it to review and sign &mdash; it takes about a minute, and you can draw or type your signature.',
        ],
        ctaLabel: 'Review & sign',
        ctaPath: '/dashboard/contracts',
      });
    }),

  contractExecuted: (clientId: string, title: string) =>
    notifySafe(async () => {
      const c = await contact(clientId);
      if (!c?.email) return;
      await sendPortalNotification({
        to: c.email,
        name: c.full_name,
        subject: `Signed & filed: ${title}`,
        heading: 'Your agreement is fully signed',
        lines: [
          `<strong>${title}</strong> has been countersigned by Touch Domain.`,
          'The final signed PDF, with the signature certificate, is in your portal and your project&rsquo;s file store.',
        ],
        ctaLabel: 'Download signed copy',
        ctaPath: '/dashboard/contracts',
      });
    }),

  invoiceIssued: (
    clientId: string,
    inv: { number: string; amountZar: number; dueDate: string; covers?: string | null }
  ) =>
    notifySafe(async () => {
      const c = await contact(clientId);
      if (!c?.email) return;
      await sendPortalNotification({
        to: c.email,
        name: c.full_name,
        subject: `Invoice ${inv.number} — ${money(inv.amountZar)}`,
        heading: `Invoice ${inv.number}`,
        lines: [
          `A new invoice for <strong>${money(inv.amountZar)}</strong> is on your portal${inv.covers ? ` (${inv.covers})` : ''}.`,
          `Payment is due by <strong>${dateZA(inv.dueDate)}</strong>. Banking details and the reference are on the PDF.`,
          'Paid by EFT or ATM deposit? Upload the slip against the invoice and we&rsquo;ll confirm it.',
        ],
        ctaLabel: 'View invoice',
        ctaPath: '/dashboard/invoices',
      });
    }),

  milestoneComplete: (clientId: string, milestoneTitle: string) =>
    notifySafe(async () => {
      const c = await contact(clientId);
      if (!c?.email) return;
      await sendPortalNotification({
        to: c.email,
        name: c.full_name,
        subject: `Milestone reached: ${milestoneTitle}`,
        heading: 'Progress update',
        lines: [`We&rsquo;ve marked <strong>${milestoneTitle}</strong> complete on your project.`],
        ctaLabel: 'See your dashboard',
        ctaPath: '/dashboard',
      });
    }),

  paymentConfirmed: (clientId: string, invoiceNumber: string) =>
    notifySafe(async () => {
      const c = await contact(clientId);
      if (!c?.email) return;
      await sendPortalNotification({
        to: c.email,
        name: c.full_name,
        subject: `Payment received — ${invoiceNumber}`,
        heading: 'Payment confirmed',
        lines: [`Thank you &mdash; we&rsquo;ve received and confirmed your payment for <strong>${invoiceNumber}</strong>.`],
        ctaLabel: 'View invoices',
        ctaPath: '/dashboard/invoices',
      });
    }),
};

/** Internal notifications to helper@touchdomain.co.za. */
export const notifyTeam = {
  onboardingSubmitted: (clientName: string, company: string | null) =>
    notifySafe(() =>
      sendPortalNotification({
        to: LEAD_NOTIFY_EMAIL,
        name: 'Team',
        subject: `Onboarding submitted — ${company || clientName}`,
        heading: 'Client onboarding submitted',
        lines: [`<strong>${clientName}${company ? ` (${company})` : ''}</strong> has submitted their onboarding questionnaire and it&rsquo;s ready to review.`],
        ctaLabel: 'Open admin',
        ctaPath: '/admin/projects',
      })
    ),

  paymentProofSubmitted: (clientName: string, invoiceNumber: string) =>
    notifySafe(() =>
      sendPortalNotification({
        to: LEAD_NOTIFY_EMAIL,
        name: 'Team',
        subject: `Proof of payment — ${invoiceNumber}`,
        heading: 'Proof of payment uploaded',
        lines: [`<strong>${clientName}</strong> uploaded proof of payment for <strong>${invoiceNumber}</strong>. Review it and update the invoice.`],
        ctaLabel: 'Review invoices',
        ctaPath: '/admin/invoices',
      })
    ),
};
