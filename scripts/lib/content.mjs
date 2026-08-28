import { readFile, readdir } from 'node:fs/promises';

// Minimal front-matter + markdown support for Decap-authored content.
// Decap writes simple YAML (scalars and [a, b] lists) — that's all we parse.

function parseScalar(v) {
  v = v.trim();
  if (/^\[.*\]$/.test(v)) return v.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (v === 'true') return true;
  if (v === 'false') return false;
  return v.replace(/^['"]|['"]$/g, '');
}

export function parseFrontMatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kv) data[kv[1]] = parseScalar(kv[2]);
  }
  return { data, body: m[2].trim() };
}

export function md(text) {
  const inline = s => s
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return text.split(/\r?\n\s*\r?\n/).filter(Boolean).map(block => {
    block = block.trim();
    const h = block.match(/^(#{2,3})\s+(.*)$/);
    if (h) return `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`;
    if (/^[-*]\s/m.test(block)) return `<ul>${block.split(/\r?\n/).map(l => `<li>${inline(l.replace(/^[-*]\s+/, ''))}</li>`).join('')}</ul>`;
    return `<p>${inline(block.replace(/\r?\n/g, ' '))}</p>`;
  }).join('');
}

export async function loadCollection(dir) {
  let files = [];
  try { files = (await readdir(dir)).filter(f => f.endsWith('.md')); } catch { return []; }
  const items = await Promise.all(files.map(async f => {
    const { data, body } = parseFrontMatter(await readFile(`${dir}/${f}`, 'utf8'));
    return { slug: f.replace(/\.md$/, ''), ...data, bodyHtml: md(body) };
  }));
  return items;
}

export async function loadJson(path, fallback = null) {
  try { return JSON.parse(await readFile(path, 'utf8')); } catch { return fallback; }
}

// Everything the page templates need, loaded once.
export async function loadContent(root = '.') {
  const [settings, news, events, board, happyTails, fosterFaq] = await Promise.all([
    loadJson(`${root}/content/settings.json`, {}),
    loadCollection(`${root}/content/news`),
    loadCollection(`${root}/content/events`),
    loadCollection(`${root}/content/board`),
    loadCollection(`${root}/content/happy-tails`),
    loadJson(`${root}/content/faq/foster.json`, []),
  ]);
  const pages = {};
  try {
    for (const f of (await readdir(`${root}/content/pages`)).filter(f => f.endsWith('.json')))
      pages[f.replace(/\.json$/, '')] = await loadJson(`${root}/content/pages/${f}`, {});
  } catch { /* no pages dir */ }
  news.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  happyTails.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  board.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  events.sort((a, b) => String(a.start).localeCompare(String(b.start)));
  return { settings, news, events, board, happyTails, fosterFaq, pages };
}
