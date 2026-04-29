# Nova Alumni NY

Landing site, RSVP, survey, and pitch deck for the Nova SBE alumni community in New York City.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Pages

- `/` landing
- `/rsvp` first-mixer signup form (writes to `data/rsvp.json`)
- `/survey` Tally embed
- `/pitch` 5-section deck for Nova SBE / partners
- `/api/rsvp` POST handler

## Configure

All brand strings in `src/lib/brand.ts`. Update the placeholder name, Tally URL, WhatsApp link and contact email there.

Environment variables in `.env.example` (copy to `.env.local`).

## Deploy

Push to GitHub, then import the repo on Vercel. Free hobby tier works. Note: the file-based RSVP store does not persist on serverless. Before going live, swap `src/app/api/rsvp/route.ts` for Vercel KV, Supabase, or pipe to email via Resend.
