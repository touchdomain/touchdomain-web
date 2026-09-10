// Absolute base URL for links generated server-side (auth invite emails, etc).
// Set NEXT_PUBLIC_SITE_URL in every environment — locally it must match the
// dev port, e.g. http://localhost:3001.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://www.touchdomain.co.za')
).replace(/\/$/, '');
