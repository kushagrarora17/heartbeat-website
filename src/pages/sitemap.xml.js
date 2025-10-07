import { createFullSlug } from '../utils/slug.js';
import { SEO } from '../constants.js';
import { allEvents } from '../content/events/all-events.js';
import { allArticles } from '../content/articles/all-articles.js';

export async function GET() {
  // Generate sitemap for SEO
  const baseUrl = SEO.SITE_URL;
  const pages = [
    { url: '/', changefreq: 'weekly', priority: 1.0 },
    { url: '/events', changefreq: 'daily', priority: 0.9 },
    { url: '/articles', changefreq: 'weekly', priority: 0.8 },
  ];

  // Add individual event pages with SEO-friendly slugs
  allEvents.forEach(event => {
    pages.push({
      url: `/events/${createFullSlug(event.id, event.title)}`,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: event.publishDate,
    });
  });

  // Add individual article pages with SEO-friendly slugs
  allArticles.forEach(article => {
    pages.push({
      url: `/articles/${createFullSlug(article.id, article.title)}`,
      changefreq: 'monthly',
      priority: 0.6,
      lastmod: article.date
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${page.lastmod ? `
    <lastmod>${page.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

