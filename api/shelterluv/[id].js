const pick = (obj, names) => {
  for (const name of names) {
    const value = obj?.[name];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
};

const mapAnimal = a => ({
  id: pick(a, ['ID', 'id']),
  animalId: pick(a, ['InternalId', 'InternalID', 'AnimalId', 'AnimalID', 'ID', 'id']),
  name: pick(a, ['Name', 'name']),
  photo: pick(a, ['CoverPhoto', 'cover_photo', 'photo']),
  age: pick(a, ['Age', 'age']),
  sex: pick(a, ['Sex', 'sex']),
  breed: pick(a, ['Breed', 'breed']),
  weight: pick(a, ['Weight', 'weight', 'CurrentWeight']),
  adoptionFee: pick(a, ['AdoptionFee', 'adoption_fee', 'Fee']),
  intakeDate: pick(a, ['IntakeDate', 'intake_date', 'CreatedDate']),
  description: pick(a, ['Description', 'description']),
  profileUrl: pick(a, ['ProfileUrl', 'ProfileURL', 'profile_url']),
});

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.SHELTERLUV_API_KEY) return res.status(503).json({ error: 'ShelterLuv is not configured' });
  const id = String(req.query.id || '').replace(/[^\w.-]/g, '');
  if (!id) return res.status(400).json({ error: 'Missing animal id' });
  try {
    const r = await fetch('https://www.shelterluv.com/api/v1/animals?status_type=publishable', { headers: { 'X-Api-Key': process.env.SHELTERLUV_API_KEY } });
    if (!r.ok) throw 0;
    const raw = await r.json();
    const animals = raw.animals || raw;
    const animal = animals.find(a => String(pick(a, ['ID', 'id'])) === id);
    if (!animal) return res.status(404).json({ error: 'Animal not found' });
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    return res.status(200).json(mapAnimal(animal));
  } catch {
    return res.status(502).json({ error: 'Unable to load animal' });
  }
}
