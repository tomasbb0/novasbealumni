# oracle-grabber-cron

Cloudflare Worker. Fires `workflow_dispatch` for `oracle-arm-grabber.yml` every 5 minutes,
server-side and reliably (GitHub Actions cron is throttled on free-tier public repos).

## Deploy

```bash
cd workers/oracle-grabber-cron
npm install
npx wrangler login           # one-time
npx wrangler secret put GH_TOKEN   # paste a fine-grained PAT with Actions: Write on the repo
npx wrangler deploy
```

## Manual trigger / health check

The Worker has no public HTTP route (`workers_dev = false`). To force a dispatch
without waiting for cron, run:

```bash
npx wrangler triggers deploy   # re-registers cron, doesn't fire
```

Or just trigger the workflow directly via `gh workflow run oracle-arm-grabber.yml`.

## Tail logs

```bash
npx wrangler tail oracle-grabber-cron
```
