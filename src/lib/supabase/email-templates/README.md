# Supabase Auth email templates (branding)

These are **not used by the app's code** — the portal's own invite/resend
emails (`sendPortalInvite` in `src/lib/mailer.ts`) already go out branded
through Touch Domain's own SMTP, independent of Supabase.

This folder is for the emails **Supabase itself** sends directly — which
happens whenever someone uses "Forgot password" on `/set-password`
(`supabase.auth.resetPasswordForEmail`), or if an admin manually triggers a
password reset from the Supabase Dashboard's Authentication → Users list.
Those go out through Supabase's own mailer with Supabase's default
templates and branding unless you replace them.

## How to apply

Supabase Dashboard → **Authentication → Email Templates**. Pick a template
(e.g. "Reset Password"), switch to the HTML source view, and paste the
matching file from this folder over the default content. Supabase's
`{{ .ConfirmationURL }}`, `{{ .SiteURL }}` etc. placeholders are already
wired into each file — don't change those.

- `reset-password.html` → the **Reset Password** template
- `invite.html` → the **Invite user** template
- `confirm-signup.html` → the **Confirm signup** template

## Also fix deliverability, not just branding

Supabase's own mail sending is rate-limited (a handful of emails per hour)
and comes from a shared Supabase sending domain, which is exactly the kind
of unfamiliar sender Outlook/Gmail are most likely to junk or drop — which
is the most likely reason these emails aren't reliably reaching clients at
`outlook.com` / `gmail.com` addresses.

Fix both branding **and** deliverability in one place: Supabase Dashboard →
**Project Settings → Authentication → SMTP Settings** → enable custom SMTP
and enter the *same* `SMTP_HOST` / `SMTP_USER` / `SMTP_PASSWORD` already set
on Vercel. Once that's on, every Supabase-sent auth email goes out through
Touch Domain's own mail server and domain reputation, not Supabase's.

## If the portal's own invite email isn't arriving

That one already uses your own SMTP (same as this), so the likely causes
are different:
1. Check the toast shown after "New client" / "Resend invite" — if it said
   *"Email unavailable — invite link copied to your clipboard"*, the send
   itself failed (check Vercel function logs for the real error) and the
   link needs to be sent manually.
2. If it said the email sent, check the client's spam folder — Outlook is
   aggressive about unfamiliar senders. Confirm `touchdomain.co.za` has
   proper SPF, DKIM and DMARC records for whichever mail server `SMTP_HOST`
   points at; missing/misaligned records are the #1 cause of transactional
   mail from a small custom domain landing in spam or being dropped
   silently by Outlook/Gmail.
