import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { renderCatCards } from '../src/cats.js';
import { loadContent } from '../scripts/lib/content.mjs';
import { renderHome, renderAbout, renderDonate, renderNews, renderEvents, renderFoster, renderers } from '../scripts/lib/render.mjs';

const routes = ['index', 'adopt', 'foster', 'volunteer', 'donate', 'tnr', 'about', 'found-a-cat', 'happy-tails', 'news', 'events', 'contact', 'privacy', 'terms', '404'];
const content = await loadContent('.');
const settings = content.settings;

test('all 15 routes exist with unique metadata', async () => {
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

test('design tokens exist and components use variables only', async () => {
  const tokens = await readFile('src/tokens.css', 'utf8');
  for (const t of ['--plum-900:#3E1A52', '--plum-700:#5B2C6F', '--sage-700:#6E7F4C', '--cream:#F6F3EA', '--gold:#D9A93A', 'Kaushan Script', 'Fraunces', 'Lato']) assert.ok(tokens.includes(t), `tokens.css has ${t}`);
  const css = await readFile('src/styles.css', 'utf8');
  assert.match(css, /@import '\.\/tokens\.css'/);
  assert.doesNotMatch(css.replace(/@import url\([^)]*\)/, ''), /#[0-9a-fA-F]{3,8}\b/, 'styles.css has no raw hex outside tokens');
  assert.match(css, /\.button\.donate\{background:var\(--gold\)/);
});

test('every screen has exactly one gold Donate button', async () => {
  for (const r of routes) {
    const h = await readFile(`${r}.html`, 'utf8');
    const gold = h.match(/class="button donate"/g) || [];
    assert.equal(gold.length, 1, `${r} has exactly one nav gold Donate`);
  }
});

test('footer carries settings-driven disclosure and mobile bar has quick actions', async () => {
  const h = await readFile('index.html', 'utf8');
  assert.match(h, /501\(c\)\(3\)/);
  assert.ok(h.includes(`EIN ${settings.ein}`));
  assert.match(h, /class="mobile-bar"[^>]*>[\s\S]*?Donate[\s\S]*?Adopt[\s\S]*?Call/);
});

test('CMS settings drive the build (change settings → change output)', () => {
  const modified = { ...content, settings: { ...settings, heroTitle: 'TEST_HERO_TITLE_XYZ', ein: '12-3456789', impact: { tnr: 741, adopted: 852, foster: 963 } } };
  const html = renderHome(modified);
  for (const x of ['TEST_HERO_TITLE_XYZ', 'EIN 12-3456789', '741', '852', '963']) assert.ok(html.includes(x), `settings value ${x} reaches the page`);
});

test('CMS collections drive the build: news, board, faq, events', () => {
  const post = { slug: 'test', title: 'TEST_POST_TITLE', date: '2099-01-01', cover: '/images/brand/grandma-and-cat.jpg', cover_alt: 'x', excerpt: 'TEST_EXCERPT', bodyHtml: '<p>b</p>' };
  const withPost = { ...content, news: [post, ...content.news] };
  assert.ok(renderNews(withPost).includes('TEST_POST_TITLE'), 'new news file appears on news page');
  assert.ok(renderHome(withPost).includes('TEST_POST_TITLE'), 'new news file appears in home latest-3');
  const withBoard = { ...content, board: [{ name: 'TEST_MEMBER', role: 'Treasurer', photo: '/x.jpg', photo_alt: 'x', bodyHtml: '<p>bio</p>' }] };
  assert.ok(renderAbout(withBoard).includes('TEST_MEMBER'), 'board members render from content/board');
  const withFaq = { ...content, fosterFaq: [{ question: 'TEST_QUESTION?', answer: 'TEST_ANSWER' }] };
  assert.ok(renderFoster(withFaq).includes('TEST_QUESTION?'), 'FAQ renders from content/faq');
  const ev = t => ({ slug: t, title: t, start: t === 'FUTURE_EVENT' ? '2099-06-01' : '2000-06-01', location: 'Town', bodyHtml: '<p>e</p>' });
  const events = renderEvents({ ...content, events: [ev('PAST_EVENT'), ev('FUTURE_EVENT')] }, new Date('2026-01-01'));
  assert.ok(events.indexOf('FUTURE_EVENT') < events.indexOf('past-events'), 'upcoming events render first');
  assert.ok(events.indexOf('PAST_EVENT') > events.indexOf('past-events'), 'past events are collapsed');
});

test('CMS page files drive intro/body copy', () => {
  const withPage = { ...content, pages: { ...content.pages, foster: { title: 'TEST_TITLE', intro: 'TEST_INTRO', body: 'TEST_BODY' } } };
  const html = renderFoster(withPage);
  for (const x of ['TEST_TITLE', 'TEST_INTRO', 'TEST_BODY']) assert.ok(html.includes(x));
});

test('donate page reads zeffyUrl from settings', () => {
  const real = renderDonate({ ...content, settings: { ...settings, zeffyUrl: 'https://www.zeffy.com/embed/donation-form/test', paypalUrl: 'https://paypal.me/test' } });
  assert.match(real, /<iframe class="zeffy-embed"[^>]*src="https:\/\/www\.zeffy\.com/);
  assert.ok(real.includes('https://paypal.me/test'), 'PayPal link renders when set');
  const placeholder = renderDonate({ ...content, settings: { ...settings, zeffyUrl: 'ZEFFY_FORM_URL' } });
  assert.doesNotMatch(placeholder, /<iframe/);
  assert.ok(placeholder.includes('mail a check'), 'fallback renders for placeholder');
});

test('ShelterLuv success renders escaped cards', () => {
  const cats = [{ name: 'Mia <script>alert(1)</script>', age: '2y', sex: 'F', breed: 'DSH "tabby"', description: '<img onerror=x>', photo: 'javascript:alert(1)', profileUrl: 'https://shelterluv.com/mia' }];
  const html = renderCatCards(cats, 'https://example.com/adopt');
  assert.match(html, /<article class="card">/);
  assert.ok(!html.includes('<script>'), 'names are escaped');
  assert.ok(!html.includes('<img onerror'), 'descriptions are escaped');
  assert.ok(!html.includes('javascript:'), 'non-http URLs are rejected');
  assert.ok(html.includes('https://shelterluv.com/mia'), 'valid profile URL kept');
  assert.ok(html.includes('Mia &lt;script&gt;'), 'card still shows the cat');
});

test('mobile menu toggles aria-expanded', async () => {
  const js = await readFile('src/main.js', 'utf8');
  assert.match(js, /classList\.toggle\('open'\)/);
  assert.match(js, /setAttribute\('aria-expanded', String\(open\)\)/);
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

test('ShelterLuv API has cache and client has fallback', async () => {
  assert.match(await readFile('api/shelterluv.js', 'utf8'), /s-maxage=600/);
  assert.match(await readFile('src/main.js', 'utf8'), /cat list is taking a catnap/);
});

test('CMS image fields require alt text', async () => {
  const y = await readFile('admin/config.yml', 'utf8');
  for (const x of ['photo_alt', 'cover_alt']) assert.match(y, new RegExp(x));
  assert.match(y, /editorial_workflow/);
  assert.match(y, /repo: Grandma-s-Cat-Coalition\/website/);
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
