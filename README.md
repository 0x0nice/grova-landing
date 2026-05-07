# grova-landing

Marketing site + dashboard for [grova.dev](https://grova.dev). Next.js 16, App Router, static export.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

This repo deploys to **grova.dev** via GitHub Pages.

```
push to main → GitHub Pages builds → 0x0nice.github.io/grova-landing → grova.dev (Cloudflare CNAME)
```

Pages build typically takes 30–60 seconds. Watch with:

```bash
gh api repos/0x0nice/grova-landing/pages/builds --jq '.[0]'
```

CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs `tsc --noEmit` and `next build` on every PR and push to `main`, so most regressions are caught before Pages builds.

## Backend

The dashboard talks to `grova-api` (separate repo, deployed on Railway). API routes are not part of this static export — auth is via Supabase JWT, fetched at runtime by the dashboard.

## Repo history

This is the canonical repo. A sister repo `0x0nice/grova-test-site` was used historically as a staging mirror; it's now **archived** (read-only). All future work happens here.
