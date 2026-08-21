# Grandma's Cat Coalition (GCC) — Project Brief

_Shared context for Claude + Codex. Last updated 2026-08-21._

## The organization
- Cat rescue in **Lime Springs, IA** (Northeast Iowa). Very new, minimal funds, mostly out-of-pocket.
- Services: **TNR**, **foster** (in volunteer homes — no facility yet), **adoption**.
- Address: 113 W Jackson St, Lime Springs, IA 52155. Phone 641-229-7494. Email currently `kimtheis619@gmail.com` (personal Gmail — replace with domain email later).
- **501(c)(3) confirmed** — Kim has the EIN and IRS paperwork (get the EIN + determination letter copy for the website footer, Zeffy, Google Ad Grants, FB fundraisers).
- Board: Kim (founder/owner), Cortney (director — marketing & social, our client/boss), Laney, April. Expanding from 5 to 7 seats. Two members left Aug 2026 over Facebook drama — **the board has zero tolerance for social media drama.**
- Kim signs off on most things for now.

## Goals (in order)
1. Help cats: fund spay/neuter, place cats in homes.
2. Raise money: donations, grants, merch, events — anything.
3. Grow audience **nationally**, not just Lime Springs. Traffic + followers.
4. Long-term: own shelter, become a large organization.

## Current digital assets
- **Website:** grandmascatcoalition.org — GoDaddy Website Builder, one page. Kim dislikes GoDaddy; open to rebuild.
  - 🔴 "Support Cats Now" button links to `#` — no donation path exists.
  - Adopt/Foster/Volunteer/Found-cat link to ShelterLuv (org code `GCCI`):
    - https://new.shelterluv.com/matchme/adopt/GCCI/Cat
    - https://new.shelterluv.com/matchme/foster/GCCI/Cat
    - https://new.shelterluv.com/form/volunteer/GCCI/176721-volunteer
    - https://new.shelterluv.com/form/other/GCCI/179042-found-cat
  - No 501(c)(3) line, no cat photos/stories, no events, no SEO presence (org doesn't appear in search for its own name; "Malanimals Cat Coalition" in Decorah outranks it).
- **Facebook:** facebook.com/grandmascatcoalition — 222 followers, 2 reviews, low engagement.
- **Logins:** none yet (GoDaddy, domain, ShelterLuv, FB admin) — later.

## Decision: rebuild the website
- **Stack = same as Shoreline/Elite:** Vite + vanilla JS/HTML static site, Vercel hosting, Vercel serverless `api/` functions, Resend for email, script-based tests in `scripts/`. Reference repos: `cortney-gif/shoreline-coatings-website`, `Powrful-Media/elite-protective-website-rebuild`.
- **Separation:** new GitHub org for GCC, new Vercel account, new Resend account — nothing shared with Powrful.
- Requirements: Kim and Cortney must both be able to edit content without code → needs a CMS / admin UI with accounts.
- Keep ShelterLuv as the system of record for animals (embed/pull adoptable cats).
- Must have a working donate flow on day one.
- Budget: as close to $0/month as possible.

## Team roles
- **Cortney** — Director of Marketing (decides, gets Kim's sign-off).
- **Claude** — Marketing Director / Strategist + Architect: strategy, fundraising plan, content & social calendar, copy, SEO, grants, specs/tickets for Codex, code review.
- **Codex** — Lead Developer: builds the site and admin from Claude's specs, deploys, fixes bugs.
- Handoff: Claude writes specs into `/specs/*.md`; Codex implements and notes status at the top of each spec.
