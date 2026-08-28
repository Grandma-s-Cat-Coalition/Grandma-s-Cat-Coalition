import { writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { loadContent } from './lib/content.mjs';
import { renderAll } from './lib/render.mjs';

// 1. Render every page from content/ — this is what makes Decap edits real.
const content = await loadContent('.');
const pages = renderAll(content);
for (const [slug, html] of Object.entries(pages)) await writeFile(`${slug}.html`, html);

// 2. robots + sitemap
await mkdir('public', { recursive: true });
await writeFile('public/robots.txt', 'User-agent: *\nAllow: /\nSitemap: https://grandmascatcoalition.org/sitemap.xml\n');
await writeFile('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(pages).filter(r => r !== '404').map(r => `<url><loc>https://grandmascatcoalition.org/${r === 'index' ? '' : r}</loc></url>`).join('')}</urlset>`);

// 3. Optimize any CMS-uploaded images, then bundle.
execFileSync(process.execPath, ['scripts/optimize-images.mjs'], { stdio: 'inherit' });
execFileSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], { stdio: 'inherit' });
