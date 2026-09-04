// Renders every page of the site from content/ at build time.
// Kim or Cortney edit content in Decap → commit → build → the site changes.
import { md } from './content.mjs';

const SITE = 'https://grandmascatcoalition.org';
const shelter = {
  adopt: 'https://new.shelterluv.com/matchme/adopt/GCCI/Cat',
  foster: 'https://new.shelterluv.com/matchme/foster/GCCI/Cat',
  volunteer: 'https://new.shelterluv.com/form/volunteer/GCCI/176721-volunteer',
  found: 'https://new.shelterluv.com/form/other/GCCI/179042-found-cat',
};

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tel = phone => 'tel:+1' + String(phone || '').replace(/\D/g, '');
const isReal = url => typeof url === 'string' && /^https:\/\//.test(url);
const fmtDate = d => { const t = new Date(/^\d{4}-\d{2}-\d{2}$/.test(d) ? d + 'T12:00:00' : d); return isNaN(t) ? '' : t.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); };

function postalAddress(address) {
  const [street = '', locality = '', regionZip = ''] = String(address || '').split(',').map(s => s.trim());
  const [region = '', zip = ''] = regionZip.split(/\s+/);
  return { '@type': 'PostalAddress', streetAddress: street, addressLocality: locality, addressRegion: region, postalCode: zip };
}

const ngoLd = s => JSON.stringify({ '@context': 'https://schema.org', '@type': 'NGO', name: s.orgName, url: SITE, telephone: '+1-' + s.phone, email: s.email, address: postalAddress(s.address) });
const crumb = (...trail) => ({ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE }, ...trail.map((t, i) => ({ '@type': 'ListItem', position: i + 2, name: t.name, ...(t.item ? { item: t.item } : {}) }))] });
const crumbLd = name => JSON.stringify({ '@context': 'https://schema.org', ...crumb({ name }) });

const newsletterForm = id => `<form class="newsletter form" action="/api/newsletter" method="post" data-api><label for="${id}">Email address</label><input id="${id}" name="email" type="email" required maxlength="200"><label class="hp">Leave blank<input name="website" tabindex="-1" autocomplete="off"></label><button class="button" type="submit">Sign up</button><p role="status" aria-live="polite"></p></form>`;

function header() {
  return `<header class="site-header" data-header><div class="wrap nav"><a class="brand" href="/"><span class="script">Grandma's</span><span class="coalition">CAT COALITION</span></a><button class="menu" aria-expanded="false" aria-controls="nav-links" aria-label="Open menu">☰</button><nav id="nav-links" class="nav-links" aria-label="Main"><a href="/adopt.html">Adopt</a><a href="/foster.html">Foster</a><a href="/volunteer.html">Volunteer</a><a href="/tnr.html">TNR</a><a href="/about.html">About</a><a href="/news.html">News</a><a class="button donate" href="/donate.html">Donate</a></nav></div></header>`;
}

function footer(s) {
  return `<footer class="site-footer" data-footer><div class="wrap footer-grid"><div><h2>${esc(s.orgName)}</h2><p>${esc(s.address).replace(/, /, '<br>')}</p><p><a href="${tel(s.phone)}">${esc(s.phone)}</a><br><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></p></div><div><h2>Get involved</h2><p><a href="/adopt.html">Adopt</a><br><a href="/foster.html">Foster</a><br><a href="/volunteer.html">Volunteer</a><br><a href="/donate.html">Donate</a></p></div><div><h2>Stay connected</h2>${newsletterForm('newsletter-email-footer')}</div></div><div class="wrap"><p>${esc(s.orgName)} is a 501(c)(3) nonprofit. Donations are tax-deductible.</p><p><a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a> · <a href="${esc(s.facebook)}">Facebook</a></p></div></footer>`;
}

const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Kaushan+Script&family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Lato:wght@400;700;900&display=swap';

