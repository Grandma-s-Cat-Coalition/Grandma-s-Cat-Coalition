import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { renderCatCards, renderCatDetail } from '../src/cats.js';
import { loadContent, md, loadJson, parseFrontMatter } from '../scripts/lib/content.mjs';
import { renderHome, renderAbout, renderDonate, renderNews, renderNewsDetail, renderEvents, renderFoster, renderHappyTails, renderCatDetail as renderCatDetailPage, renderers } from '../scripts/lib/render.mjs';

const routes = ['index', 'adopt', 'foster', 'volunteer', 'donate', 'tnr', 'about', 'found-a-cat', 'happy-tails', 'news', 'events', 'contact', 'meet-cat', 'privacy', 'terms', '404'];
const content = await loadContent('.');
const settings = content.settings;

test('all 16 routes exist with unique metadata', async () => {
  const titles = new Set();
  for (const r of routes) {
    const h = await readFile(`${r}.html`, 'utf8');
    assert.match(h, /<meta name="description"/);
    assert.match(h, /rel="canonical"/);
    assert.match(h, /property="og:image"/);
    const t = h.match(/<title>(.*?)<\/title>/)?.[1];
    assert.ok(t, `${r} has a title`);
    assert.ok(!titles.has(t), `${r} title is unique`);
    titles.add(t);
  }
});

test('structured data parses as JSON on every page', async () => {
  for (const r of routes) {
    const h = await readFile(`${r}.html`, 'utf8');
    const blocks = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.ok(blocks.length, `${r} has JSON-LD`);
    for (const [, json] of blocks) assert.doesNotThrow(() => JSON.parse(json), `${r} JSON-LD parses`);
  }
});

