# Touch Domain — Marketing Site

Next.js 14 (App Router) marketing and lead-generation site for Touch Domain,
a South African digital studio (branding, web design, digital content,
hosting/email, and custom apps).

- **Framework:** Next.js 14 · React 18 · TypeScript
- **Styling:** Tailwind CSS 3
- **Email:** Nodemailer (SMTP) — all lead forms send mail server-side
- **PDF:** `pdf-lib` — quote and order estimates are generated on the server

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the SMTP values
npm run dev                   # http://localhost:3000
```

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build (run `build` first) |
| `npm run lint` | `next lint` *(currently broken — ESLint 10 vs `eslint-config-next` 16 mismatch; `next build` still type-checks)* |
| `npm run stylelint` | Lint CSS |

## Environment variables

The five API routes under `src/app/api/` (`contact`, `submit-quote`,
`submit-order`, `submit-review`, `book-consultation`) all build a Nodemailer
SMTP transport from these. **If they are not set, every lead form returns
HTTP 500 and shows the visitor an error** — nothing is queued or retried.

Set them in `.env.local` for local development and in the hosting provider's
environment settings for production. See `.env.example` for a template.

| Variable | Required | Default | Notes |
|---|---|---|---|
| `SMTP_HOST` | **Yes** | — | SMTP server hostname |
| `SMTP_USER` | **Yes** | — | SMTP username. Also used as the `From:` address on every outgoing mail, so it must be a real, send-authorised mailbox on your domain. |
| `SMTP_PASSWORD` | **Yes** | — | SMTP password |
| `SMTP_PORT` | No | `465` | The transport is hard-coded to `secure: true`, so this **must be an implicit-TLS/SSL port** (typically `465`). Plain / STARTTLS ports will not connect. |
| `APP_LOGO_URL` | No | `https://www.touchdomain.co.za/branding/touch-domain-logo-white.png` | Override for the white logo in branded HTML emails (`src/utils/emailTemplate.ts`). Leave unset. If set, it **must** use the `www` host — the apex 308-redirects and email image proxies (Gmail) don't follow redirects, so the logo renders as broken alt text. |

Lead notifications and the customer-facing contact address are **not**
environment variables — both are `helper@touchdomain.co.za`, hardcoded in
`src/lib/mailer.ts` (`LEAD_NOTIFY_EMAIL` / `CUSTOMER_CONTACT_EMAIL`).
`admin@touchdomain.co.za` is reserved for account-security actions and must
never receive form traffic.

None of these are exposed to the browser (no `NEXT_PUBLIC_` prefix) — they
are only read inside server-side route handlers.

### Verifying email after deploy

1. Set all `SMTP_*` vars in the production environment.
2. Submit the contact form once with a real address.
3. Confirm the notification lands in `helper@touchdomain.co.za` and the
   auto-responder lands in the address you submitted.
4. A `500 "Server failed to send email"` response means the SMTP
   credentials or port are wrong.

## Deployment notes

- All pages are statically prerendered except the 5 `api/*` route handlers.
- `next/font` self-hosts Roboto at build time — the build needs outbound
  network access to `fonts.googleapis.com` (metadata only; the font is then
  served from `/_next/static`).
- `robots.txt` and `sitemap.xml` are generated (`src/app/robots.ts`,
  `src/app/sitemap.ts`); `SITE_URL` is set in `src/app/layout.tsx` and
  `src/app/sitemap.ts`.
- FontAwesome loads from a kit script (`kit.fontawesome.com`) via
  `next/script`; there is also a partially-adopted inline-SVG icon set in
  `src/components/Icon.tsx`.

## Project layout

```
src/
  app/
    layout.tsx            Root layout: fonts, metadata, JSON-LD, nav + footer
    <route>/page.tsx      Server wrapper (holds per-page metadata)
    <route>/*Client.tsx   Client component with the actual UI
    api/*/route.ts        Lead-form handlers (Nodemailer + pdf-lib)
    faq/faqData.ts        FAQ content (plain module, shared server + client)
  components/             Nav, Footer, modals, forms, pricing cards, etc.
  data/caseStudies.ts     Portfolio entries
  utils/                  emailTemplate, generateQuotePDF, generateOrderPDF
```