function layout({ slug, title, description, ld, main, settings: s, preloadImage }) {
  const canonical = slug === 'index' ? `${SITE}/` : `${SITE}/${slug}`;
  const ogImage = SITE + (s.heroImage || '/images/brand/grandma-and-cat.jpg');
  // Load the font CSS asynchronously so it doesn't block first paint (~900ms on
  // throttled mobile); text renders immediately in the fallback stack and swaps.
  const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="preload" as="style" href="${FONTS_HREF}" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${FONTS_HREF}"></noscript>`;
  const preload = preloadImage ? `<link rel="preload" as="image" href="${esc(preloadImage)}" fetchpriority="high">` : '';
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${canonical}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${ogImage}"><meta name="twitter:card" content="summary_large_image">${fonts}${preload}<script type="application/ld+json">${ld}</script></head><body data-phone="${esc(s.phone)}"><a class="skip" href="#main">Skip to content</a>${header()}<main id="main">${main}</main>${footer(s)}<nav class="mobile-bar" aria-label="Quick actions"><a class="donate-link" href="/donate.html">Donate</a><a href="/adopt.html">Adopt</a><a href="${tel(s.phone)}">Call</a></nav><script type="module" src="/src/main.js"></script></body></html>`;
}

const hero = (eyebrow, h1, text, actions = '') => `<section class="hero"><div class="wrap">${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h1>${h1}</h1><p>${text}</p>${actions ? `<div class="actions">${actions}</div>` : ''}</div></section>`;

const tagList = tags => Array.isArray(tags) && tags.length ? `<p class="tags">${tags.map(t => `<span class="tag">${esc(t)}</span>`).join(' ')}</p>` : '';
const newsCard = n => `<article class="card"><img src="${esc(n.cover)}" alt="${esc(n.cover_alt)}" width="600" height="450" loading="lazy"><h3><a href="/news/${esc(n.slug)}.html">${esc(n.title)}</a></h3><p class="eyebrow">${fmtDate(n.date)}</p><p>${esc(n.excerpt)}</p></article>`;
const heroMedia = s => isReal(SITE + s.heroVideo) && String(s.heroVideo).startsWith('/videos/')
  ? `<video class="hero-photo" autoplay loop muted playsinline poster="${esc(s.heroImage)}" aria-label="Rescue cat video"><source src="${esc(s.heroVideo)}" type="video/mp4"></video>`
  : `<img class="hero-photo" src="${esc(s.heroImage)}" alt="Grandma holding a cat, the heart of our rescue" width="800" height="600" fetchpriority="high">`;

export function renderHome(c) {
  const s = c.settings;
  const latest = c.news.slice(0, 3).map(newsCard).join('');
  const main = `<section class="hero"><div class="wrap hero-split"><div><p class="eyebrow">Cat rescue · Lime Springs, Iowa</p><h1>${esc(s.heroTitle)}</h1><p>${esc(s.heroText)}</p><div class="actions"><a class="button donate" href="/donate.html">Donate</a><a class="button secondary" href="/adopt.html">Meet adoptable cats</a><a class="button soft" href="/foster.html">Foster a cat</a></div></div><div class="hero-media">${heroMedia(s)}</div></div></section>` +
    `<section class="section"><div class="wrap"><p class="eyebrow">Looking for home</p><h2>Meet the cats</h2><div class="grid" data-cats data-limit="4"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div></div></section>` +
    `<section class="section sage"><div class="wrap"><h2>How you can help</h2><div class="grid four"><a class="card" href="/donate.html"><h3>Donate</h3><p>Fund food, veterinary care, and spay/neuter.</p></a><a class="card" href="/foster.html"><h3>Foster</h3><p>Open your home and save a life.</p></a><a class="card" href="/volunteer.html"><h3>Volunteer</h3><p>Share your time and talents.</p></a><a class="card" href="/adopt.html"><h3>Adopt</h3><p>Meet your new best friend.</p></a></div></div></section>` +
    (latest ? `<section class="section"><div class="wrap"><p class="eyebrow">Latest news</p><h2>From our foster homes</h2><div class="grid">${latest}</div><p><a class="button soft" href="/news.html">All news</a></p></div></section>` : '') +
    `<section class="section sage"><div class="wrap"><h2>Stay in the loop</h2><p>Occasional updates on cats, events, and ways to help. No spam, ever.</p>${newsletterForm('newsletter-email-home')}</div></section>`;
  return layout({ slug: 'index', title: `${s.orgName} | Cat Rescue in Northeast Iowa`, description: 'Support cat adoption, foster care, and humane TNR in Northeast Iowa with Grandma\'s Cat Coalition.', ld: ngoLd(s), main, settings: s, preloadImage: s.heroImage });
}

