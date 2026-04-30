# Sign-in setup (one-time)

This site uses Supabase to handle accounts and LinkedIn for sign-in. You only have to do this once. Allow yourself ~20 minutes the first time.

If you skip this, the site still loads and works for visitors, but the "Sign in" button will be disabled with a notice.

---

## 1. Create a Supabase project (5 min)

1. Go to https://supabase.com and create a free account.
2. Click "New project". Pick any name (e.g. `nova-alumni-club`), pick a strong database password (you won't need it day-to-day, but save it in your password manager), choose the closest region (Frankfurt or N. Virginia).
3. Wait ~2 min for it to provision.
4. When it's ready, open **Project Settings → API**. Copy two values:
   - **Project URL** (looks like `https://abcde12345.supabase.co`)
   - **anon public key** (a long `eyJhb...` string)

You'll paste these into env vars in step 4.

## 2. Create the database tables (1 min)

1. In Supabase, click **SQL** in the left nav → **New query**.
2. Open the file `db/schema.sql` in this repo, copy the whole thing, paste into the editor.
3. Click **Run**. You should see "Success. No rows returned." That's correct.
4. Verify: click **Table editor** in the left nav. You should see two tables: `profiles` and `connections`.

## 3. Create the LinkedIn OAuth app (10 min)

1. Go to https://www.linkedin.com/developers/apps and click **Create app**.
2. Fill in:
   - App name: `Nova SBE Alumni Club`
   - LinkedIn Page: any company page you control (or your personal one). LinkedIn requires this; it doesn't matter much.
   - Privacy policy URL: `https://novasbealumni.com` (good enough for now)
   - App logo: use the orange Nova SBE Alumni Club logo
3. After creation, open the **Auth** tab.
4. Under **OAuth 2.0 settings → Authorized redirect URLs for your app**, add this exact URL (replace `<your-supabase-ref>` with your project ref from step 1, e.g. `abcde12345`):
   ```
   https://<your-supabase-ref>.supabase.co/auth/v1/callback
   ```
5. Open the **Products** tab and request access to **"Sign In with LinkedIn using OpenID Connect"**. Approval is usually instant.
6. Back on the **Auth** tab, copy the **Client ID** and **Client Secret**.

## 4. Wire LinkedIn into Supabase (2 min)

1. In Supabase, **Authentication → Providers**.
2. Find **LinkedIn (OIDC)** in the list, toggle **Enabled**, paste the LinkedIn Client ID and Client Secret from step 3, click **Save**.
3. While you're in **Authentication**, click **URL Configuration** and set:
   - **Site URL**: `https://novasbealumni.com`
   - **Redirect URLs**: add both `https://novasbealumni.com/auth/callback` and `http://localhost:3000/auth/callback` (one per line).

## 5. Wire Supabase into the site (2 min)

The site reads two environment variables. They are public (the anon key is meant to be exposed to browsers — RLS protects the data).

### For local dev

Create a file called `.env.local` in the repo root (it's gitignored):

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<the anon key from step 1>
```

Then `npm run dev` and visit http://localhost:3000/signin.

### For the live site (GitHub Pages)

The build runs in GitHub Actions, so the env vars need to live there:

1. Open https://github.com/tomasbb0/novasbealumni/settings/secrets/actions
2. Add two **Repository variables** (not secrets — they're prefixed `NEXT_PUBLIC_` so they end up in the browser bundle anyway):
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://<your-supabase-ref>.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the anon key
3. Open `.github/workflows/deploy.yml` and make sure the build step exposes them. If they aren't already in the workflow, add this under the `build` step's `env:` block:
   ```yaml
   env:
     NEXT_PUBLIC_SUPABASE_URL: ${{ vars.NEXT_PUBLIC_SUPABASE_URL }}
     NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ vars.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
   ```
4. Re-trigger the deploy (push any commit, or **Actions → Deploy to GitHub Pages → Run workflow**).

## 6. Test it

1. Visit https://novasbealumni.com/signin
2. Click "Continue with LinkedIn"
3. Approve on LinkedIn
4. You should land on `/onboarding`. Fill in the form. Click save.
5. You should land on `/dashboard`.
6. In Supabase, **Table editor → profiles** — your row should be there.

If it doesn't work, check the browser console (Cmd+Option+I → Console). The most common issue is a redirect URL mismatch (step 3.4 or 4.3); they have to match exactly.
