# Deployment

This site lives in accounts owned by Grandma's Cat Coalition. Do not connect Powrful Media accounts or credentials.

- **Repo:** `github.com/Grandma-s-Cat-Coalition/Grandma-s-Cat-Coalition` (org owned by Cortney + Kim).
- **Host:** Vercel (GCC-owned Hobby account), connected to the repo via the Vercel GitHub App. Every push to `main` auto-deploys.

## Remaining launch steps

1. In Vercel, add every variable named in `.env.example` (Resend key + audience, form recipient, GitHub OAuth for Decap, `SITE_URL`). The build runs `node scripts/check-deployment-env.mjs` and fails if any are missing or still placeholders. `SHELTERLUV_API_KEY` is optional: without it the adopt page shows ShelterLuv's embed widget (no styling); with it, the site renders its own styled cat cards and falls back to the embed if the API ever fails.
2. Deploy to the preview URL. Cortney and Kim review every route and form.
3. Export any content still needed from GoDaddy, then point `grandmascatcoalition.org` DNS to Vercel.
4. Submit `/sitemap.xml` to Google Search Console and update the Facebook website link.

Build command `npm run build`, output directory `dist`.

Never commit credentials. Email sends only to `CONTACT_RECIPIENT_EMAIL`; the browser cannot choose a recipient.
