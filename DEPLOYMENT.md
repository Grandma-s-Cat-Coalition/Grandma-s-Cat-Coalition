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

## Local Vercel CLI (two accounts on one machine)

Cortney's PC has the Vercel CLI signed into the Powrful account by default. GCC lives on its own Vercel Hobby account, so GCC commands use a separate auth directory instead of switching logins:

```bash
vercel login -Q "$HOME/.vercel-gcc"      # one-time, interactive, sign in with the GCC account
vercel link  -Q "$HOME/.vercel-gcc"      # one-time, pick the grandmas-cat-coalition project
vercel env ls -Q "$HOME/.vercel-gcc"     # any later command: add -Q to target GCC
```

Never link or deploy this repo under a Powrful team. Add secrets with `vercel env add NAME production preview --sensitive -Q "$HOME/.vercel-gcc"` and type the value at the prompt so it never lands in shell history.
