import './styles.css';
import { renderCatCards, renderCatDetail } from './cats.js';

// Header, footer, and page content are rendered at build time from content/
// (scripts/build.mjs). This file only wires up behavior.

const phone = document.body.dataset.phone || '641-229-7494';

// Mobile menu
const menu = document.querySelector('.menu');
menu?.addEventListener('click', () => {
  const links = document.querySelector('#nav-links');
  const open = links.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

// All forms (contact, TNR, newsletter) share one JS submit path: JSON POST,
// inline status message, no navigation to raw JSON.
document.querySelectorAll('form[data-api]').forEach(form => form.addEventListener('submit', async e => {
  e.preventDefault();
  const out = form.querySelector('[role=status]');
  out.textContent = 'Sending…';
  try {
    const r = await fetch(form.action, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error);
    form.reset();
    out.textContent = 'Thank you — your message was sent.';
  } catch {
    out.textContent = `We could not send that right now. Please call ${phone}.`;
  }
}));

// Adoptable cats from ShelterLuv.
// Two paths, in order: (1) /api/shelterluv gives custom-styled cards when a
// SHELTERLUV_API_KEY is set; (2) otherwise, or if the API fails, the adopt page
// mounts ShelterLuv's public embed widget (an iframe — no key, no styling).
// Homepage teasers can't host the iframe, so they link to the adopt page.
const adoptUrl = 'https://new.shelterluv.com/matchme/adopt/GCCI/Cat';
const shelterluv = { gid: 100003517, domain: 'https://new.shelterluv.com', script: 'https://new.shelterluv.com/misc/shelterluv_embed.js' };
const fallback = () => `<div class="notice"><h3>Our cat list is taking a catnap.</h3><p>You can still <a href="${adoptUrl}">see available cats and apply through ShelterLuv</a>.</p></div>`;
// Homepage teaser when styled cards aren't available: a plain invitation, not an error.
const teaser = () => `<div class="notice"><h3>Cats are waiting for homes right now.</h3><p><a class="button" href="/adopt.html">See available cats</a></p></div>`;

export function mountEmbed(target) {
  const id = 'shelterluv_wrap';
  target.innerHTML = `<div id="${id}" class="shelterluv-embed"></div>`;
  const s = document.createElement('script');
  s.src = shelterluv.script;
  s.onload = () => window.EmbedAvailablePets(id, shelterluv.gid, {}, 0, shelterluv.domain, '', 2);
  s.onerror = () => { target.innerHTML = fallback(); };
  document.head.appendChild(s);
}

export async function loadCats(target, limit) {
  try {
    const r = await fetch('/api/shelterluv');
    if (!r.ok) throw 0;
    const cats = (await r.json()).slice(0, limit || 999);
    if (!cats.length) throw 0;
    target.innerHTML = renderCatCards(cats, adoptUrl);
  } catch {
    if (limit) target.innerHTML = teaser();
    else mountEmbed(target);
  }
}

const catGrid = document.querySelector('[data-cats]');
if (catGrid) loadCats(catGrid, Number(catGrid.dataset.limit) || undefined);

const catDetail = document.querySelector('[data-cat-detail]');
if (catDetail) {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) {
    catDetail.innerHTML = '<div class="notice"><h2>Cat not found</h2><p><a href="/adopt.html">See all adoptable cats</a>.</p></div>';
  } else {
    try {
      const r = await fetch(`/api/shelterluv/${encodeURIComponent(id)}`);
      if (!r.ok) throw 0;
      catDetail.innerHTML = renderCatDetail(await r.json(), adoptUrl);
    } catch {
      catDetail.innerHTML = fallback();
    }
  }
}
