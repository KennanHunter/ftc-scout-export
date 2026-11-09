# FTC Scout Export

A little web tool that pulls every team's season stats from [FTC Scout](https://ftcscout.org) and spits them out as a CSV. Useful if you want to sort, filter, or do pivot-table scouting in a spreadsheet.

Supports the current **BIOBUZZ (2026-2027)** season and last year's **DECODE (2025-2026)**.

## Using it

1. Pick a season.
2. Pick how many team-event entries to pull. The default is usually fine: if you're mid-season and ranks look thin, bump it up.
3. Hit Download. You get a CSV.

If some batches fail (FTC Scout hiccups happen), you'll see a warning and a button to download the partial CSV anyway.

## Running locally

```bash
pnpm install
pnpm dev
```

That runs Next.js and GraphQL codegen side-by-side. Open http://localhost:3000.

## Deploying

Pushes to `master` build and deploy to Cloudflare via GitHub Actions. Needs two repo secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

To deploy manually:

```bash
pnpm deploy
```

---

Built by [Kennan Hunter](https://github.com/kennanhunter) for [FUN Robotics Network](https://funroboticsnetwork.com/).