export function renderAdopt(c) {
  const p = c.pages.adopt || {};
  const main = hero('Find your new friend', esc(p.title || 'Adopt a cat'), esc(p.intro || ''), `<a class="button" href="${shelter.adopt}">Apply to adopt</a>`) +
    `<section class="section"><div class="wrap"><h2>Available cats</h2><div class="grid" data-cats><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div></div></section>` +
    `<section class="section sage"><div class="wrap"><h2>How adoption works</h2><p>Browse available cats, complete the ShelterLuv application, and our volunteers will help you find a good match.</p>${md(p.fees || '')}</div></section>`;
  return layout({ slug: 'adopt', title: `Adopt a Cat | ${c.settings.orgName}`, description: 'Meet adoptable cats from Grandma\'s Cat Coalition and apply through ShelterLuv.', ld: crumbLd('Adopt'), main, settings: c.settings });
}

export function renderFoster(c) {
  const p = c.pages.foster || {};
  const faq = (c.fosterFaq || []).map(f => `<details><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`).join('');
  const main = hero('Open your home', esc(p.title || 'Foster a cat'), esc(p.intro || ''), `<a class="button" href="${shelter.foster}">Apply to foster</a>`) +
    `<section class="section"><div class="wrap"><h2>You provide love. We help with the rest.</h2>${md(p.body || '')}<h2>Common questions</h2>${faq}</div></section>`;
  return layout({ slug: 'foster', title: `Foster a Cat | ${c.settings.orgName}`, description: 'Foster a cat with Grandma\'s Cat Coalition and save a life from your own home.', ld: crumbLd('Foster'), main, settings: c.settings });
}

export function renderVolunteer(c) {
  const p = c.pages.volunteer || {};
  const main = hero('Join us', esc(p.title || 'Volunteer'), esc(p.intro || ''), `<a class="button" href="${shelter.volunteer}">Become a volunteer</a>`) +
    `<section class="section"><div class="wrap"><h2>There is a place for you</h2>${md(p.body || '')}</div></section>`;
  return layout({ slug: 'volunteer', title: `Volunteer | ${c.settings.orgName}`, description: 'Volunteer with Grandma\'s Cat Coalition in Northeast Iowa.', ld: crumbLd('Volunteer'), main, settings: c.settings });
}

