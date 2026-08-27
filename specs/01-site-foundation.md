# Spec 01 — Site Foundation: stack, structure, pages, admin, deploy

**Status:** 🟠 Changes requested — Claude review 2026-08-25: functional skeleton sound, but design does not follow style tile v3 and CMS content is not wired into the build. See HANDOFF.md entry for acceptance criteria. Owner: Claude (roles flipped 2026-08-27).
**Owner:** Claude (spec/build) · Codex (review) · Cortney (approve)
**Read first:** `../BRIEF.md`

## 0. Goal

Replace the one-page GoDaddy site with a fast, SEO-ready static site that (a) has a working donate flow on day one, (b) shows adoptable cats live from ShelterLuv, and (c) lets Kim and Cortney edit content through a login-protected admin UI without touching code. $0/month beyond the domain.

## 1. Stack (match Shoreline / Elite — do not deviate without asking)

| Layer | Choice | Why |
|---|---|---|
| Build | **Vite**, plain HTML + CSS + JS modules (no React) | Same as Elite; fastest Lighthouse; Codex already has the pattern |
| Hosting | **Vercel** (new GCC account, free Hobby tier) | Same as Shoreline/Elite |
| Serverless | Vercel `api/*.js` functions | ShelterLuv proxy, contact form, CMS OAuth |
| Email | **Resend** (new GCC account) | Contact/volunteer notifications, same pattern as Shoreline `api/estimate.js` |
| CMS / admin | **Decap CMS** (`/admin`) with GitHub backend | Free, git-based, has a real login + WYSIWYG, no database. Content lives as Markdown/JSON in the repo so Codex/Claude can also edit it. |
| Donations | **Zeffy** embedded form (0% fees for 501(c)(3)) + PayPal/Venmo links as fallback | Free; Stripe-based alternatives take 2–3% |
| Animals | **ShelterLuv** stays system of record; we read via their public API | Kim already uses it |
| Analytics | Vercel Web Analytics + Google Search Console + GA4 | Free |
| Errors | **Skip for v1.** Sentry can be added later (Elite pattern) if forms/cat feed fail silently. | |

Repo: `github.com/<new-gcc-org>/website` — org and all accounts are **GCC-owned, separate from Powrful**. Cortney + Kim as org owners.

## 2. Repo layout

```
/
  index.html                 home
  adopt.html                 adoptable cats (ShelterLuv live)
  foster.html
  volunteer.html
  donate.html
  tnr.html                   what TNR is + request help
  about.html                 story, board, 501(c)(3), EIN
  found-a-cat.html
  happy-tails.html           success stories (CMS collection)
  news.html + news/*.html    blog/updates (CMS collection, prerendered)
  events.html
  contact.html
  privacy.html  terms.html  404.html
  admin/                     Decap CMS (index.html + config.yml)
  content/                   CMS-managed content (see §5)
  src/                       styles.css, main.js, components/*.js
  api/                       serverless functions (see §6)
  scripts/                   build + test scripts (Elite pattern)
  public/                    images, favicons, robots.txt, site.webmanifest
  vercel.json
  .env.example               names only, never values
  README.md  DEPLOYMENT.md   (copy the tone of Shoreline's DEPLOYMENT.md)
```

## 3. Global requirements

