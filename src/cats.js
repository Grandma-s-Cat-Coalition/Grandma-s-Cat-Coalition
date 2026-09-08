// Pure rendering for ShelterLuv cats. Kept DOM-free so tests can run it in Node.
// Every API-sourced string is escaped before it reaches innerHTML — third-party
// data must never be injectable (spec 01 review, criterion 5).
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Only allow http(s) URLs from the API; anything else falls back.
export const safeUrl = (url, fallback) => /^https?:\/\//i.test(url || '') ? esc(url) : fallback;
const safeId = id => encodeURIComponent(String(id ?? '').replace(/[^\w.-]/g, ''));

export function formatAge(age) {
  const value = String(age ?? '').trim();
  if (!value) return '';
  const parts = [];
  const pattern = /(\d+)\s*Y(?:EARS?)?|\b(\d+)\s*M(?:ONTHS?)?|\b(\d+)\s*W(?:EEKS?)?/gi;
  let match;
  while ((match = pattern.exec(value))) {
    const amount = match[1] ?? match[2] ?? match[3];
    const unit = match[1] !== undefined ? 'year' : match[2] !== undefined ? 'month' : 'week';
    parts.push(`${amount} ${unit}${amount === '1' ? '' : 's'}`);
  }
  if (parts.length) return parts.join(', ');
  if (/^\d+(?:\.\d+)?$/.test(value)) return `${value} years`;
  return value;
}

export function buildCatBio(cat) {
  const name = String(cat.name || 'this cat');
  const age = formatAge(cat.age);
  const type = [cat.sex?.toLowerCase(), cat.breed].filter(Boolean).join(' ');
  const seed = [...name].reduce((total, character) => total + character.charCodeAt(0), 0);
  const attributes = Array.isArray(cat.attributes) ? cat.attributes : [];
  const has = value => attributes.some(attribute => attribute.toLowerCase() === value.toLowerCase());
  const traits = ['Affectionate', 'Cuddly', 'Lap Cat', 'Purr Machine', 'Playful', 'Talkative', 'Sweet', 'Gentle', 'Calm', 'Shy', 'Curious'].filter(has);
  const compatibility = [has('Good with Cats') && 'other cats', has('Good with Dogs') && 'dogs', (has('Good with Kids') || has('Good with Children')) && 'children'].filter(Boolean);
  const opening = ['Hi! I’m', 'Hello, I’m', 'Hi there! My name is'][seed % 3];
  const identity = age && type ? `${age} old and a ${type}` : age ? `${age} old` : type || 'an adoptable cat';
  const traitSentence = traits.length ? ` People here describe me as ${traits.slice(0, -1).join(', ')}${traits.length > 1 ? ' and ' : ''}${traits.at(-1).toLowerCase()}.` : '';
  const homeSentence = compatibility.length ? ` I do well with ${compatibility.slice(0, -1).join(', ')}${compatibility.length > 1 ? ' and ' : ''}${compatibility.at(-1)}.` : '';
  const careSentence = has('Litter Box Trained') ? ` I’m also litter-box trained, so I’m ready to settle into home life.` : '';
  const sourceDescription = String(cat.description || '').trim().replace(/[.!?]+$/, '');
  const descriptionSentence = sourceDescription ? ` My foster notes say I’m ${sourceDescription.charAt(0).toLowerCase()}${sourceDescription.slice(1).replace(/\bloves\b/gi, 'love').replace(/\bis\b/gi, 'am')}.` : '';
  const waitingDays = Number(cat.daysAtShelter) || 0;
  const waitingSentence = waitingDays >= 180 ? ' I have been here so long I have cabin fever — this place is great, but I want a home, not temporary shelter.' : waitingDays >= 90 ? ' I have been here for many months. This place is great and all, but I’m ready to find my person — are you it?' : waitingDays >= 28 ? ' I have been here for a month now. I like it here, but I would love to find my furever home.' : waitingDays >= 7 ? ' I have been here for a few weeks, and I’m hoping my person finds me soon.' : waitingDays > 0 ? ' I have only been here a little while, but I’m already hoping to meet my furever family.' : '';
  const closing = ['I’m hoping to meet someone special who will love me for life.', 'If you’re looking for a new family member, I’d love to meet you.', 'I’m ready for a home where I can be loved, spoiled, and part of the family.'][seed % 3];
  return `${opening} ${name}, ${identity}.${descriptionSentence}${traitSentence}${homeSentence}${careSentence}${waitingSentence} ${closing}`;
}

export function renderCatCards(cats, adoptUrl) {
  return cats.map(c => {
    const name = esc(c.name);
    const meta = [formatAge(c.age), c.sex, c.breed].filter(Boolean).map(esc).join(' · ');
    const href = c.id ? `/meet-cat.html?id=${safeId(c.id)}` : safeUrl(c.profileUrl, esc(adoptUrl));
    return `<article class="card"><img src="${safeUrl(c.photo, '/images/brand/grandma-and-cat.jpg')}" alt="${name}, an adoptable cat" width="600" height="450"><h3>${name}</h3><p>${meta}</p><p>${esc(buildCatBio(c))}</p><a class="button" href="${href}">Meet ${name}</a></article>`;
  }).join('');
}

export function renderCatDetail(cat, adoptUrl) {
  const name = esc(cat.name || 'Adoptable cat');
  const photos = Array.isArray(cat.photos) && cat.photos.length ? cat.photos : [cat.photo];
  const gallery = photos.filter(Boolean).map((photo, index) => `<img src="${safeUrl(photo, '/images/brand/grandma-and-cat.jpg')}" alt="${name}, photo ${index + 1}" width="900" height="675" loading="${index ? 'lazy' : 'eager'}">`).join('');
  const facts = [
    ['Breed', cat.breed],
    ['Sex', cat.sex],
    ['Weight', cat.weight],
    ['Age', formatAge(cat.age)],
    ['Adoption Fee', cat.adoptionFee],
    ['Intake Date', cat.intakeDate],
  ].filter(([, value]) => value).map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('');
  const description = `<p>${esc(buildCatBio(cat))}</p>`;
  const allFacts = facts;
  const attributes = Array.isArray(cat.attributes) ? cat.attributes.filter(Boolean).map(attribute => `<li>${esc(attribute)}</li>`).join('') : '';
  const attributeSection = attributes ? `<section class="cat-attributes"><h3>Good to know</h3><ul>${attributes}</ul></section>` : '';
  return `<article class="cat-detail"><div class="cat-gallery">${gallery}</div><div><p class="eyebrow">${esc([formatAge(cat.age), cat.sex, cat.breed].filter(Boolean).join(' · '))}</p><h2>${name}</h2>${description}${attributeSection}${allFacts ? `<dl class="facts">${allFacts}</dl>` : ''}<p class="actions"><a class="button" href="${safeUrl(cat.profileUrl, esc(adoptUrl))}">Apply through ShelterLuv</a><a class="button soft" href="/adopt.html">All adoptable cats</a></p></div></article>`;
}
