import './styles.css';
import { renderCatCards } from './cats.js';

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

// Adoptable cats from ShelterLuv
const adoptUrl = 'https://new.shelterluv.com/matchme/adopt/GCCI/Cat';
const fallback = () => `<div class="notice"><h3>Our cat list is taking a catnap.</h3><p>You can still <a href="${adoptUrl}">see available cats and apply through ShelterLuv</a>.</p></div>`;

export async function loadCats(target, limit) {
  try {
    const r = await fetch('/api/shelterluv');
    if (!r.ok) throw 0;
    const cats = (await r.json()).slice(0, limit || 999);
    target.innerHTML = renderCatCards(cats, adoptUrl) || fallback();
  } catch {
    target.innerHTML = fallback();
  }
}

const catGrid = document.querySelector('[data-cats]');
if (catGrid) loadCats(catGrid, Number(catGrid.dataset.limit) || undefined);
