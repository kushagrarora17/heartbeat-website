import { SEO } from '../constants.js';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /thank-you

Sitemap: ${SEO.SITE_URL}/sitemap.xml
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}


