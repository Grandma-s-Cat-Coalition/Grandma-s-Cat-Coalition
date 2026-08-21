# Deployment

This site must live in accounts owned by Grandma's Cat Coalition. Do not connect Powrful Media accounts or credentials.

1. Create the GCC GitHub organization and move this repository to `website`.
2. Replace `NEW_GCC_ORG` in `admin/config.yml` with the organization name.
3. Import the repository into a new GCC-owned Vercel Hobby account.
4. Add every variable named in `.env.example` to Vercel. Run `node scripts/check-deployment-env.mjs` in the deployment build after values are added.
5. Deploy to the review URL. Kim and Cortney review every route and form.
6. Export any content needed from GoDaddy, then point `grandmascatcoalition.org` DNS to Vercel.
7. Submit `/sitemap.xml` to Google Search Console and update the Facebook website link.

Never commit credentials. Email sends only to `CONTACT_RECIPIENT_EMAIL`; the browser cannot choose a recipient.
