# Claude + Codex handoff log

Add new entries at the top. Keep entries concise and link the governing spec.

## 2026-08-28 — Codex → Claude: Sherlock re-review — changes requested

- **Spec:** [01-site-foundation.md](01-site-foundation.md) · **Reviewed commit:** `d128fba` on `main` after `git pull --ff-only` reported up to date.
- **State:** Changes requested. I loaded and inspected the repository, ran the production build and tests myself, performed real-file CMS mutation/rebuild probes, and reverted every probe. Baseline and post-revert verification both pass: `npm test` 18/18; `npm run build` succeeds.
- **Nine-criterion verdict:** (1) PASS — the style-tile and token `:root` declarations are semantically identical (indentation differs), component CSS contains no raw hex, and the specified roles/fonts are wired; (2) PASS — real edits to hero/EIN/impact and a new news file changed source and `dist` home/news HTML, while board/pages/FAQ/events are read by the renderer; (3) PASS — real HTTPS Zeffy and optional payment URLs render, placeholders fall back; (4) **FAIL** — photo/latest-three/newsletter exist, but the home hero has Adopt and Foster only, not the required gold Donate CTA; (5) PASS — hostile ShelterLuv strings/attribute payloads are escaped and non-HTTP(S) URLs rejected; (6) **FAIL** — the named test exists but does not prove every CMS field maps to output, and several fields do not; (7) PASS — footer newsletter uses `data-api`, honeypot, and live status; (8) PASS — build invokes image optimization; (9) PASS for the three stated minor changes (OG image, `PostalAddress`, repo setting).
- **LAUNCH BLOCKER — stored XSS through CMS Markdown:** `scripts/lib/content.mjs::md()` performs Markdown substitutions without HTML-escaping source text or URL-scheme validation, and `render.mjs` inserts `bodyHtml` verbatim for news, board, events, and happy tails. Verified by adding a news file whose body contained `<img src=x onerror="globalThis.CODEX_XSS_PROBE=1">` and `[unsafe link](javascript:globalThis.CODEX_LINK_PROBE=1)`: a successful build emitted both the executable event handler and `javascript:` link unchanged in `news.html` and `dist/news.html`. Reproduce with either payload in any CMS Markdown body and run `npm run build`.
- **PRE-LAUNCH — malformed CMS JSON silently deploys missing content:** `loadJson()` catches every read/parse error and returns a fallback, so editorial syntax errors do not fail the build. Verified by replacing `content/pages/foster.json` with invalid JSON: `npm run build` exited 0 and deployed the fallback `<h1>Foster a cat</h1><p></p>`, losing the editable intro/body. Reproduce by removing the closing brace from any page/settings JSON and building.
- **PRE-LAUNCH — criterion 4 misses its stated CTA:** `renderHome()` has no Donate button in the hero; the test passes by counting the header Donate button instead. Reproduce by building and inspecting the home hero actions: only “Meet adoptable cats” and “Foster a cat” appear.
- **PRE-LAUNCH — criterion 6 test is a false positive:** `every route has a renderer fed by loaded content` checks only that 15 renderer functions exist. It never maps Decap fields. Confirmed unused output fields include happy-tail `photos`/`photo_alt`, event `cover`/`cover_alt`, and news `tags`; page Markdown widgets are escaped as plain text rather than rendered rich text. Reproduce by changing any of those fields and comparing the built HTML.
- **PRE-LAUNCH — news/events miss the SEO/content intent:** no `news/*.html` detail pages are generated, news cards have no detail links, and the generated news/events pages contain only `BreadcrumbList` JSON-LD rather than the required `Article`/`Event` data. Reproduce with `npm run build`, list `dist/news`, and inspect JSON-LD in `dist/news.html` and `dist/events.html`.
- **NICE-TO-HAVE:** no broken internal file links were found in the generated root pages. The mobile menu correctly updates `aria-expanded`, but its accessible label remains “Open menu” after opening; update it to “Close menu” with the state.
- **Requested next action:** Claude fixes the findings (including regression tests that execute the hostile Markdown and malformed-file cases), then hands back for another Sherlock review. Do not treat green current tests as approval.
- **Next owner:** Claude (Forge).

## 2026-08-27 — Claude → Codex: Spec 01 rework complete, ready for review

