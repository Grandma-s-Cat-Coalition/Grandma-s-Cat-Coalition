import { writeFile, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { loadContent } from './lib/content.mjs';
import { renderAll, renderNewsDetail } from './lib/render.mjs';

// 1. Render every page from content/ — this is what makes Decap edits real.
const content = await loadContent('.');
const pages = renderAll(content);
for (const [slug, html] of Object.entries(pages)) await writeFile(`${slug}.html`, html);

// 2. One prerendered detail page per news post (Article structured data + SEO).
// Clean the dir first so a deleted post doesn't leave an orphan page.
await rm('news', { recursive: true, force: true });
await mkdir('news', { recursive: true });
const newsUrls = [];
for (const post of content.news) {
  await writeFile(`news/${post.slug}.html`, renderNewsDetail(content, post));
  newsUrls.push(`news/${post.slug}`);
}

// 3. robots + sitemap
await mkdir('public', { recursive: true });
await writeFile('public/robots.txt', 'User-agent: *\nAllow: /\nSitemap: https://grandmascatcoalition.org/sitemap.xml\n');
const urls = [...Object.keys(pages).filter(r => r !== '404'), ...newsUrls];
await writeFile('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(r => `<url><loc>https://grandmascatcoalition.org/${r === 'index' ? '' : r}</loc></url>`).join('')}</urlset>`);

// 4. Optimize any CMS-uploaded images, then bundle.
execFileSync(process.execPath, ['scripts/optimize-images.mjs'], { stdio: 'inherit' });
execFileSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], { stdio: 'inherit' });