test('about page JSON-LD uses a PostalAddress object', async () => {
  const h = await readFile('about.html', 'utf8');
  const ld = JSON.parse(h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(ld.address['@type'], 'PostalAddress');
  assert.ok(ld.address.streetAddress);
});

test('news detail pages carry Article JSON-LD; events carry Event JSON-LD', async () => {
  // News detail page (built into news/<slug>.html)
  const post = { slug: 'demo', title: 'Demo Post', date: '2026-05-01', cover: '/images/brand/grandma-and-cat.jpg', cover_alt: 'x', excerpt: 'e', bodyHtml: '<p>b</p>', tags: ['news'] };
  const detail = renderNewsDetail({ ...content, news: [post] }, post);
  const ld = JSON.parse(detail.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const articleLd = ld.find(o => o['@type'] === 'Article');
  assert.ok(articleLd, 'news detail has Article');
  assert.equal(articleLd.mainEntityOfPage, 'https://grandmascatcoalition.org/news/demo.html', 'Article points at the slug URL');
  // Events page
  const events = renderEvents({ ...content, events: [{ slug: 'e', title: 'Adoption Day', start: '2099-06-01', end: '2099-06-01', location: 'Town Hall', bodyHtml: '<p>e</p>' }] }, new Date('2026-01-01'));
  const eld = JSON.parse(events.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.ok(eld.some(o => o['@type'] === 'Event'), 'events page has Event');
});

test('news index cards link to detail pages', () => {
  const post = { slug: 'linky', title: 'Linky', date: '2026-05-01', cover: '/x.jpg', cover_alt: 'x', excerpt: 'e', bodyHtml: '<p>b</p>' };
  assert.match(renderNews({ ...content, news: [post] }), /href="\/news\/linky\.html"/);
  assert.match(renderHome({ ...content, news: [post] }), /href="\/news\/linky\.html"/);
});

test('design tokens exist and components use variables only', async () => {
  const tokens = await readFile('src/tokens.css', 'utf8');
  for (const t of ['--plum-900:#520446', '--sage-900:#215204', '--cream:#FFFFFE', '--gold:#E9967A', 'Kaushan Script', 'Fraunces', 'Lato']) assert.ok(tokens.includes(t), `tokens.css has ${t}`);
  const css = await readFile('src/styles.css', 'utf8');
  assert.match(css, /@import '\.\/tokens\.css'/);
  assert.doesNotMatch(css.replace(/@import url\([^)]*\)/, ''), /#[0-9a-fA-F]{3,8}\b/, 'styles.css has no raw hex outside tokens');
  assert.match(css, /\.button\.donate\{background:var\(--gold\)/);
});

test('gold treatment is reserved for Donate links, and home hero has a gold Donate CTA', async () => {
  for (const r of routes) {
    const h = await readFile(`${r}.html`, 'utf8');
    for (const tag of h.match(/<a class="button donate"[^>]*>/g) || []) assert.match(tag, /href="\/donate\.html"/, `${r}: gold button targets donate`);
  }
  const home = await readFile('index.html', 'utf8');
  const heroSection = home.match(/<section class="hero">[\s\S]*?<\/section>/)[0];
  assert.match(heroSection, /class="button donate"[^>]*href="\/donate\.html"/, 'home hero has a gold Donate CTA');
});

test('footer carries settings-driven disclosure and mobile bar has quick actions', async () => {
  const h = await readFile('index.html', 'utf8');
  assert.match(h, /501\(c\)\(3\)/);
  assert.doesNotMatch(h, /EIN /);
  assert.match(h, /class="mobile-bar"[^>]*>[\s\S]*?Donate[\s\S]*?Adopt[\s\S]*?Call/);
});

test('CMS settings drive the build (change settings → change output)', () => {
  const modified = { ...content, settings: { ...settings, heroTitle: 'TEST_HERO_TITLE_XYZ', ein: '12-3456789', impact: { tnr: 741, adopted: 852, foster: 963 } } };
  const html = renderHome(modified);
  assert.ok(html.includes('TEST_HERO_TITLE_XYZ'), 'hero title reaches the page');
  for (const x of ['EIN 12-3456789', '741', '852', '963']) assert.ok(!html.includes(x), `removed setting ${x} is not rendered`);
});

test('home omits impact counters until real numbers are available', () => {
  const html = renderHome({ ...content, settings: { ...settings, impact: { tnr: 741, adopted: 852, foster: 963 } } });
  assert.doesNotMatch(html, /Our impact/);
  assert.doesNotMatch(html, /Cats TNR'd|Cats adopted|In foster care/);
});

test('hero supports a self-hosted video only after a local asset is configured', () => {
  const video = renderHome({ ...content, settings: { ...settings, heroVideo: '/videos/hero.mp4' } });
  assert.match(video, /<video class="hero-photo" autoplay loop muted playsinline/);
  assert.match(video, /poster="\/images\/brand\/grandma-and-cat\.jpg"/);
  assert.match(video, /<source src="\/videos\/hero\.mp4" type="video\/mp4">/);
  const remote = renderHome({ ...content, settings: { ...settings, heroVideo: 'https://blobby.wsimg.com/getty/videos/2207029593' } });
  assert.doesNotMatch(remote, /<video/);
  assert.match(remote, /<img class="hero-photo"/);
});

test('every configured CMS field reaches output (no silent drops)', () => {
  // Board: photo + photo_alt + bio
  const about = renderAbout({ ...content, board: [{ name: 'B', role: 'R', photo: '/b.jpg', photo_alt: 'BOARD_ALT_XYZ', bodyHtml: '<p>BIO_XYZ</p>' }] });
  assert.ok(about.includes('/b.jpg') && about.includes('BOARD_ALT_XYZ') && about.includes('BIO_XYZ'), 'board photo/alt/bio render');
  // News: tags on the detail page
  const post = { slug: 'p', title: 'T', date: '2026-01-01', cover: '/c.jpg', cover_alt: 'COVER_ALT_XYZ', excerpt: 'e', bodyHtml: '<p>b</p>', tags: ['TAG_XYZ'] };
  const detail = renderNewsDetail(content, post);
  assert.ok(detail.includes('TAG_XYZ') && detail.includes('COVER_ALT_XYZ'), 'news tags + cover_alt render');
  // Events: cover + cover_alt
  const events = renderEvents({ ...content, events: [{ slug: 'e', title: 'T', start: '2099-01-01', cover: '/ec.jpg', cover_alt: 'EVENT_ALT_XYZ', bodyHtml: '<p>b</p>' }] }, new Date('2026-01-01'));
  assert.ok(events.includes('/ec.jpg') && events.includes('EVENT_ALT_XYZ'), 'event cover/alt render');
  // Happy tails: photos + photo_alt
  const tails = renderHappyTails({ ...content, happyTails: [{ slug: 't', title: 'T', cat_name: 'Cat', date: '2026-01-01', photos: ['/t1.jpg'], photo_alt: 'TAIL_ALT_XYZ', bodyHtml: '<p>b</p>' }] });
  assert.ok(tails.includes('/t1.jpg') && tails.includes('TAIL_ALT_XYZ'), 'happy-tail photos/alt render');
  // Page markdown widget renders as rich text, not escaped source
  const foster = renderFoster({ ...content, pages: { ...content.pages, foster: { title: 'T', intro: 'i', body: '**BOLD_XYZ**' } } });
  assert.match(foster, /<strong>BOLD_XYZ<\/strong>/, 'page body markdown renders rich text');
});

test('CMS collections drive the build: news, board, faq, events', () => {
  const post = { slug: 'test', title: 'TEST_POST_TITLE', date: '2099-01-01', cover: '/images/brand/grandma-and-cat.jpg', cover_alt: 'x', excerpt: 'TEST_EXCERPT', bodyHtml: '<p>b</p>' };
  const withPost = { ...content, news: [post, ...content.news] };
  assert.ok(renderNews(withPost).includes('TEST_POST_TITLE'), 'new news file appears on news page');
  assert.ok(renderHome(withPost).includes('TEST_POST_TITLE'), 'new news file appears in home latest-3');
  const withFaq = { ...content, fosterFaq: [{ question: 'TEST_QUESTION?', answer: 'TEST_ANSWER' }] };
  assert.ok(renderFoster(withFaq).includes('TEST_QUESTION?'), 'FAQ renders from content/faq');
  const ev = t => ({ slug: t, title: t, start: t === 'FUTURE_EVENT' ? '2099-06-01' : '2000-06-01', location: 'Town', bodyHtml: '<p>e</p>' });
  const events = renderEvents({ ...content, events: [ev('PAST_EVENT'), ev('FUTURE_EVENT')] }, new Date('2026-01-01'));
  assert.ok(events.indexOf('FUTURE_EVENT') < events.indexOf('past-events'), 'upcoming events render first');
  assert.ok(events.indexOf('PAST_EVENT') > events.indexOf('past-events'), 'past events are collapsed');
});

test('donate page reads zeffyUrl from settings', () => {
  const real = renderDonate({ ...content, settings: { ...settings, zeffyUrl: 'https://www.zeffy.com/embed/donation-form/test', paypalUrl: 'https://paypal.me/test' } });
  assert.match(real, /<iframe class="zeffy-embed"[^>]*src="https:\/\/www\.zeffy\.com/);
  assert.ok(real.includes('https://paypal.me/test'), 'PayPal link renders when set');
  const placeholder = renderDonate({ ...content, settings: { ...settings, zeffyUrl: 'ZEFFY_FORM_URL' } });
  assert.doesNotMatch(placeholder, /<iframe/);
  assert.ok(placeholder.includes('mail a check'), 'fallback renders for placeholder');
});

test('CMS Markdown cannot inject scripts or javascript: URLs (stored XSS)', () => {
  const hostile = md('<img src=x onerror="globalThis.PWN=1"> and [click](javascript:alert(1)) and [ok](https://example.com)');
  assert.ok(!/<img/i.test(hostile), 'raw img tag is escaped');
  assert.ok(!/<[a-z][^>]*\son\w+=/i.test(hostile), 'no live element carries an event handler');
  assert.ok(!/href="javascript:/i.test(hostile), 'javascript: URL rejected');
  assert.match(hostile, /href="https:\/\/example\.com"/, 'safe https link preserved');
  // The same payload through a real content pipeline (collection body → bodyHtml → rendered page)
  const post = { slug: 'x', title: 'X', date: '2026-01-01', cover: '/c.jpg', cover_alt: 'a', excerpt: 'e', bodyHtml: md('<script>globalThis.PWN=1</script>'), tags: [] };
  assert.ok(!renderNewsDetail(content, post).includes('<script>globalThis.PWN'), 'hostile body does not reach the page as a live script');
});

test('malformed CMS JSON fails the build; missing file falls back', async () => {
  await assert.rejects(loadJson('tests/fixtures/malformed.json'), /Malformed JSON/, 'malformed JSON throws');
  assert.equal(await loadJson('tests/fixtures/does-not-exist.json', 'FALLBACK'), 'FALLBACK', 'missing file returns fallback');
});

test('loadContent propagates a malformed page file (does not swallow it)', async () => {
  // Regression: the pages loop must not sit inside the missing-dir try/catch.
  await assert.rejects(loadContent('tests/fixtures/malformed-root'), /Malformed JSON/);
});

test('front-matter parses block-list fields (photos, tags)', () => {
  const { data } = parseFrontMatter('---\ntitle: T\nphotos:\n  - /a.jpg\n  - /b.jpg\ntags: [news, update]\n---\nbody');
  assert.deepEqual(data.photos, ['/a.jpg', '/b.jpg']);
  assert.deepEqual(data.tags, ['news', 'update']);
});

test('ShelterLuv success renders escaped cards', () => {
  const cats = [{ id: 'GCCI-A-1', name: 'Mia <script>alert(1)</script>', age: '2y', sex: 'F', breed: 'DSH "tabby"', description: '<img onerror=x>', photo: 'javascript:alert(1)', profileUrl: 'https://shelterluv.com/mia' }];
  const html = renderCatCards(cats, 'https://example.com/adopt');
  assert.match(html, /<article class="card">/);
  assert.ok(!html.includes('<script>'), 'names are escaped');
  assert.ok(!html.includes('<img onerror'), 'descriptions are escaped');
  assert.ok(!html.includes('javascript:'), 'non-http URLs are rejected');
  assert.ok(html.includes('/meet-cat.html?id='), 'card links to local detail page when the API has an id');
});

test('cat detail page and renderer expose structured ShelterLuv facts safely', () => {
  const page = renderCatDetailPage(content);
  assert.match(page, /data-cat-detail/);
  const html = renderCatDetail({
    id: 'GCCI-A-1',
    animalId: 'GCCI-A-1',
    name: 'Mia <script>alert(1)</script>',
    age: '0Y/3M/1W',
    sex: 'Female',
    breed: 'Domestic Short Hair',
    weight: '3 lb',
    adoptionFee: '$100',
    intakeDate: '2026-09-01',
    description: '<img onerror=x>',
    photo: 'javascript:alert(1)',
    profileUrl: 'https://shelterluv.com/mia',
  }, 'https://example.com/adopt');
  for (const text of ['Animal ID', 'GCCI-A-1', 'Breed', 'Domestic Short Hair', 'Sex', 'Female', 'Weight', '3 lb', 'Age', '0Y/3M/1W', 'Adoption Fee', '$100', 'Intake Date', '2026-09-01']) assert.ok(html.includes(text));
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img onerror'));
  assert.ok(!html.includes('javascript:'));
  assert.ok(html.includes('https://shelterluv.com/mia'), 'valid ShelterLuv application URL kept');
});

test('mobile menu toggles aria-expanded and updates its label', async () => {
  const js = await readFile('src/main.js', 'utf8');
  assert.match(js, /classList\.toggle\('open'\)/);
  assert.match(js, /setAttribute\('aria-expanded', String\(open\)\)/);
  assert.match(js, /aria-label', open \? 'Close menu' : 'Open menu'/);
});

test('all forms share the JS submit path with honeypot and status', async () => {
  for (const [file, action] of [['contact.html', '/api/contact'], ['tnr.html', '/api/tnr-request'], ['index.html', '/api/newsletter']]) {
    const h = await readFile(file, 'utf8');
    const form = h.match(new RegExp(`<form[^>]*action="${action}"[^>]*>[\\s\\S]*?</form>`))?.[0];
    assert.ok(form, `${file} has ${action} form`);
    assert.match(form.match(/<form[^>]*>/)[0], /data-api/, `${action} uses JS submit path`);
    assert.match(form, /name="website"/, `${action} has honeypot`);
    assert.match(form, /role="status"/, `${action} has status output`);
  }
  const f = await readFile('api/_forms.js', 'utf8');
  assert.match(f, /CONTACT_RECIPIENT_EMAIL/);
  assert.doesNotMatch(f, /req\.body\.to/);
});

test('ShelterLuv API has cache; client falls back to embed widget, then notice', async () => {
  assert.match(await readFile('api/shelterluv.js', 'utf8'), /s-maxage=600/);
  assert.match(await readFile('api/shelterluv/[id].js', 'utf8'), /s-maxage=600/);
  const js = await readFile('src/main.js', 'utf8');
  assert.match(js, /shelterluv_embed\.js/, 'adopt page mounts the ShelterLuv embed when the API is unavailable');
  assert.match(js, /gid: 100003517/, 'embed uses the GCC shelter id');
  assert.match(js, /cat list is taking a catnap/, 'last-resort notice still present');
  assert.match(js, /if \(limit\) target\.innerHTML = teaser\(\)/, 'homepage teaser links to the adopt page instead of hosting the iframe');
  assert.match(js, /teaser = \(\) => .*href="\/adopt\.html"/, 'teaser points at the adopt page');
});

test('SHELTERLUV_API_KEY is optional for deployment', async () => {
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const env = { ...process.env, RESEND_API_KEY: 'k', FORM_FROM_EMAIL: 'a@b.org', CONTACT_RECIPIENT_EMAIL: 'c@d.org', RESEND_AUDIENCE_ID: 'aud', OAUTH_GITHUB_CLIENT_ID: 'id', OAUTH_GITHUB_CLIENT_SECRET: 's', SITE_URL: 'https://x.org' };
  delete env.SHELTERLUV_API_KEY;
  await promisify(execFile)(process.execPath, ['scripts/check-deployment-env.mjs'], { env });
  delete env.RESEND_API_KEY;
  await assert.rejects(promisify(execFile)(process.execPath, ['scripts/check-deployment-env.mjs'], { env }), /RESEND_API_KEY/);
});

test('CMS image fields require alt text', async () => {
  const y = await readFile('admin/config.yml', 'utf8');
  for (const x of ['photo_alt', 'cover_alt']) assert.match(y, new RegExp(x));
  assert.match(y, /editorial_workflow/);
  assert.match(y, /repo: Grandma-s-Cat-Coalition\/Grandma-s-Cat-Coalition/);
});

test('all img elements have alt and referenced local images exist in public/', async () => {
  for (const file of await readdir('.')) {
    if (!file.endsWith('.html')) continue;
    const h = await readFile(file, 'utf8');
    for (const tag of h.match(/<img\b[^>]*>/g) || []) {
      assert.match(tag, /\balt=/, `${file}: ${tag} has alt`);
      const src = tag.match(/src="([^"]+)"/)?.[1];
      if (src?.startsWith('/images/')) await access(`public${src}`).catch(() => assert.fail(`${file} references missing image ${src}`));
    }
  }
});

test('build invokes image optimization', async () => {
  assert.match(await readFile('scripts/build.mjs', 'utf8'), /optimize-images\.mjs/);
});

test('every route has a renderer fed by loaded content', () => {
  for (const r of routes) assert.ok(renderers[r], `renderer for ${r}`);
});
