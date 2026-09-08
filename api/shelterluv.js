const authHeaders = key => ({ Authorization: `Bearer ${key}`, 'X-Api-Key': key });

const animalUrl = a => a?.ID ? `https://new.shelterluv.com/matchme/adopt/GCCI/Cat/${encodeURIComponent(a.ID)}` : '';
const daysSince = seconds => seconds ? Math.max(0, Math.floor((Date.now() - Number(seconds) * 1000) / 86400000)) : 0;
const ageFromBirthday = seconds => {
  if (!seconds) return '';
  const birth = new Date(Number(seconds) * 1000), now = new Date();
  let months = (now.getUTCFullYear() - birth.getUTCFullYear()) * 12 + now.getUTCMonth() - birth.getUTCMonth();
  if (now.getUTCDate() < birth.getUTCDate()) months -= 1;
  if (months < 0) return '';
  const anchor = new Date(Date.UTC(birth.getUTCFullYear(), birth.getUTCMonth() + months, birth.getUTCDate()));
  const weeks = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - anchor.getTime()) / 604800000);
  return [months >= 12 ? `${Math.floor(months / 12)}Y` : '', months % 12 ? `${months % 12}M` : '', weeks ? `${weeks}W` : ''].filter(Boolean).join('/');
};
const publicAnimal = async id => {
  const r = await fetch(`https://new.shelterluv.com/embed/animal/${encodeURIComponent(String(id).includes('-') ? id : `GCCI-A-${id}`)}`);
  if (!r.ok) return {};
  const match = (await r.text()).match(/:animal="([\s\S]*?)"/);
  if (!match) return {};
  try { return JSON.parse(match[1].replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&')); } catch { return {}; }
};

export default async function handler(req,res){if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});if(!process.env.SHELTERLUV_API_KEY)return res.status(503).json({error:'ShelterLuv is not configured'});try{const r=await fetch('https://new.shelterluv.com/api/v1/animals?status_type=publishable',{headers:authHeaders(process.env.SHELTERLUV_API_KEY),cache:'no-store'});if(!r.ok)throw 0;const raw=await r.json(),animals=raw.animals||raw;const cats=await Promise.all(animals.filter(a=>!a.Type||/cat/i.test(a.Type)).map(async a=>{const id=a.ID||a['Internal-ID'];const publicRecord=await publicAnimal(id);return {id:a['Internal-ID']||a.ID,name:a.Name||publicRecord.name,photo:a.CoverPhoto||publicRecord.photos?.find(photo=>photo.isCover)?.url,age:ageFromBirthday(publicRecord.birthday)||a.Age,sex:a.Sex||publicRecord.sex,breed:a.Breed||publicRecord.breed,description:a.Description||publicRecord.description||publicRecord.kennel_description,daysAtShelter:daysSince(publicRecord.intake_date),profileUrl:animalUrl(a)};}));res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');return res.status(200).json(cats)}catch{return res.status(502).json({error:'Unable to load animals'})}}