- Mobile-first, Lighthouse ≥ 95 on all four scores for every page.
- Every page: unique `<title>`, meta description, OG/Twitter tags, canonical, JSON-LD (`NGO` on home/about, `Event` on events, `Article` on news, `BreadcrumbList` everywhere).
- Sticky mobile bar: **Donate · Adopt · Call** (Elite's mobile-contact-bar pattern).
- Header nav: Adopt · Foster · Volunteer · TNR · About · News · **Donate (button style)**.
- Footer: address, phone, email (domain email once created — placeholder `info@grandmascatcoalition.org`), "Grandma's Cat Coalition is a 501(c)(3) nonprofit. EIN XX-XXXXXXX. Donations are tax-deductible." social links, newsletter signup, privacy/terms.
- Accessibility: WCAG 2.1 AA; focus-visible; keyboard nav; alt text required on every CMS image (enforced by test).
- `sitemap.xml` + `robots.txt` generated at build.
- No tracking before consent beyond Vercel Analytics (cookieless).

## 4. Pages — content & acceptance

**Home** — hero (photo + "Caring for cats, fostering hope, promoting TNR" + Donate + Adopt CTAs) · impact counters (cats TNR'd / adopted / in foster — CMS-editable numbers) · 3–4 featured adoptable cats (live) · "How you can help" 4-up (Donate / Foster / Volunteer / Adopt) · latest 3 news posts · newsletter signup.

**Adopt** — grid of all adoptable cats from ShelterLuv (photo, name, age, sex, short bio, "Meet me" → ShelterLuv profile; "Apply" → `new.shelterluv.com/matchme/adopt/GCCI/Cat`). Loading skeleton; if the API fails, show a friendly fallback with the ShelterLuv link. Adoption process + fees section (CMS).

**Foster / Volunteer** — what it involves, FAQ (CMS), CTA to the ShelterLuv forms (`/matchme/foster/GCCI/Cat`, `/form/volunteer/GCCI/176721-volunteer`).

**Donate** — Zeffy embed (placeholder `ZEFFY_FORM_URL` until Kim creates the account) · one-time vs monthly framing · "what $25/$50/$100 does" (CMS) · other ways: Amazon/Chewy wishlist links (CMS), PayPal, Venmo, mail a check, employer matching · tax-deductible statement with EIN.

**TNR** — what it is, why it works, how to request help for a colony (form → Resend email to Kim), sponsor-a-surgery CTA → Donate.

**About** — Kim's story (CMS rich text), mission, board members (CMS list: name, role, photo, bio), 501(c)(3) + EIN, link to IRS determination letter PDF (upload via CMS).

**Found a cat** — what to do first, then the ShelterLuv found-cat form (`/form/other/GCCI/179042-found-cat`).

**Happy Tails / News / Events** — CMS collections (see §5). Events show upcoming first; past events collapse.

**Contact** — form (name, email, message, honeypot) → `api/contact.js` → Resend → `CONTACT_RECIPIENT_EMAIL`. Same safeguards as Shoreline's `api/estimate.js` (single recipient, env preflight, no secrets in logs).

## 5. CMS (Decap) — content model

Decap config at `admin/config.yml`, backend `github`, branch `main`, `publish_mode: editorial_workflow` (changes become PRs → Kim's edits are previewable and revertible; Cortney can auto-merge later).

Collections:
- `settings` (single file `content/settings.json`): org name, phone, email, address, EIN, social URLs, Zeffy URL, wishlist URLs, impact counters, hero text/image.
- `pages` (one JSON/MD per static page for the editable copy blocks listed above).
- `board` (`content/board/*.md`): name, role, photo, bio, order.
- `happy_tails` (`content/happy-tails/*.md`): title, cat name, date, photo(s), story, adopter quote.
- `news` (`content/news/*.md`): title, date, cover, excerpt, body, tags.
- `events` (`content/events/*.md`): title, start, end, location, description, cover, link.
- `faq` per page.

Auth: GitHub OAuth via a tiny Vercel function (`api/auth.js` + `api/callback.js`, standard Decap external-OAuth pattern). Kim and Cortney each need a GitHub account with write access to the repo. Document the login steps in `README.md` in plain language for Kim.

Build step reads `content/` and injects it into pages (prerender script, Elite pattern). Image uploads go to `public/uploads/`; `scripts/optimize-images.mjs` resizes them at build.

## 6. Serverless functions (`api/`)

- `shelterluv.js` — GET; calls `https://www.shelterluv.com/api/v1/animals?status_type=publishable` with `X-Api-Key: SHELTERLUV_API_KEY`; returns a trimmed array (id, name, photo, age, sex, breed, description, profile URL). Cache 10 minutes (`Cache-Control: s-maxage=600, stale-while-revalidate=3600`). Never expose the key to the client.
- `contact.js` / `tnr-request.js` — POST; validate, honeypot, rate-limit by IP (simple in-memory or Upstash free), send via Resend.
- `auth.js`, `callback.js` — Decap GitHub OAuth.
- `newsletter.js` — POST; for now append to a Resend Audience (free) — Mailchimp/Beehiiv later.

Env vars (names only in `.env.example`): `SHELTERLUV_API_KEY`, `RESEND_API_KEY`, `FORM_FROM_EMAIL`, `CONTACT_RECIPIENT_EMAIL`, `RESEND_AUDIENCE_ID`, `OAUTH_GITHUB_CLIENT_ID`, `OAUTH_GITHUB_CLIENT_SECRET`, `SITE_URL`. Build must fail on missing/example values (Shoreline's `check-deployment-env.mjs` pattern).

## 7. Design direction — see `docs/style-tile.html` (open it in a browser)

Brand (all from Kim's logo + banner): **violet plum** #5B2C6F primary / #3E1A52 dark, **olive sage** #6E7F4C secondary, pale sage #E9EEDF section bands, cream #F6F3EA page bg, **gold #D9A93A for Donate only**. Fonts: **Fraunces** (h1/h2 display serif), **Kaushan Script** as accent only (one phrase per heading, pull quotes, "Grandma's" in wordmark, never <28px/buttons/nav), **Lato** (body, h3+, buttons, nav, ribbons). All tokens in `src/tokens.css` from the tile's `:root`. Pill buttons, all solid fill, soft buttons get a 2px lavender edge. Brand assets in `public/images/brand/` (grandma-and-cat.jpg hero photo; logo.png + banner.jpg to be added by Cortney).

## 8. Tests (`npm test`, Elite pattern — script per concern)

`test:routes`, `test:metadata`, `test:structured-data`, `test:accessibility`, `test:mobile-menu`, `test:footer` (EIN + 501c3 line present), `test:contact` (form wiring, honeypot), `test:shelterluv` (mocked API → cards render; API failure → fallback renders), `test:cms-config` (every collection field in config.yml maps to something the build reads), `test:images` (every image has alt + optimized variant).

## 9. Launch checklist

1. Create: GCC GitHub org, Vercel account, Resend account, Zeffy account (Kim, needs EIN), ShelterLuv API key (Kim → ShelterLuv Settings → API), GitHub accounts for Kim + Cortney. **All under GCC identities, not Powrful.**
2. Deploy to `*.vercel.app`; Cortney + Kim review.
3. DNS: point `grandmascatcoalition.org` at Vercel (GoDaddy DNS stays at GoDaddy for now). ⚠ One-way-ish: the old GoDaddy site goes dark when DNS switches — export anything needed first (it's one page; Claude already captured the copy in BRIEF.md).
4. Submit sitemap to Google Search Console; claim Google Business Profile; update FB "website" link.
5. 301s: old site is a single URL, so only `/` matters.

## 10. Out of scope for 01 (future specs)

02 Marketing/content engine · 03 Merch store · 04 Sponsor-a-cat recurring program · 05 Grant tracker · 06 Volunteer portal.

## Open items for Cortney/Kim
- [ ] EIN number + scan of IRS determination letter
- [ ] Zeffy account created → form URL
- [ ] ShelterLuv API key
- [ ] GitHub accounts for Kim and Cortney (GCC-dedicated email recommended)
- [ ] Photos of Kim, board, and cats (originals, not FB downloads)
- [ ] Domain email decision (Google Workspace for Nonprofits is free — apply via TechSoup with the 501(c)(3))
