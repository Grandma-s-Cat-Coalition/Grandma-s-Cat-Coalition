const pick = (obj, names) => names.map(name => obj?.[name]).find(value => value !== undefined && value !== null && value !== '') || '';
const authHeaders = key => ({ Authorization: `Bearer ${key}`, 'X-Api-Key': key });
const dateFromUnix = seconds => seconds ? new Date(Number(seconds) * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : '';
const fee = group => Array.isArray(group) && group[0]?.Price !== undefined ? `$${Number(group[0].Price).toFixed(2).replace(/\.00$/, '')}` : '';
const profileUrl = a => a?.ID ? `https://new.shelterluv.com/matchme/adopt/GCCI/Cat/${encodeURIComponent(a.ID)}` : '';
const attributes = value => (Array.isArray(value) ? value : []).map(item => typeof item === 'string' ? item : item?.Name || item?.name || item?.label || '').filter(Boolean);

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
  location: pick(a, ['Location', 'location']),
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
    const r = await fetch(`https://new.shelterluv.com/api/v1/animals/${encodeURIComponent(id)}`, { headers: authHeaders(process.env.SHELTERLUV_API_KEY) });
    if (!r.ok) throw 0;
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    const raw = await r.json();
    const mapped = mapAnimal(raw);
    const publicRecord = await publicAnimal(mapped.animalId || raw.ID);
    const supplemental = mapAnimal({
      ID: publicRecord.uniqueId,
      Name: publicRecord.name,
      Location: publicRecord.location,
      CurrentWeightPounds: publicRecord.weight_units === 'oz' ? Number(publicRecord.weight) / 16 : publicRecord.weight,
      Attributes: publicRecord.attributes,
      Description: publicRecord.description,
      kennel_description: publicRecord.kennel_description,
      CoverPhoto: publicRecord.photos?.find(photo => photo.isCover)?.url,
    });
    return res.status(200).json({ ...mapped,
      location: mapped.location || supplemental.location,
      attributes: mapped.attributes.length ? mapped.attributes : supplemental.attributes,
      description: mapped.description || supplemental.description,
      weight: mapped.weight || supplemental.weight,
      photo: mapped.photo || supplemental.photo,
    });
  } catch {
    return res.status(502).json({ error: 'Unable to load animal' });
  }
}
