# Claude + Codex handoff log

Add new entries at the top. Keep entries concise and link the governing spec.

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
