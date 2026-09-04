// Pure rendering for ShelterLuv cats. Kept DOM-free so tests can run it in Node.
// Every API-sourced string is escaped before it reaches innerHTML — third-party
// data must never be injectable (spec 01 review, criterion 5).
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Only allow http(s) URLs from the API; anything else falls back.
export const safeUrl = (url, fallback) => /^https?:\/\//i.test(url || '') ? esc(url) : fallback;
const safeId = id => encodeURIComponent(String(id ?? '').replace(/[^\w.-]/g, ''));

export function renderCatCards(cats, adoptUrl) {
  return cats.map(c => {
    const name = esc(c.name);
    const meta = [c.age, c.sex, c.breed].filter(Boolean).map(esc).join(' · ');
    const href = c.id ? `/meet-cat.html?id=${safeId(c.id)}` : safeUrl(c.profileUrl, esc(adoptUrl));
    return `<article class="card"><img src="${safeUrl(c.photo, '/images/brand/grandma-and-cat.jpg')}" alt="${name}, an adoptable cat" width="600" height="450"><h3>${name}</h3><p>${meta}</p><p>${esc(c.description)}</p><a class="button" href="${href}">Meet ${name}</a></article>`;
  }).join('');
}

export function renderCatDetail(cat, adoptUrl) {
  const name = esc(cat.name || 'Adoptable cat');
  const facts = [
    ['Animal ID', cat.animalId || cat.id],
    ['Breed', cat.breed],
    ['Sex', cat.sex],
    ['Weight', cat.weight],
    ['Age', cat.age],
    ['Adoption Fee', cat.adoptionFee],
    ['Intake Date', cat.intakeDate],
  ].filter(([, value]) => value).map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('');
  return `<article class="cat-detail"><div><img src="${safeUrl(cat.photo, '/images/brand/grandma-and-cat.jpg')}" alt="${name}, an adoptable cat" width="900" height="675"></div><div><p class="eyebrow">${esc([cat.age, cat.sex, cat.breed].filter(Boolean).join(' · '))}</p><h2>${name}</h2><p>${esc(cat.description || "This cat is available through Grandma's Cat Coalition. Check ShelterLuv for the latest application status.")}</p>${facts ? `<dl class="facts">${facts}</dl>` : ''}<p class="actions"><a class="button" href="${safeUrl(cat.profileUrl, esc(adoptUrl))}">Apply through ShelterLuv</a><a class="button soft" href="/adopt.html">All adoptable cats</a></p></div></article>`;
}
