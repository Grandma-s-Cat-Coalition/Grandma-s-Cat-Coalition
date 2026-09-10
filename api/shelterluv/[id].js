const pick = (obj, names) => names.map(name => obj?.[name]).find(value => value !== undefined && value !== null && value !== '') || '';
const authHeaders = key => ({ Authorization: `Bearer ${key}`, 'X-Api-Key': key });
const dateFromUnix = seconds => seconds ? new Date(Number(seconds) * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : '';
const daysSince = seconds => seconds ? Math.max(0, Math.floor((Date.now() - Number(seconds) * 1000) / 86400000)) : 0;
const ageFromBirthday = seconds => {
  if (!seconds) return '';
  const birth = new Date(Number(seconds) * 1000);
  const now = new Date();
  let months = (now.getUTCFullYear() - birth.getUTCFullYear()) * 12 + now.getUTCMonth() - birth.getUTCMonth();
  if (now.getUTCDate() < birth.getUTCDate()) months -= 1;
  if (months < 0) return '';
  const anchor = new Date(Date.UTC(birth.getUTCFullYear(), birth.getUTCMonth() + months, birth.getUTCDate()));
  const weeks = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - anchor.getTime()) / 604800000);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return [years ? `${years}Y` : '', remainingMonths ? `${remainingMonths}M` : '', weeks ? `${weeks}W` : ''].filter(Boolean).join('/');
};
const fee = group => Array.isArray(group) && group[0]?.Price !== undefined ? `$${Number(group[0].Price).toFixed(2).replace(/\.00$/, '')}` : '';
const profileUrl = a => a?.ID ? `https://new.shelterluv.com/matchme/adopt/GCCI/Cat/${encodeURIComponent(a.ID)}` : '';
const attributes = value => (Array.isArray(value) ? value : []).map(item => typeof item === 'string' ? item : item?.Name || item?.name || item?.label || '').filter(Boolean);
const textFrom = value => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(textFrom).find(Boolean) || '';
  return pick(value, ['Note', 'note', 'Memo', 'memo', 'Text', 'text', 'Body', 'body', 'Description', 'description', 'Value', 'value']);
};
const typeText = value => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(typeText).filter(Boolean).join(' ');
  return pick(value, ['Name', 'name', 'Label', 'label', 'Title', 'title', 'Type', 'type', 'Value', 'value']) || Object.values(value).map(typeText).filter(Boolean).join(' ');
};
const memoType = value => typeof value === 'string' ? '' : typeText(pick(value, ['Type', 'type', 'MemoType', 'memo_type', 'memoType', 'Category', 'category', 'Name', 'name', 'Label', 'label']));
const memos = a => ['Memos', 'memos', 'Memo', 'memo', 'AnimalMemos', 'animal_memos', 'AnimalMemo', 'animal_memo', 'Notes', 'notes'].flatMap(name => {
  const value = a?.[name];
  return Array.isArray(value) ? value : value ? [value] : [];
});
const foundMemo = a => memos(a).map(memo => ({ type: memoType(memo), text: textFrom(memo) })).find(({ type, text }) => text && /found|origin|source|history|intake|where/i.test(`${type} ${text}`))?.text || '';
const foundLocation = a => pick(a, ['FoundLocation', 'found_location', 'Found Location', 'FoundAddress', 'found_address', 'Found Address', 'LostFoundAddress', 'lost_found_address', 'Lost/Found Address', 'IntakeFoundLocation', 'intake_found_location', 'Intake Found Location', 'Origin', 'origin', 'OriginalOrigin', 'original_origin', 'Source', 'source', 'IntakeSource', 'intake_source', 'HistoryNote', 'history_note', 'History Note']) || foundMemo(a);

const mapAnimal = a => ({
  id: pick(a, ['Internal-ID', 'ID']),
  animalId: pick(a, ['ID']),
  name: pick(a, ['Name', 'name']),
  photo: pick(a, ['CoverPhoto', 'cover_photo', 'photo']),
  age: pick(a, ['Age', 'age']),
  sex: pick(a, ['Sex', 'sex']),
  breed: pick(a, ['Breed', 'breed']),
  weight: pick(a, ['CurrentWeightPounds']) ? `${pick(a, ['CurrentWeightPounds'])} lb` : '',
  adoptionFee: fee(a.AdoptionFeeGroup),
  intakeDate: dateFromUnix(pick(a, ['LastIntakeUnixTime'])),
  daysAtShelter: daysSince(pick(a, ['LastIntakeUnixTime'])),
  location: pick(a, ['Location', 'location']),
  foundLocation: foundLocation(a),
  attributes: attributes(a.Attributes || a.attributes),
  description: pick(a, ['Description', 'description', 'kennel_description']),
  profileUrl: profileUrl(a),
});

const htmlDecode = value => value.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&');
const publicAnimal = async id => {
  const r = await fetch(`https://new.shelterluv.com/embed/animal/${encodeURIComponent(id)}`);
  if (!r.ok) return {};
  const html = await r.text();
  const match = html.match(/:animal="([\s\S]*?)"/);
  if (!match) return {};
  try { return JSON.parse(htmlDecode(match[1])); } catch { return {}; }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.SHELTERLUV_API_KEY) return res.status(503).json({ error: 'ShelterLuv is not configured' });
  const id = String(req.query.id || '').replace(/[^\w.-]/g, '');
  if (!id) return res.status(400).json({ error: 'Missing animal id' });
  try {
    const r = await fetch(`https://new.shelterluv.com/api/v1/animals/${encodeURIComponent(id)}`, { headers: authHeaders(process.env.SHELTERLUV_API_KEY), cache: 'no-store' });
    if (!r.ok) throw 0;
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const raw = await r.json();
    const mapped = mapAnimal(raw);
    const publicId = String(mapped.animalId || raw.ID || '').includes('-') ? (mapped.animalId || raw.ID) : `GCCI-A-${mapped.animalId || raw.ID}`;
    const publicRecord = await publicAnimal(publicId);
    const supplemental = mapAnimal({
      ID: publicRecord.uniqueId,
      Name: publicRecord.name,
      Age: ageFromBirthday(publicRecord.birthday),
      Location: publicRecord.location,
      CurrentWeightPounds: publicRecord.weight_units === 'oz' ? Number(publicRecord.weight) / 16 : publicRecord.weight,
      Attributes: publicRecord.attributes,
      Description: publicRecord.description,
      kennel_description: publicRecord.kennel_description,
      CoverPhoto: publicRecord.photos?.find(photo => photo.isCover)?.url,
    });
    return res.status(200).json({ ...mapped,
      age: ageFromBirthday(publicRecord.birthday) || mapped.age,
      location: mapped.location || supplemental.location,
      foundLocation: mapped.foundLocation || supplemental.foundLocation,
      attributes: mapped.attributes.length ? mapped.attributes : supplemental.attributes,
      description: mapped.description || supplemental.description,
      weight: mapped.weight || supplemental.weight,
      photo: mapped.photo || supplemental.photo,
      daysAtShelter: mapped.daysAtShelter || daysSince(publicRecord.intake_date),
      photos: publicRecord.photos?.map(photo => photo.url).filter(Boolean) || [],
    });
  } catch {
    return res.status(502).json({ error: 'Unable to load animal' });
  }
}
