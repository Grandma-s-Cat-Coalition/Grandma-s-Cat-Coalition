const pick = (obj, names) => names.map(name => obj?.[name]).find(value => value !== undefined && value !== null && value !== '') || '';
const authHeaders = key => ({ Authorization: `Bearer ${key}`, 'X-Api-Key': key });
const dateFromUnix = seconds => seconds ? new Date(Number(seconds) * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : '';
const fee = group => Array.isArray(group) && group[0]?.Price !== undefined ? `$${Number(group[0].Price).toFixed(2).replace(/\.00$/, '')}` : '';
const profileUrl = a => a?.ID ? `https://new.shelterluv.com/matchme/adopt/GCCI/Cat/${encodeURIComponent(a.ID)}` : '';

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
  description: pick(a, ['Description', 'description']),
  profileUrl: profileUrl(a),
});

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.SHELTERLUV_API_KEY) return res.status(503).json({ error: 'ShelterLuv is not configured' });
  const id = String(req.query.id || '').replace(/[^\w.-]/g, '');
  if (!id) return res.status(400).json({ error: 'Missing animal id' });
  try {
    const r = await fetch(`https://new.shelterluv.com/api/v1/animals/${encodeURIComponent(id)}`, { headers: authHeaders(process.env.SHELTERLUV_API_KEY) });
    if (!r.ok) throw 0;
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    return res.status(200).json(mapAnimal(await r.json()));
  } catch {
    return res.status(502).json({ error: 'Unable to load animal' });
  }
}
