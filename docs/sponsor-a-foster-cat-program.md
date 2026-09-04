# Sponsor a Foster Cat — program design

**Status:** Draft for Kim's sign-off · **Owner:** Cortney (marketing) · **Date:** 2026-08-27
**Scope:** Fundraising program design only. Website implementation would be a future spec once the pilot is approved.

---

## 1. Tiers and names

Keep all four price points — they ladder well. Name each tier so the amount maps to a real, explainable cost. Recommendation:

| Amount | Name | What it covers (talking point) |
|---|---|---|
| $10/mo | **Kitten Club** | A month of dewormer and vaccine boosters for one kitten |
| $25/mo | **Cat's Meow** | A month of food and litter for one foster cat |
| $50/mo | **Purrfect Partner** | Spay/neuter or core vetting for one cat, every month |
| $75/mo | **Grandma's Circle** | The full monthly cost of one cat in foster care |

Notes:
- **Drop "Big Cat Supporter."** It reads generic and doesn't sound like GCC. "Grandma's Circle" ties the top tier to the brand and feels like belonging, not a transaction. (Adjust the cost talking points to Kim's real numbers before launch — they need to be honest, not precise.)
- Offer **one-time at every level too**, but make monthly the default-selected option on the form. Monthly is the whole point: predictable base income is what a tiny rescue actually needs.

## 2. Commitment: cancel anytime

**Do not require a three-month commitment.** Reasons:

1. Zeffy can't enforce it anyway — enforcing means chasing people, which is admin work you don't have.
2. "Cancel anytime" removes the biggest objection at signup. You'll net more months of giving from easy joiners than you'd save from locked-in ones.
3. A rescue asking neighbors for trust should not open with fine print.

Instead, *encourage* duration in the copy: "Most sponsors stay with us for a year or more — but you can cancel anytime, no questions asked." Put self-serve cancellation instructions on the website so nobody has to email to quit.

## 3. Benefits by tier (low-work by design)

The rule: **every benefit is produced once per month for everyone, or once per year.** Nothing is per-donor except the welcome email.

| Tier | Benefits |
|---|---|
| All tiers | Welcome email with digital sponsor certificate (one Canva template, name filled in) · monthly **Foster Family Update** email (one email, sent to all sponsors) · name on the website supporter list (opt-in) |
| $25+ | Choose a **featured foster cat** to represent your sponsorship — their photo and story in your welcome email, and updates on them in the monthly email while they're in care |
| $50+ | Sponsor shout-out in one Facebook post per quarter (opt-in, first names only) |
| $75 | A printed holiday photo card from the foster cats, once a year (~$1–2/card, ~30 min of batch work) |

Total recurring workload: **one monthly email (~1 hour) + welcome emails as they come (~5 min each).** If a benefit would take more than that, it's not in the program.

## 4. How donations are used — required wording

This wording (or close to it) goes on the donation page, the FAQ, and the welcome email. It's what keeps sponsorships legally **unrestricted** while still letting people bond with one cat:

> **Where your money goes.** Sponsorships support every cat in our foster program — food, litter, vaccines, spay/neuter, and emergency vet care. When you choose a foster cat to sponsor, you're choosing the face of your support, and we'll keep you updated on them — but your gift helps all of our foster cats, including the ones whose vet bills are bigger than any one sponsorship. If your cat is adopted (yay!), we'll celebrate with you and introduce you to another foster who needs a champion.

Never say "100% of your donation goes to [cat name]" anywhere — not even in a Facebook comment. That phrasing creates a restricted gift.

## 5. Tracking system

Keep it to two tools you already have:

1. **Zeffy** is the source of truth for money. It stores every recurring donor, handles cards/failures/receipts, and donors can manage their own subscription. Export CSV monthly.
2. **One Google Sheet** ("GCC Sponsors") with one row per sponsor:
   `Name · Email · Tier · Monthly/One-time · Start date · Featured cat · Website listing OK? (y/n) · FB shout-out OK? (y/n) · Status (active/lapsed/cancelled) · Notes`
3. **Monthly routine (do it on the 1st, ~1 hour total):**
   - Reconcile the Zeffy export against the sheet (5 min).
   - Write the Foster Family Update: 3–5 cat photos with 2–3 sentences each, adoptions ("graduations"), one number (cats in foster this month). Send to all sponsors — BCC from Gmail while the list is under ~50; move to a free email tool after that.
   - Update featured-cat assignments for anyone whose cat was adopted.

No CRM, no database, no automation to maintain. If the program outgrows the sheet, that's a success problem to solve later.

## 6. Risks and how the design handles them