export function renderDonate(c) {
  const s = c.settings;
  const give = isReal(s.zeffyUrl)
    ? `<h2>Give securely</h2><iframe class="zeffy-embed" title="Donate to ${esc(s.orgName)}" src="${esc(s.zeffyUrl)}" allow="payment"></iframe>`
    : `<h2>Give securely</h2><div class="notice"><p>Our Zeffy donation form is being connected. To donate today, call <a href="${tel(s.phone)}">${esc(s.phone)}</a> or mail a check to ${esc(s.address)}.</p></div>`;
  const other = [
    isReal(s.paypalUrl) && `<a class="button soft" href="${esc(s.paypalUrl)}">PayPal</a>`,
    isReal(s.venmoUrl) && `<a class="button soft" href="${esc(s.venmoUrl)}">Venmo</a>`,
    isReal(s.amazonWishlist) && `<a class="button soft" href="${esc(s.amazonWishlist)}">Amazon wishlist</a>`,
    isReal(s.chewyWishlist) && `<a class="button soft" href="${esc(s.chewyWishlist)}">Chewy wishlist</a>`,
  ].filter(Boolean).join(' ');
  const main = hero('Every gift matters', 'Help cats heal and find home', 'A monthly gift gives our small volunteer rescue dependable support.') +
    `<section class="section"><div class="wrap">${give}</div></section>` +
    `<section class="section sage"><div class="wrap grid"><div><h2>What your gift can do</h2><p><strong>$25</strong> helps supply food and litter.</p><p><strong>$50</strong> helps with vaccines and basic care.</p><p><strong>$100</strong> helps sponsor spay or neuter care.</p></div><div><h2>Other ways</h2>${other ? `<p class="actions">${other}</p>` : '<p>PayPal, Venmo, Amazon and Chewy wishlist links are coming soon.</p>'}<p>Employer matching may double your impact.</p></div></div></section>`;
  return layout({ slug: 'donate', title: `Donate to Help Cats | ${s.orgName}`, description: 'Give once or monthly to fund cat food, veterinary care, fostering, and TNR in Northeast Iowa.', ld: crumbLd('Donate'), main, settings: s });
}

export function renderTnr(c) {
  const p = c.pages.tnr || {};
  const main = hero('Humane community care', esc(p.title || 'Trap-Neuter-Return'), esc(p.intro || '')) +
    `<section class="section"><div class="wrap"><h2>How it works</h2>${md(p.body || '')}<h2>Request TNR help</h2><form class="form" action="/api/tnr-request" method="post" data-api><label>Name<input name="name" required maxlength="100"></label><label>Email<input name="email" type="email" required maxlength="200"></label><label>Colony location<input name="location" required maxlength="300"></label><label>How many cats?<input name="catCount" inputmode="numeric" required maxlength="10"></label><label>What have you observed?<textarea name="message" required maxlength="5000"></textarea></label><label class="hp">Leave blank<input name="website" tabindex="-1" autocomplete="off"></label><button class="button" type="submit">Request help</button><p role="status" aria-live="polite"></p></form></div></section>`;
  return layout({ slug: 'tnr', title: `TNR Help | ${c.settings.orgName}`, description: 'Learn about Trap-Neuter-Return and request help for a community cat colony.', ld: crumbLd('TNR'), main, settings: c.settings });
}

export function renderAbout(c) {
  const s = c.settings, p = c.pages.about || {};
  const board = c.board.map(b => `<article class="card"><img src="${esc(b.photo)}" alt="${esc(b.photo_alt)}" width="600" height="450" loading="lazy"><h3>${esc(b.name)}</h3><p class="eyebrow">${esc(b.role)}</p>${b.bodyHtml}</article>`).join('');
  const main = hero('Neighbors helping cats', esc(p.title || 'About us'), esc(p.intro || '')) +
    `<section class="section"><div class="wrap"><h2>Our mission</h2>${md(p.mission || '')}<h2>Our board</h2><div class="grid">${board}</div><h2>Nonprofit information</h2><p>${esc(s.orgName)} is a 501(c)(3) nonprofit. Donations are tax-deductible. The determination letter will be posted when supplied.</p></div></section>`;
  return layout({ slug: 'about', title: `About | ${s.orgName}`, description: 'Learn about Grandma\'s Cat Coalition, our mission, board, and nonprofit status.', ld: ngoLd(s), main, settings: s });
}

export function renderCatDetail(c) {
  const main = `<section class="hero"><div class="wrap"><p class="eyebrow">Adoptable cat</p><h1>Meet this cat</h1><p>Current details are pulled from ShelterLuv when you open the page.</p></div></section>` +
    `<section class="section"><div class="wrap" data-cat-detail><div class="skeleton"></div></div></section>`;
  return layout({ slug: 'meet-cat', title: `Meet an Adoptable Cat | ${c.settings.orgName}`, description: 'Learn more about an adoptable cat from Grandma\'s Cat Coalition.', ld: crumbLd('Meet an Adoptable Cat'), main, settings: c.settings });
}

