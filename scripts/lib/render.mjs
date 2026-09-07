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

const icons = { heart: '<path d="M20.8 8.8c0 5.4-8.8 10.6-8.8 10.6S3.2 14.2 3.2 8.8a4.8 4.8 0 0 1 8.8-2.7 4.8 4.8 0 0 1 8.8 2.7Z"/>', paw: '<path d="M8 9.2c-1.8 0-3-1.7-2.6-3.4.3-1.4 1.4-2.4 2.6-2.4s2.3 1 2.6 2.4C11 7.5 9.8 9.2 8 9.2Zm8 0c-1.8 0-3-1.7-2.6-3.4.3-1.4 1.4-2.4 2.6-2.4s2.3 1 2.6 2.4C19 7.5 17.8 9.2 16 9.2ZM12 20c-2.8 0-5-1.5-5-3.7 0-2.4 2.8-4.3 5-4.3s5 1.9 5 4.3c0 2.2-2.2 3.7-5 3.7Z"/>', house: '<path d="m3 10 9-7 9 7v9H3v-9Zm6 9v-5h6v5"/>', book: '<path d="M3 5.5c3-1 6-.5 9 1.5v12c-3-2-6-2.5-9-1.5v-12Zm18 0c-3-1-6-.5-9 1.5v12c3-2 6-2.5 9-1.5v-12Z"/>', envelope: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="m4 7 8 6 8-6"/>', people: '<circle cx="12" cy="8" r="3"/><path d="M6 19c0-3 2.7-5 6-5s6 2 6 5M5 11a2.5 2.5 0 1 1 0-5M19 11a2.5 2.5 0 1 0 0-5M2.5 19c.2-2.1 1.4-3.5 3.5-4M21.5 19c-.2-2.1-1.4-3.5-3.5-4"/>' };
const exactIcons = {
  donate: '<path d="M12.1 20.1C10.9 18.8 5.1 14.6 3.4 10.3C2.2 7.2 3.8 4.4 6.6 4.1C8.7 3.9 10.4 5.2 12 7.1C13.3 5.1 15.2 3.7 17.4 4.1C20.1 4.5 21.6 7.3 20.4 10.2C18.7 14.3 13.4 18.7 12.1 20.1Z" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  volunteer: '<path d="M12 20.2C10.6 18.7 5 14.6 3.5 10.2C2.5 7.3 4 4.5 6.8 4.2C8.9 4 10.6 5.2 12 7.1C13.5 5.1 15.2 4 17.3 4.2C20 4.5 21.5 7.3 20.5 10.2C19 14.5 13.4 18.8 12 20.2Z" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 9.2V13.8M9.7 11.5H14.3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  people: '<circle cx="12" cy="7.3" r="2.6" stroke="currentColor" stroke-width="1.9"/><circle cx="5.9" cy="9.1" r="2" stroke="currentColor" stroke-width="1.9"/><circle cx="18.1" cy="9.1" r="2" stroke="currentColor" stroke-width="1.9"/><path d="M7.8 18.8V16.7C7.8 13.9 9.5 12.2 12 12.2C14.5 12.2 16.2 13.9 16.2 16.7V18.8M3 18.6V16.9C3 14.9 4.2 13.7 6 13.7C6.7 13.7 7.3 13.9 7.8 14.3M21 18.6V16.9C21 14.9 19.8 13.7 18 13.7C17.3 13.7 16.7 13.9 16.2 14.3" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  paw: '<ellipse cx="4.1" cy="8.1" rx="1.55" ry="2.25" transform="rotate(-30 4.1 8.1)" stroke="currentColor" stroke-width="1.8"/><ellipse cx="9.1" cy="4.7" rx="1.55" ry="2.25" transform="rotate(-10 9.1 4.7)" stroke="currentColor" stroke-width="1.8"/><ellipse cx="14.9" cy="4.7" rx="1.55" ry="2.25" transform="rotate(10 14.9 4.7)" stroke="currentColor" stroke-width="1.8"/><ellipse cx="19.9" cy="8.1" rx="1.55" ry="2.25" transform="rotate(30 19.9 8.1)" stroke="currentColor" stroke-width="1.8"/><path d="M7.5 17.1C7.5 14.2 9.4 11.9 12 11.9C14.6 11.9 16.5 14.2 16.5 17.1C16.5 19.1 15 20.2 13.5 19.6C12.5 19.2 11.5 19.2 10.5 19.6C9 20.2 7.5 19.1 7.5 17.1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  house: '<path d="M3.5 11.2L12 4L20.5 11.2M5.6 9.8V20H18.4V9.8M9.7 20V14.3H14.3V20" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.2 10.1C10.7 9.3 11.8 9.2 12.1 10.1C12.5 9.2 13.6 9.3 14 10.1C14.5 11.1 13.4 12.2 12.1 13.2C10.8 12.2 9.7 11.1 10.2 10.1Z" fill="currentColor"/>',
  book: '<path d="M12 19.3C10.1 17.8 8 17.1 5.1 17.1H3.5V5.1H5.5C8.2 5.1 10.5 6 12 7.7V19.3ZM12 19.3C13.9 17.8 16 17.1 18.9 17.1H20.5V5.1H18.5C15.8 5.1 13.5 6 12 7.7V19.3Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M6.2 8.1C7.8 8.1 9.2 8.5 10.2 9.2M6.2 10.7C7.8 10.7 9.2 11.1 10.2 11.8M6.2 13.3C7.8 13.3 9.2 13.7 10.2 14.4M17.8 8.1C16.2 8.1 14.8 8.5 13.8 9.2M17.8 10.7C16.2 10.7 14.8 11.1 13.8 11.8M17.8 13.3C16.2 13.3 14.8 13.7 13.8 14.4" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/>',
  envelope: '<rect x="3" y="5.5" width="18" height="13" rx="2.2" stroke="currentColor" stroke-width="1.9"/><path d="M4.4 7L10.6 12.1C11.4 12.8 12.6 12.8 13.4 12.1L19.6 7M4.3 17L9.1 12.7M19.7 17L14.9 12.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  phone: '<path d="M7.1 3.8L9.6 7.7L7.7 9.7C8.9 12.7 11.3 15.1 14.3 16.3L16.3 14.4L20.2 16.9C20.7 17.2 20.9 17.8 20.7 18.4C20.2 19.8 18.9 20.7 17.4 20.6C10 20 4 14 3.4 6.6C3.3 5.1 4.2 3.8 5.6 3.3C6.2 3.1 6.8 3.3 7.1 3.8Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  pin: '<path d="M12 21C12 21 18.2 14.7 18.2 9.5C18.2 6.1 15.4 3.4 12 3.4C8.6 3.4 5.8 6.1 5.8 9.5C5.8 14.7 12 21 12 21Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="9.5" r="2.3" stroke="currentColor" stroke-width="1.8"/>',
};
const actionButton = (kind, label, href, icon = kind) => `<a class="button gcc-button button-${kind}" href="${href}"><span class="button-icon" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" focusable="false">${exactIcons[icon]}</svg></span><span>${label}</span><svg class="button-arrow gcc-button-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12H19M14 7L19 12L14 17"/></svg></a>`;
const iconSvg = name => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">${exactIcons[name]}</svg>`;
const newsletterForm = id => `<form class="newsletter form" action="/api/newsletter" method="post" data-api><label for="${id}">Email address</label><input id="${id}" name="email" type="email" required maxlength="200" placeholder="you@example.com"><label class="hp">Leave blank<input name="website" tabindex="-1" autocomplete="off"></label><button class="button" type="submit">Join the newsletter</button><p role="status" aria-live="polite"></p></form>`;

function header() {
  return `<header class="site-header" data-header><div class="wrap nav"><a class="brand" href="/"><span class="script">Grandma's</span><span class="coalition">CAT COALITION</span></a><button class="menu" aria-expanded="false" aria-controls="nav-links" aria-label="Open menu">☰</button><nav id="nav-links" class="nav-links" aria-label="Main"><a href="/adopt.html">Adopt</a><a href="/foster.html">Foster</a><a href="/volunteer.html">Volunteer</a><a href="/tnr.html">TNR</a><a href="/about.html">About</a><a href="/news.html">News</a>${actionButton('donate','DONATE NOW','/donate.html','donate')}</nav></div></header>`;
}

function footer(s) {
  return `<footer class="site-footer" data-footer><div class="wrap footer-grid"><div class="footer-brand"><h2>${esc(s.orgName)}</h2><p class="tagline">One cat at a time, we’re making a kinder future for community cats.</p><p class="address">${iconSvg('pin')}<span>${esc(s.address).replace(/, /, '<br>')}</span></p><p class="contact-links"><a href="${tel(s.phone)}">${iconSvg('phone')}<span>${esc(s.phone)}</span></a><a href="mailto:${esc(s.email)}">${iconSvg('envelope')}<span>${esc(s.email)}</span></a></p><div class="social-links" aria-label="Social media"><span>Follow our work</span><a href="${esc(s.facebook)}" aria-label="Grandma's Cat Coalition on Facebook">f</a><a href="${esc(s.facebook)}" aria-label="Grandma's Cat Coalition on Instagram">◎</a></div></div><nav class="footer-menu" aria-label="Footer menu"><h2>Get involved</h2><a href="/adopt.html"><span class="footer-icon">${iconSvg('paw')}</span><span>Adopt a cat</span></a><a href="/foster.html"><span class="footer-icon">${iconSvg('house')}</span><span>Foster a cat</span></a><a href="/volunteer.html"><span class="footer-icon">${iconSvg('people')}</span><span>Volunteer</span></a><a href="/donate.html"><span class="footer-icon">${iconSvg('donate')}</span><span>Donate</span></a></nav><div class="footer-newsletter"><h2>Stay in the loop</h2><p>Occasional updates on cats, events, and ways to help. No spam, ever.</p>${newsletterForm('newsletter-email-footer')}</div></div><div class="footer-bottom"><p>${esc(s.orgName)} is a 501(c)(3) nonprofit. Donations are tax-deductible.</p><nav aria-label="Legal"><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a></nav></div></footer>`;
}

const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Kaushan+Script&family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Lato:wght@400;700;900&display=swap';

function layout({ slug, title, description, ld, main, settings: s, preloadImage }) {
  const canonical = slug === 'index' ? `${SITE}/` : `${SITE}/${slug}`;
  const ogImage = SITE + (s.heroImage || '/images/brand/grandma-and-cat.jpg');
  // Load the font CSS asynchronously so it doesn't block first paint (~900ms on
  // throttled mobile); text renders immediately in the fallback stack and swaps.
  const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Corinthia:wght@400;700&family=Inter:wght@400;500;600;700&family=Story+Script&display=swap" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Corinthia:wght@400;700&family=Inter:wght@400;500;600;700&family=Story+Script&display=swap"></noscript>`;
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
  const main = `<section class="hero"><div class="wrap hero-split"><div><p class="eyebrow">Cat rescue · Lime Springs, Iowa</p><h1>${esc(s.heroTitle)}</h1><p>${esc(s.heroText)}</p><div class="actions">${actionButton('donate','DONATE NOW','/donate.html','donate')}${actionButton('adopt','ADOPT A CAT','/adopt.html','paw')}${actionButton('foster','FOSTER A CAT','/foster.html','house')}</div></div><div class="hero-media">${heroMedia(s)}</div></div></section>` +
    `<section class="section"><div class="wrap"><p class="eyebrow">Looking for home</p><h2>Meet the cats</h2><div class="grid" data-cats data-limit="4"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div></div></section>` +
    `<section class="section story"><div class="wrap story-layout"><img class="story-photo" src="${esc('/images/brand/grandma-and-cat.jpg')}" alt="Eleanor's memory lives on through a love of cats" width="713" height="720" loading="lazy"><div class="story-copy"><p class="eyebrow">The story behind GCC</p><h2>Grandma’s love lives on, one cat at a time.</h2><p>Grandma’s Cat Coalition began with a love for cats and was named in memory of Eleanor Horst of Red Wing, Minnesota—a true cat lover.</p><p>That love grew into a mission here in Lime Springs, Iowa, where too many cats and kittens were being born outside, abandoned, injured, or left without an advocate. We knew we couldn’t save every cat, but we couldn’t look the other way.</p><p>Today, GCC is a volunteer-powered 501(c)(3) nonprofit providing rescue, fostering, adoption, TNR, education, and practical support for local cats and the people who care for them.</p><p class="story-closing">We may be a small-town rescue, but we’re determined to make a big difference—one cat at a time. 🐾</p></div></div></section>` +
    `<section class="section sage"><div class="wrap"><h2>How you can help</h2><p class="section-intro">There’s a meaningful place for you in this work.</p><div class="grid four help-grid"><a class="card" href="/donate.html"><span class="card-icon">${iconSvg('donate')}</span><h3>Donate</h3><p>Fund food, veterinary care, and spay/neuter.</p><span class="card-link">Help cats heal →</span></a><a class="card" href="/foster.html"><span class="card-icon">${iconSvg('house')}</span><h3>Foster</h3><p>Open your home and save a life.</p><span class="card-link">Open your home →</span></a><a class="card" href="/volunteer.html"><span class="card-icon">${iconSvg('people')}</span><h3>Volunteer</h3><p>Share your time and talents.</p><span class="card-link">Join the team →</span></a><a class="card" href="/adopt.html"><span class="card-icon">${iconSvg('paw')}</span><h3>Adopt</h3><p>Meet your new best friend.</p><span class="card-link">Find your match →</span></a></div></div></section>` +
    (latest ? `<section class="section"><div class="wrap"><p class="eyebrow">Latest news</p><h2>From our foster homes</h2><div class="grid">${latest}</div><p><a class="button soft" href="/news.html">All news</a></p></div></section>` : '') +
    `<section class="section sage"><div class="wrap"><h2>Stay in the loop</h2><p>Occasional updates on cats, events, and ways to help. No spam, ever.</p>${newsletterForm('newsletter-email-home')}</div></section>`;
  return layout({ slug: 'index', title: `${s.orgName} | Cat Rescue in Northeast Iowa`, description: 'Support cat adoption, foster care, and humane TNR in Northeast Iowa with Grandma\'s Cat Coalition.', ld: ngoLd(s), main, settings: s, preloadImage: s.heroImage });
}

export function renderAdopt(c) {
  const p = c.pages.adopt || {};
  const main = hero('Find your new friend', esc(p.title || 'Adopt a cat'), esc(p.intro || ''), actionButton('adopt','ADOPT A CAT',shelter.adopt,'paw')) +
    `<section class="section"><div class="wrap"><h2>Available cats</h2><div class="grid" data-cats><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div></div></section>` +
    `<section class="section sage"><div class="wrap"><h2>How adoption works</h2><p>Browse available cats, complete the ShelterLuv application, and our volunteers will help you find a good match.</p>${md(p.fees || '')}</div></section>`;
  return layout({ slug: 'adopt', title: `Adopt a Cat | ${c.settings.orgName}`, description: 'Meet adoptable cats from Grandma\'s Cat Coalition and apply through ShelterLuv.', ld: crumbLd('Adopt'), main, settings: c.settings });
}

export function renderFoster(c) {
  const p = c.pages.foster || {};
  const faq = (c.fosterFaq || []).map(f => `<details><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`).join('');
  const main = hero('Open your home', esc(p.title || 'Foster a cat'), esc(p.intro || ''), actionButton('foster','FOSTER A CAT',shelter.foster,'house')) +
    `<section class="section"><div class="wrap"><h2>You provide love. We help with the rest.</h2>${md(p.body || '')}<h2>Common questions</h2>${faq}</div></section>`;
  return layout({ slug: 'foster', title: `Foster a Cat | ${c.settings.orgName}`, description: 'Foster a cat with Grandma\'s Cat Coalition and save a life from your own home.', ld: crumbLd('Foster'), main, settings: c.settings });
}

export function renderVolunteer(c) {
  const p = c.pages.volunteer || {};
  const main = hero('Join us', esc(p.title || 'Volunteer'), esc(p.intro || ''), actionButton('volunteer','VOLUNTEER',shelter.volunteer,'heart')) +
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
