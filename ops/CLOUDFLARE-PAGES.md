# Migrating hosting to Cloudflare Pages

The site currently deploys to GitHub Pages via `.github/workflows/deploy.yml`. That works fine for the static dashboard (`/connections`, `/`, etc.) but it cannot host live endpoints. The `/onboard` chat needs an endpoint at `/api/onboard-chat`, which means we need a host that serves both static files and serverless functions.

Cloudflare Pages does this for free, in the same place. Migration takes ~10 minutes and costs €0. After this, GitHub Pages becomes redundant and can be turned off.

## Why Cloudflare and not Vercel / Netlify

- Vercel free tier (Hobby) is generous but Pages Functions on Cloudflare have a much higher free request budget (100k requests/day vs Vercel's 100k/month) and the AI binding is included.
- Cloudflare Workers AI gives you an LLM (Llama 3.3 70B Instruct) for free, billed in "neurons", with 10k neurons/day on the free tier. A short chat reply is roughly 10 to 50 neurons, so practical capacity is hundreds to thousands of replies per day. No external API key needed.
- DNS, SSL, custom domain: all free on Cloudflare.

## Step by step

### 1. Create a Cloudflare account

Go to https://dash.cloudflare.com/sign-up. Email + password. No credit card.

### 2. Connect the repo

- Cloudflare dashboard → "Workers & Pages" → "Create application" → "Pages" → "Connect to Git".
- Authorise GitHub, pick `tomasbb0/novasbealumni`.
- Build settings:
  - Framework preset: **Next.js (Static HTML Export)**
  - Build command: `npm run build`
  - Build output directory: `out`
  - Root directory: leave empty
  - Node version: set env var `NODE_VERSION` = `20`
- Environment variables (Production):
  - `NEXT_PUBLIC_AGENT_CHAT_URL` = `/api/onboard-chat`
  - (optional) any others the sibling agent needs
- Click "Save and Deploy". First build takes ~3 minutes.

### 3. Bind Workers AI

- Open the Pages project → Settings → Functions → "Bindings".
- Add a binding:
  - Type: **Workers AI**
  - Variable name: `AI`
- Save. Re-deploy (Settings → Deployments → "Retry deployment" on the latest).

That's it. The endpoint at `https://<project>.pages.dev/api/onboard-chat` is live.

### 4. Custom domain (optional)

- Pages project → Custom domains → "Set up a custom domain".
- Enter your domain (e.g. `novasbealumni.com`).
- Cloudflare gives you DNS records to add. If your DNS is also on Cloudflare, it is one click.

### 5. Turn off GitHub Pages (optional, recommended)

Once Cloudflare is serving the site, GitHub Pages is redundant. To avoid two sources of truth:

- In the repo: Settings → Pages → Source → "None".
- Delete or disable `.github/workflows/deploy.yml` (rename to `.disabled` or remove entirely).

Or keep both running. They will not conflict because they serve from different domains. Pick one.

## Verifying the endpoint works

Once deployed:

```bash
curl -X POST https://<your-project>.pages.dev/api/onboard-chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","text":"Hi, I am João, BSc Economics 2019."}]}'
```

Expected: a JSON `{"reply":"..."}` with the agent's next question.

`GET /api/onboard-chat` returns a small JSON health check.

## What this does NOT do yet

The endpoint chats and emits a `DONE\n\`\`\`json{...}\`\`\`` block at the end of conversation. It does not yet write the captured profile into `data/profiles.json`. That step needs a separate piece (Cloudflare KV or D1 to buffer profiles, then a GitHub Actions job that drains the buffer and commits to the repo). Sibling agent owns that.

## Cost monitoring

- Pages requests: dashboard → Analytics shows daily request count. Free tier ceiling is 100k/day.
- Workers AI: dashboard → Workers AI shows neuron usage. Free tier ceiling is 10k/day.
- Both have visible usage bars. If you hit them, the endpoint returns 429 until the next day. No surprise bills, no auto-upgrade. You are safe.