export function renderFoundACat(c) {
  const p = c.pages['found-a-cat'] || {};
  const main = hero('Here to help', esc(p.title || 'Found a cat?'), esc(p.intro || '')) +
    `<section class="section"><div class="wrap"><h2>What to do first</h2>${md(p.body || '')}<a class="button" href="${shelter.found}">Submit a found-cat report</a></div></section>`;
  return layout({ slug: 'found-a-cat', title: `Found a Cat? | ${c.settings.orgName}`, description: 'What to do when you find a stray or community cat in Northeast Iowa.', ld: crumbLd('Found a Cat'), main, settings: c.settings });
}

export function renderNews(c) {
  const cards = c.news.map(newsCard).join('');
  const main = hero('', 'News and updates', 'Follow the latest work from our foster homes and community.') +
    `<section class="section"><div class="wrap"><div class="grid">${cards || '<div class="notice"><p>Fresh news will appear here as our volunteers add it.</p></div>'}</div></div></section>`;
  return layout({ slug: 'news', title: `News | ${c.settings.orgName}`, description: 'News and updates from Grandma\'s Cat Coalition.', ld: crumbLd('News'), main, settings: c.settings });
}

// One prerendered detail page per news post, carrying Article structured data.
export function renderNewsDetail(c, post) {
  const s = c.settings;
  const url = `${SITE}/news/${post.slug}.html`;
  const article = { '@context': 'https://schema.org', '@type': 'Article', headline: post.title, datePublished: post.date, description: post.excerpt, image: SITE + (post.cover || ''), author: { '@type': 'Organization', name: s.orgName }, publisher: { '@type': 'Organization', name: s.orgName }, mainEntityOfPage: url };
  const bc = { '@context': 'https://schema.org', ...crumb({ name: 'News', item: `${SITE}/news` }, { name: post.title }) };
  const main = `<section class="hero"><div class="wrap"><p class="eyebrow">${fmtDate(post.date)}</p><h1>${esc(post.title)}</h1></div></section>` +
    `<section class="section"><div class="wrap article"><img src="${esc(post.cover)}" alt="${esc(post.cover_alt)}" width="1000" height="560">${post.bodyHtml}${tagList(post.tags)}<p><a class="button soft" href="/news.html">← All news</a></p></div></section>`;
  return layout({ slug: `news/${post.slug}`, title: `${post.title} | ${s.orgName}`, description: post.excerpt || post.title, ld: JSON.stringify([article, bc]), main, settings: s });
}

export function renderEvents(c, now = new Date()) {
  const eventCard = e => `<article class="card event">${e.cover ? `<img src="${esc(e.cover)}" alt="${esc(e.cover_alt)}" width="600" height="450" loading="lazy">` : ''}<h3>${esc(e.title)}</h3><p class="eyebrow">${fmtDate(e.start)}${e.location ? ' · ' + esc(e.location) : ''}</p>${e.bodyHtml}${isReal(e.link) ? `<a class="button soft" href="${esc(e.link)}">Event details</a>` : ''}</article>`;
  const upcoming = c.events.filter(e => new Date(e.end || e.start) >= now);
  const past = c.events.filter(e => new Date(e.end || e.start) < now).reverse();
  const eventLd = upcoming.map(e => ({ '@context': 'https://schema.org', '@type': 'Event', name: e.title, startDate: e.start, ...(e.end ? { endDate: e.end } : {}), ...(e.location ? { location: { '@type': 'Place', name: e.location } } : {}), description: e.title, organizer: { '@type': 'Organization', name: c.settings.orgName } }));
  const ld = JSON.stringify([...eventLd, { '@context': 'https://schema.org', ...crumb({ name: 'Events' }) }]);
  const main = hero('', 'Upcoming events', 'Meet fellow cat lovers and support our rescue.') +
    `<section class="section"><div class="wrap">${upcoming.map(eventCard).join('') || '<div class="notice"><p>No upcoming events yet — check back soon or follow us on Facebook.</p></div>'}${past.length ? `<details class="past-events"><summary>Past events (${past.length})</summary>${past.map(eventCard).join('')}</details>` : ''}</div></section>`;
  return layout({ slug: 'events', title: `Events | ${c.settings.orgName}`, description: 'Upcoming events from Grandma\'s Cat Coalition.', ld, main, settings: c.settings });
}

