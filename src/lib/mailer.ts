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
