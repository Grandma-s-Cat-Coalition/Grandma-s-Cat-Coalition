import { readFile, readdir } from 'node:fs/promises';

// Minimal front-matter + markdown support for Decap-authored content.
// Decap writes simple YAML (scalars, [a, b] inline lists, and block lists).

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Link targets are restricted to safe schemes. CMS content is NOT trusted —
// an editor (or anyone who opens a PR) must not be able to inject javascript:/data: URLs.
const safeHref = url => /^(https?:\/\/|mailto:|\/|#)/i.test(String(url).trim()) ? String(url).trim() : '#';

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
  const lines = m[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const kv = lines[i].match(/^(\w[\w-]*):\s*(.*)$/);
    if (!kv) continue;
    const [, key, rawVal] = kv;
    if (rawVal === '') {
      // Block list: subsequent indented "- item" lines.
      const items = [];
      while (i + 1 < lines.length && /^\s+-\s+/.test(lines[i + 1])) items.push(parseScalar(lines[++i].replace(/^\s+-\s+/, '')));
      data[key] = items.length ? items : '';
    } else {
      data[key] = parseScalar(rawVal);
    }
  }
  return { data, body: m[2].trim() };
}

// Markdown → HTML. HTML in the source is escaped FIRST, so a body containing
// `<img onerror=...>` renders as inert text, not an executable element.
export function md(text) {
  const inline = s => s
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => `<a href="${safeHref(u)}">${t}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return esc(text).split(/\r?\n\s*\r?\n/).filter(Boolean).map(block => {
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
  return Promise.all(files.map(async f => {
    const { data, body } = parseFrontMatter(await readFile(`${dir}/${f}`, 'utf8'));
    return { slug: f.replace(/\.md$/, ''), ...data, bodyHtml: md(body) };
  }));
}

// Missing file → fallback (optional content). Present-but-malformed → throw,
// so an editorial JSON syntax error fails the build instead of silently
// deploying empty content.
export async function loadJson(path, fallback = null) {
  let text;
  try { text = await readFile(path, 'utf8'); } catch { return fallback; }
  try { return JSON.parse(text); } catch (e) { throw new Error(`Malformed JSON in ${path}: ${e.message}`); }
}

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
  let pageFiles = [];
  try { pageFiles = (await readdir(`${root}/content/pages`)).filter(f => f.endsWith('.json')); } catch { /* no pages dir */ }
  // Loaded outside the try/catch so a malformed page file throws (fails the build)
  // instead of being silently swallowed as a "missing directory".
  for (const f of pageFiles) pages[f.replace(/\.json$/, '')] = await loadJson(`${root}/content/pages/${f}`, {});
  news.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  happyTails.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  board.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  events.sort((a, b) => String(a.start).localeCompare(String(b.start)));
  return { settings, news, events, board, happyTails, fosterFaq, pages };
}
