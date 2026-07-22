# grova-site

Marketing site + dashboard for [grova.dev](https://grova.dev). Next.js 16, App Router, static export.

Read [PROJECT_AUDIT.md](PROJECT_AUDIT.md) for the current product direction,
architecture, verification evidence, deployment order, and prioritized backlog.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Use Node 20. Before pushing, run:

```bash
npm run typecheck
npm run lint
npm run build
```

## Deploy

This repo deploys to **grova.dev** through the Cloudflare Pages project
`grova-landing`.

```
push to main -> Cloudflare Pages builds `npm run build` -> publishes `out/` -> grova.dev
```

Cloudflare also creates a preview deployment for every branch. Watch recent
deployments with:

```bash
npx wrangler pages deployment list --project-name grova-landing
```

CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs typechecking,
linting, a production dependency audit, and the static export on every PR and
push to `main`.

The repository still has a legacy GitHub Pages configuration. It is not the
production path for `grova.dev`.

## Backend

The dashboard talks to `grova-api` (separate repo, deployed on Railway). API routes are not part of this static export — auth is via Supabase JWT, fetched at runtime by the dashboard.

## Repo history

This is the canonical repo. A sister repo `0x0nice/grova-test-site` was used historically as a staging mirror; it's now **archived** (read-only). All future work happens here.
