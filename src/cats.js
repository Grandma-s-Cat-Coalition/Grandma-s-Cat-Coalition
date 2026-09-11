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
  const seed = [...name].reduce((total, character) => total + character.charCodeAt(0), 0);
  const style = seed % 5;
  const attributes = Array.isArray(cat.attributes) ? cat.attributes : [];
  const has = value => attributes.some(attribute => attribute.toLowerCase() === value.toLowerCase());
  const traits = ['Affectionate', 'Cuddly', 'Lap Cat', 'Purr Machine', 'Playful', 'Talkative', 'Sweet', 'Gentle', 'Calm', 'Shy', 'Curious'].filter(has);
  const compatibility = [has('Good with Cats') && 'other cats', has('Good with Dogs') && 'dogs', (has('Good with Kids') || has('Good with Children')) && 'children'].filter(Boolean);
  const opening = [
    age ? `Hi, I’m ${name}, and I’m ${age} old.` : `Hi, I’m ${name}.`,
    age ? `My name is ${name}, and at ${age} old, I’m still writing the sweetest part of my story.` : `My name is ${name}, and I’m still writing the sweetest part of my story.`,
    age ? `Hello from ${name}! I’m ${age} old and ready for somebody to fall in love with me.` : `Hello from ${name}! I’m ready for somebody to fall in love with me.`,
    age ? `I’m ${name}, ${age} old, and I have been waiting for the right heart to find mine.` : `I’m ${name}, and I have been waiting for the right heart to find mine.`,
    age ? `Hi there, I’m ${name}. I may be only ${age} old, but I already know I’m meant to be somebody’s whole heart.` : `Hi there, I’m ${name}, and I know I’m meant to be somebody’s whole heart.`,
  ][style];
  const traitList = traits.map(trait => trait.toLowerCase());
  const list = items => items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items[0] || '';
  const traitSentence = traitList.length ? [
    `People say I’m ${list(traitList)}, which is really just a fancy way of saying I have so much love to give.`,
    `I’m the ${list(traitList)} kind of cat who can make an ordinary day feel a little softer.`,
    `If you are hoping for ${list(traitList)} energy in your home, I might be your purrfect match.`,
    `My personality is all ${list(traitList)}, and I would love to share that with a family of my own.`,
    `I bring a sweet mix of ${list(traitList)} charm, and I am saving all of it for someone special.`,
  ][style] : '';
  const homeSentence = compatibility.length ? [
    `I genuinely enjoy spending time with ${list(compatibility)}, so I could settle into a home with plenty of love already in it.`,
    `I have room in my heart for ${list(compatibility)}, which makes dreaming about a furever family even easier.`,
    `I do well with ${list(compatibility)}, and I would love a home where everyone has a little love to give me back.`,
    `A house with ${list(compatibility)} sounds just fine to me, as long as there is a cozy spot with my name on it.`,
    `I am comfortable around ${list(compatibility)}, and I am ready to become part of the everyday rhythm of a real home.`,
  ][style] : '';
  const careSentence = has('Litter Box Trained') ? [
    `I’m litter-box trained, so you can skip the hard parts and jump right into the fun.`,
    `The litter-box part? Already handled. That leaves more time for cuddles, playtime, and falling in love.`,
    `I already know my litter-box manners, which means we can get straight to the good stuff.`,
    `I have my litter-box routine down, so settling in with me should feel a little easier from day one.`,
    `I’m tidy with my litter box, leaving us free to focus on the happy parts of starting life together.`,
  ][style] : '';
  const memoSentences = String(cat.description || '')
    .split(/(?<=[.!?])\s+|\n+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);
  const foundFromDescription = memoSentences.find(sentence => /^(?:was\s+)?found\s+(?:at|near|in|on|under|outside|by|from)\b/i.test(sentence)) || '';
  const sourceDescription = memoSentences.filter(sentence => sentence !== foundFromDescription).join(' ').trim().replace(/[.!?]+$/, '');
  const cleanedDescription = sourceDescription
    ? (sourceDescription.charAt(0).toLowerCase() + sourceDescription.slice(1))
      .replace(/\bloves\b/gi, 'love').replace(/\bis\b/gi, 'am').replace(/\bhas\b/gi, 'have')
    : '';
  const descriptionSentence = sourceDescription ? [
    ` I am incredibly ${cleanedDescription.replace(/^very\s+/i, '')}.`,
    ` I have a heart full of love, and I’m ${cleanedDescription}.`,
    ` One thing you should know about me? I’m ${cleanedDescription}.`,
    ` If you ask what makes me special, I’d say this: I’m ${cleanedDescription}.`,
    ` My little heart is happiest when I get to show you that I’m ${cleanedDescription}.`,
  ][style] : '';
  const foundLocation = String(cat.foundLocation || foundFromDescription).trim().replace(/[.!?]+$/, '');
  const foundStory = foundLocation
    .replace(/^(?:found|located|discovered|rescued)\s+/i, '')
    .replace(/^(?:found|located|discovered|rescued)\s*/i, '')
    .trim();
  const foundPlace = /^(?:at|near|in|on|under|from|outside|by)\b/i.test(foundStory) ? foundStory : `near ${foundStory}`;
  const foundSentence = foundStory ? [
    `My story started when I was found ${foundPlace}, and now I’m ready for the purrfect place to call home.`,
    `I was found ${foundPlace}, and I’m hoping the next chapter of my story is a soft landing with someone who loves me.`,
    `I came to Grandma’s Cat Coalition after being found ${foundPlace}; now I’m just waiting for my furever person to notice me.`,
    `Somebody found me ${foundPlace}, and that moment gave me a second chance I would love to spend with you.`,
    `I was brought here after being found ${foundPlace}; now I am ready for the part where I finally belong.`,
  ][style] : '';
  const waitingDays = Number(cat.daysAtShelter) || 0;
  const waitingSentence = waitingDays >= 180 ? [
    'I have been here so long I have cabin fever; this place is kind, but I want a home, not temporary shelter.',
    'I have watched a lot of days pass from here, and I am more than ready for a real home of my own.',
    'I have been waiting for so long that my heart is starting to feel overdue for its person.',
    'This place has cared for me, but I have been here long enough to know I want a couch, a window, and a human who calls me theirs.',
    'I have been here a very long time, and I am so ready for the quiet magic of being chosen.',
  ][style] : waitingDays >= 90 ? [
    'I have been here for many months. This place is great and all, but I am ready to find my person. Are you it?',
    'After many months of waiting, I still believe my person is out there looking for me too.',
    'I have spent many months here dreaming about the day someone sees me and says, “That one is mine.”',
    'I have been patient for many months, but my little heart is ready to unpack itself in a furever home.',
    'Many months is a long time to wait for love, and I am hoping my turn is finally close.',
  ][style] : waitingDays >= 28 ? [
    'I have been here for a month now. I like it here, but I would love to find my furever home.',
    'A month is long enough to know I am grateful for this place, and even more ready for a family.',
    'I have spent about a month waiting, practicing my hopeful little face for the person who comes for me.',
    'I have been here a month, and I am starting to wonder if today might be the day my person finds me.',
    'After a month here, I am ready for my story to move from “waiting” to “home.”',
  ][style] : waitingDays >= 7 ? [
    'I have been here for a few weeks, and I am hoping my person finds me soon.',
    'I have only been waiting a few weeks, but I am already dreaming about a home with my name in it.',
    'A few weeks here have been safe and kind, and now I am ready to see what furever feels like.',
    'I have been here a few weeks, just long enough to start wondering who will choose me.',
    'It has been a few weeks, and I keep hoping the next hello is the one that changes everything.',
  ][style] : waitingDays > 0 ? [
    'I have only been here a little while, but I am already hoping to meet my furever family.',
    'I am still pretty new here, but I already know I would rather be settling into a home.',
    'I just arrived not long ago, and I am keeping my paws crossed for a quick love story.',
    'I have not been here long, but my heart is already looking for somewhere to land.',
    'I am new to this chapter, and I would love for it to lead straight to you.',
  ][style] : '';
  const closing = [
    'I’m hoping to meet someone special who will love me for life.',
    'If you are looking for a new family member, I would love to meet you.',
    'I’m ready for a home where I can be loved, spoiled, and part of the family.',
    'Maybe I am the little someone your home has been missing.',
    'Come meet me, and let’s see if we are the beginning of something wonderful.',
  ][style];
  const pieces = [
    opening,
    descriptionSentence.trim(),
    traitSentence,
    homeSentence,
    careSentence,
    foundSentence,
    waitingSentence,
    closing,
  ].filter(Boolean);
  return pieces.join(' ');
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
