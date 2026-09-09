// Shared email addressing for the API routes, PDF generators, and the
// branded email template.
//
// CUSTOMER_CONTACT_EMAIL is what customers SEE and REPLY TO on anything we
// send them (auto-responder footer + reply-to, quote/order PDF footers). It
// is deliberately kept separate from ADMIN_EMAIL — the inbox where leads are
// delivered — so the two can differ without touching customer-facing copy.

export const CUSTOMER_CONTACT_EMAIL = 'helper@touchdomain.co.za';