export function renderHappyTails(c) {
  const photos = t => Array.isArray(t.photos) && t.photos.length ? `<div class="grid tail-photos">${t.photos.map(p => `<img src="${esc(p)}" alt="${esc(t.photo_alt || t.cat_name + ', adopted')}" width="600" height="450" loading="lazy">`).join('')}</div>` : '';
  const tails = c.happyTails.map(t => `<article class="card">${photos(t)}<h3>${esc(t.title)}</h3><p class="eyebrow">${esc(t.cat_name)} · ${fmtDate(t.date)}</p>${t.bodyHtml}${t.adopter_quote ? `<blockquote>${esc(t.adopter_quote)}</blockquote>` : ''}</article>`).join('');
  const main = hero('', 'Happy adoption stories', 'Celebrating cats who found their people.') +
    `<section class="section"><div class="wrap"><div class="grid">${tails || '<div class="notice"><p>Happy endings will appear here as cats find their homes.</p></div>'}</div></div></section>`;
  return layout({ slug: 'happy-tails', title: `Happy Tails | ${c.settings.orgName}`, description: 'Happy adoption stories from Grandma\'s Cat Coalition.', ld: crumbLd('Happy Tails'), main, settings: c.settings });
}

export function renderContact(c) {
  const main = hero('', 'Contact us', 'Questions about cats, fostering, or supporting our work? Send us a note.') +
    `<section class="section"><div class="wrap"><form class="form" action="/api/contact" method="post" data-api><label>Name<input name="name" required maxlength="100"></label><label>Email<input name="email" type="email" required maxlength="200"></label><label>Message<textarea name="message" required maxlength="5000"></textarea></label><label class="hp">Leave blank<input name="website" tabindex="-1" autocomplete="off"></label><button class="button" type="submit">Send message</button><p role="status" aria-live="polite"></p></form></div></section>`;
  return layout({ slug: 'contact', title: `Contact | ${c.settings.orgName}`, description: 'Contact Grandma\'s Cat Coalition in Lime Springs, Iowa.', ld: crumbLd('Contact'), main, settings: c.settings });
}

const staticPage = (slug, title, heading, copy) => c => layout({
  slug, title: `${title} | ${c.settings.orgName}`, description: copy, ld: crumbLd(title),
  main: hero('', heading, copy), settings: c.settings,
});

export const renderers = {
  index: renderHome, adopt: renderAdopt, foster: renderFoster, volunteer: renderVolunteer,
  donate: renderDonate, tnr: renderTnr, about: renderAbout, 'found-a-cat': renderFoundACat,
  news: renderNews, events: renderEvents, 'happy-tails': renderHappyTails, contact: renderContact, 'meet-cat': renderCatDetail,
  privacy: staticPage('privacy', 'Privacy policy', 'Your privacy matters', 'We collect only the information you choose to send through our forms and use it to respond to you. We do not sell personal information.'),
  terms: staticPage('terms', 'Website terms', 'Terms of use', 'This website provides general rescue information. Animal availability and services may change.'),
  404: staticPage('404', 'Page not found', 'That page wandered off', 'Try the home page or contact us if you need help.'),
};

export function renderAll(content) {
  return Object.fromEntries(Object.entries(renderers).map(([slug, fn]) => [slug, fn(content)]));
}
