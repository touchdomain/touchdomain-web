import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.touchdomain.co.za';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The admin invoicing tool discussed earlier in this project (once
      // built) should live under a path like this — disallowed pre-emptively
      // so it's never indexed even if it ships before this file gets revisited.
      disallow: ['/admin', '/api/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
