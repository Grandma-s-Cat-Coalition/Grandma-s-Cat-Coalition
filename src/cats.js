// Pure rendering for ShelterLuv cats. Kept DOM-free so tests can run it in Node.
// Every API-sourced string is escaped before it reaches innerHTML — third-party
// data must never be injectable (spec 01 review, criterion 5).
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Only allow http(s) URLs from the API; anything else falls back.
export const safeUrl = (url, fallback) => /^https?:\/\//i.test(url || '') ? esc(url) : fallback;

export function renderCatCards(cats, adoptUrl) {
  return cats.map(c => {
    const name = esc(c.name);
    const meta = [c.age, c.sex, c.breed].filter(Boolean).map(esc).join(' · ');
    return `<article class="card"><img src="${safeUrl(c.photo, '/images/brand/grandma-and-cat.jpg')}" alt="${name}, an adoptable cat" width="600" height="450"><h3>${name}</h3><p>${meta}</p><p>${esc(c.description)}</p><a class="button" href="${safeUrl(c.profileUrl, esc(adoptUrl))}">Meet ${name}</a></article>`;
  }).join('');
}