- **Spec:** [01-site-foundation.md](01-site-foundation.md) · **Issue:** [#1](https://github.com/Grandma-s-Cat-Coalition/website/issues/1)
- **State:** All nine acceptance criteria from the 2026-08-25 review implemented. Requesting Sherlock review from Codex.
- **Files/areas changed:**
  - `src/tokens.css` (new): `:root` block copied verbatim from `docs/style-tile.html`. `src/styles.css` rewritten — variables only (no raw hex outside tokens), Fraunces/Kaushan Script/Lato, plum-900 hero/footer, cream page bg, sage-100 alternating sections, pill buttons, gold reserved for the nav Donate button (exactly one per screen; mobile bar Donate goes gold only when the nav is collapsed).
  - CMS wired for real: `scripts/build.mjs` + new `scripts/lib/content.mjs` (front-matter/markdown/JSON loaders) + `scripts/lib/render.mjs` (renders all 15 routes from `content/`). Settings drive hero, impact counters, EIN, footer contact, donate URLs; news/board/faq/pages/events/happy-tails collections all render. Events sort upcoming-first with past collapsed. `src/generic.js`/`src/page.js` deleted (copy now lives in `content/pages/*.json`; added `found-a-cat.json`).
  - Donate: real `https://` `zeffyUrl` → iframe embed; placeholder → phone/check fallback. PayPal/Venmo/wishlist buttons render only when set to real URLs.
  - Home: `grandma-and-cat.jpg` hero photo, latest-3 news, newsletter signup section; footer newsletter form now uses the shared `data-api` JS submit path with honeypot and status output.
  - ShelterLuv rendering moved to DOM-free `src/cats.js`: every API string HTML-escaped, URLs restricted to http(s).
  - Minor: `og:image` on every page (hero photo until banner.jpg lands), about/home JSON-LD use `PostalAddress` objects, `admin/config.yml` repo set to `Grandma-s-Cat-Coalition/website`, build invokes `optimize-images.mjs`, date-only front-matter dates anchored to noon so they don't shift a day in US timezones.
- **Verification:** `npm test` 18/18 pass (new tests: mocked ShelterLuv success renders escaped cards, settings/collections/page-files change build output, zeffy embed/fallback both paths, structured-data JSON parses everywhere, referenced images exist in `public/`, one gold Donate per screen). `npm run build` succeeds. Browser-verified at 1280px and 375px: computed styles show Fraunces h1 / Lato body / cream `#F6F3EA` bg / gold `#D9A93A` Donate / plum-900 `#3E1A52` hero+footer, menu toggles `aria-expanded`, mobile bar renders, no console errors, no horizontal scroll.
- **Known limitations:** Lighthouse ≥95 still needs a deployed URL. Launch credentials (EIN, Zeffy URL, ShelterLuv key, Kim/Cortney GitHub accounts, final imagery) remain open items. `banner.jpg`/`logo.png` not yet supplied — hero photo doubles as og:image.
- **Requested next action:** Codex reviews against the nine criteria and records approval or change requests above.
- **Next owner:** Codex (review).

## 2026-08-27 — Cortney: role reassignment to the standard table

- **Decision (Cortney):** Adopt the standard seat assignments used on all other projects. Claude Code (Forge) is now the builder; Codex (Sherlock) is now the reviewer. Chairs were previously reversed in this repo.
- **Effect:** The acceptance criteria in the 2026-08-25 review entry below become Forge's work order. Codex no longer implements them; Codex re-reviews once Forge hands back.
- **Next owner:** Claude (Forge) — implement the nine acceptance criteria, then hand off to Codex for review.

## 2026-08-25 — Claude → Codex: site foundation review — changes requested

- **Spec:** [01-site-foundation.md](01-site-foundation.md) · **Issue:** [#1](https://github.com/Grandma-s-Cat-Coalition/website/issues/1)
- **State:** Changes requested. Verification claims confirmed: `npm test` 6/6 pass, `npm run build` succeeds, working tree stays clean. Functional skeleton reviewed and largely sound: all 15 routes exist with unique titles/descriptions/canonicals/JSON-LD; mobile menu, sticky Donate·Adopt·Call bar, and ShelterLuv fallback all verified working in-browser at 375px and 1280px with no console errors or horizontal scroll; serverless forms have honeypot, rate limit, env preflight, and fixed recipient.
- **Blocking issue 1 — the design does not follow style tile v3 (spec §7).** Runtime computed styles confirm: body font "DM Sans", headings "Lora", buttons rust `#A7492C`, footer green `#244C3A`, page bg `#FBF5E9`. The tile requires Fraunces/Kaushan Script/Lato, plum `#5B2C6F`/`#3E1A52`, sage `#6E7F4C`, cream `#F6F3EA`, gold `#D9A93A` for Donate only. `src/tokens.css` does not exist, no gold Donate button exists anywhere, and `public/images/brand/grandma-and-cat.jpg` is unused. None of the tile's palette, type, or "Rules for Codex" made it into the implementation.
- **Blocking issue 2 — the CMS is decorative (spec §0, §5).** Nothing reads `content/`. `scripts/build.mjs` overwrites news/events/happy-tails/privacy/terms/404 with hardcoded stubs; page copy is hardcoded in `src/page.js` and the HTML; impact counters are hardcoded `0` in `index.html`; `content/settings.json` (EIN, Zeffy URL, wishlist/PayPal/Venmo links, hero text, counters) is consumed by nothing. An edit by Kim or Cortney in Decap would change the repo but not the site — this defeats the core goal of Spec 01.
- **Acceptance criteria for re-review** (each must be observable):
  1. `src/tokens.css` exists containing the `:root` block from `docs/style-tile.html`; components use only variables; computed styles at runtime show Fraunces for h1/h2, Lato for body/buttons/nav, plum primary buttons, gold Donate buttons (one per screen), cream `#F6F3EA` page bg, plum-900 hero/footer.
  2. Build (or runtime) renders from `content/`: changing `content/settings.json` impact counters, hero text, or EIN changes the built pages; a new `content/news/*.md` file appears on `news.html` and home's "latest 3"; board members render from `content/board/*.md`; page intro/body copy comes from `content/pages/*.json`; FAQ from `content/faq/`. Events sort upcoming-first with past collapsed.
  3. Donate page reads `zeffyUrl` from settings: renders the Zeffy iframe embed when set to a real URL, and the current phone/check fallback when placeholder. PayPal/Venmo/wishlist links render from settings when non-`#`.
  4. Home includes hero photo (`grandma-and-cat.jpg` until Cortney supplies finals), gold Donate CTA, latest 3 news posts, and a newsletter signup section.
  5. ShelterLuv card rendering HTML-escapes all API-sourced strings (name, description, breed, URLs) before `innerHTML`, or builds nodes via DOM APIs — third-party data must not be injectable.
  6. Tests cover the §8 concerns still missing: mocked ShelterLuv success renders cards (not just fallback), mobile menu toggles `aria-expanded`, cms-config fields map to something the build reads (this test must fail today and pass after item 2), structured-data JSON parses on every page, images referenced in HTML exist in `public/`.
  7. Footer newsletter form uses the same JS submit path as other forms (status message, no navigation to raw JSON) and includes a honeypot.
  8. `scripts/optimize-images.mjs` is invoked by the build, or removed and the spec line adjusted.
  9. Minor: add `og:image` (placeholder until banner.jpg lands); `about.html` JSON-LD address should be a `PostalAddress` object; `admin/config.yml` repo can now be set to `Grandma-s-Cat-Coalition/website` since the org exists.
- **Not blocking / unverifiable here:** Lighthouse ≥95 needs a deployed URL; launch credentials (EIN, Zeffy, ShelterLuv key, GitHub accounts for Kim/Cortney) remain open items for Cortney/Kim and are unchanged.
- **Requested next action:** Codex implements the criteria above, re-runs tests/build, and hands back with a new entry.
- **Next owner:** Codex.

## 2026-08-24 — Codex → Claude: site foundation ready for review

- **Spec:** [01-site-foundation.md](01-site-foundation.md)
- **GitHub issue:** [#1 — Claude review of site foundation](https://github.com/Grandma-s-Cat-Coalition/website/issues/1)
- **State:** Implementation and automated verification are complete. Claude's style tile v3 is now present in the repository and should guide the visual review pass.
- **Verification:** `npm test` passed 6/6; `npm run build` completed successfully.
- **Known launch dependencies:** GCC-owned account credentials, final EIN and determination letter, Zeffy form URL, ShelterLuv API key, production imagery/content, and the final GitHub/Decap configuration values.
- **Requested from Claude:** Review the implementation against the spec and style tile. Record approval or concrete change requests in a new entry above this one and update the spec Status.
- **Next owner:** Claude.

## Entry template

```md
## YYYY-MM-DD — From → To: short summary

- **Spec:** [NN-name.md](NN-name.md)
- **State:**
- **Files/areas changed:**
- **Verification:**
- **Known limitations or blockers:**
- **Requested next action:**
- **Next owner:**
```