| Risk | Mitigation |
|---|---|
| **Donor believes their money goes only to "their" cat** | The §4 wording appears at signup, in the welcome email, and in the FAQ. "Face of your support" framing from day one. |
| **Restricted funds** | Never promise per-cat allocation in any channel. All sponsorship revenue is unrestricted foster-program support. |
| **Foster family privacy** | Updates never include foster last names, addresses, or identifiable locations. Sponsors never get foster contact info or home visits. Photos are taken/approved by the foster. |
| **Sponsor privacy** | Website listing and FB shout-outs are opt-in at signup, first names + last initial only. Never publish amounts. |
| **Workload creep** | One monthly email is the entire content commitment. No per-donor updates, no printed newsletters, no sponsor events in v1. One named owner (Cortney); Kim is backup. |
| **Sponsored cat is adopted** | Frame adoption as the win it is: "graduation" announcement in the monthly email, sponsor gets first pick of a new featured cat. Never apologize for an adoption. |
| **Recurring payments cancel/fail** | Zeffy self-serve cancellation, instructions published on the site. A failed card gets one friendly email; no repeated chasing. A cancellation gets one warm thank-you, no guilt, and no win-back sequence. |
| **Board/social drama risk** | All sponsor-facing copy and shout-outs go through the same approval as other GCC social (Kim signs off on templates once; Cortney runs from templates after). |

## 7. Launch copy

### Facebook launch post

> 🐾 **Introducing: Sponsor a Foster Cat!**
>
> Right now, [N] cats are living in Grandma's Cat Coalition foster homes while they wait for their forever families. Foster homes give the love — but food, litter, vaccines, and vet care add up fast.
>
> Starting today, you can become a monthly sponsor from just $10/month:
>
> 🐱 $10 — Kitten Club
> 🐱 $25 — Cat's Meow
> 🐱 $50 — Purrfect Partner
> 🐱 $75 — Grandma's Circle
>
> Sponsors get a monthly update from our foster cats (yes, with photos), and at $25+ you can pick a foster cat to be the face of your sponsorship. Your gift supports our whole foster program, so every cat gets what they need — and you can cancel anytime.
>
> Meet the cats and sign up here: [link]
>
> Lime Springs neighbors: even one $10 sponsorship keeps a kitten dewormed and on schedule for their vaccines. That's real. 💜

### Website / donation page copy

> ## Sponsor a Foster Cat
>
> Every cat at Grandma's Cat Coalition lives in a volunteer foster home until they're adopted. Sponsors are the steady support that keeps that possible — covering food, litter, vaccines, spay/neuter, and vet care month after month.
>
> **Choose your level:** Kitten Club ($10) · Cat's Meow ($25) · Purrfect Partner ($50) · Grandma's Circle ($75) — monthly or one-time.
>
> **What you get:** a sponsor certificate, a monthly photo update from the foster program, and (at $25 and up) a foster cat of your choice as the face of your sponsorship.
>
> **Where your money goes:** sponsorships support every cat in our foster program. Choosing a cat chooses the face of your support — your gift helps them *and* every other foster cat who needs it. When your cat is adopted, we'll celebrate together and introduce you to a new foster friend.
>
> Cancel anytime — manage or cancel your sponsorship yourself through the link in your donation receipt, no email required.

## 8. 60-day pilot plan

**Setup (week 0):** Kim approves tiers, wording, and templates. Build the Zeffy form (4 tiers × monthly/one-time, monthly preselected, opt-in checkboxes for listing/shout-outs). Create the sponsor sheet, certificate template, and welcome-email template. Pick 3–5 photogenic current fosters as the launch "class."

**Weeks 1–2 — launch:** Facebook launch post + pin. Personal asks: each board member and foster personally invites 3–5 people (personal asks will outperform the post). Intro of the launch class, one cat per post, 2 posts/week.

**Weeks 3–8 — rhythm:** Monthly Foster Family Update (2 sends during the pilot). One "graduation" post per adoption. One mid-pilot Facebook reminder (~week 5). Nothing else.

**Success measures (review with Kim at day 60):**

| Metric | Target | Meaning |
|---|---|---|
| Recurring sponsors | 15 | Realistic for a town-and-network launch |
| Monthly recurring revenue | $300+/mo | ≈ full cost of 4 foster cats |
| One-time sponsorships | 10 | Captures the non-committers |
| Sponsor cancellations during pilot | ≤ 2 | Wording and expectations are working |
| Admin time | ≤ 2 hrs/month | Program is sustainable |
| Complaints/confusion about fund use | 0 | §4 wording is doing its job |

**Day-60 decision:** hit 10+ recurring sponsors with ≤2 hrs/month admin → make it permanent and add the program page to the website (new spec for Codex). Under 5 recurring sponsors → keep the donors, fold the program into general fundraising, and stop producing separate updates.
