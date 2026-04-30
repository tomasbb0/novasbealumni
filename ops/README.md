# Running the 24/7 agent

You have two ways to run this. Pick one. They both work, they both end with the agent posting proposed connections to `/connections`.

| Path | Cost | Latency | Setup time |
|------|------|---------|------------|
| **GitHub Actions** (default) | €0 forever | new proposals every 6h | 5 minutes |
| **VPS** (upgrade) | €0 if you can grab Oracle Always Free, else ~€5/mo on Hetzner | new proposals every 15 min | 30 minutes plus Oracle waiting |

Start with GitHub Actions. Move to a VPS later if you want tighter loops or you want to run more aggressive models.

---

## Option A: GitHub Actions (zero infra, zero money)

The agent lives in `.github/workflows/alumni-agent.yml`. It already runs on a 6-hour cron and on manual dispatch from the Actions tab. The only thing you need to do is create one secret.

### One-time setup

1. **Generate a fine-grained Personal Access Token** with your Copilot-subscribed GitHub account.
   - Go to https://github.com/settings/personal-access-tokens
   - Click "Generate new token", pick "Fine-grained token"
   - Repository access: only `tomasbb0/novasbealumni`
   - Permissions:
     - Contents: **Read and write**
     - Workflows: **Read and write**
   - Expiration: pick whatever you're comfortable with (90 days, 1 year, no expiration)
   - Generate, copy the token (starts with `github_pat_...`).

2. **Add it as a repo secret**:
   - Go to https://github.com/tomasbb0/novasbealumni/settings/secrets/actions
   - Click "New repository secret"
   - Name: `GH_PAT_COPILOT`
   - Value: paste the token
   - Save.

3. **Test it now** without waiting 6 hours:
   - Go to https://github.com/tomasbb0/novasbealumni/actions/workflows/alumni-agent.yml
   - Click "Run workflow" → "Run workflow" (use defaults).
   - Watch it run. Should complete in 1 to 2 minutes.

That's it. The agent now ticks every 6 hours forever on GitHub's free CI runners.

### Why we need a PAT and not the default `GITHUB_TOKEN`

Two reasons.

1. The Copilot CLI needs an OAuth-capable token; the workflow's auto-issued `GITHUB_TOKEN` is not associated with a Copilot subscription.
2. Pushes authored with `GITHUB_TOKEN` do **not** trigger downstream workflows by design (anti-loop safety). We need `deploy.yml` to fire when the agent pushes, so we use a real PAT.

### Cost on GitHub's side

Public repo on GitHub Actions = unlimited free minutes. Each tick takes 1 to 2 minutes of compute. Even at 4 ticks per day, every day, forever, you owe nothing.

Each tick that actually invokes Copilot consumes one request from your Copilot subscription's monthly request budget. The Haiku model is cheap. With the "skip if profiles unchanged" check baked into the workflow, a quiet week costs you a handful of requests, not 28.

---

## Option B: VPS (upgrade path, every 15 min)

When you want tighter loops than 6h, or you want to keep the agent running on a model with higher request cost, move to a VPS.

### Recommended host

**Use Oracle Cloud Always Free**. The Ampere A1 ARM shape (4 vCPU, 24GB RAM) is free forever, no credit card charges, plenty for this agent. The install script below works fine on ARM (Node.js and the Copilot CLI both have arm64 builds).

The annoying part is getting one. Oracle's free Ampere capacity is famously "out of stock" in popular regions. A practical playbook:

1. Sign up at https://signup.cloud.oracle.com/. They ask for a credit card for ID verification only; they do not bill it as long as you stay inside the Always Free shapes.
2. Pick a **home region** carefully — you can never change it. Avoid Frankfurt, Amsterdam, London (always full). Try **Marseille**, **Stockholm**, **Madrid**, **São Paulo**, **Mumbai**, or **Mexico City** first.
3. Create a Compute instance: shape **VM.Standard.A1.Flex**, 4 OCPUs, 24 GB memory, image **Canonical Ubuntu 24.04**. Add your SSH public key.
4. If you get **"Out of host capacity"**, do not wait. Open a small terminal loop on your laptop that retries every 60 seconds:
   ```
   while true; do
     oci compute instance launch --from-json file://launch.json && break
     sleep 60
   done
   ```
   Or just refresh the web console manually a few times an hour. Most people get one within 24 to 48 hours of trying.
5. Once you have the instance, open ports 22 (SSH) and the default outbound. Nothing inbound is needed beyond SSH.

**Backup plan if Oracle never gives you a box**: Hetzner CX22 is €4.59/month, takes 30 seconds to provision, no capacity games. The same install script works on it identically.

**Avoid**: AWS / GCP free tiers. They expire after 12 months and the bills get weird.

In all cases pick **Ubuntu 24.04 LTS**.

## Install on the VPS

SSH into the VPS as root (or a sudoer), then:

```bash
curl -fsSL https://raw.githubusercontent.com/tomasbb0/novasbealumni/main/ops/install.sh | sudo bash
```

That script:

1. Installs Node.js 20 LTS and the GitHub Copilot CLI (`@github/copilot`).
2. Creates an unprivileged user called `alumni`.
3. Clones the repo to `/home/alumni/NovaAlumniConnect`.
4. Drops `/etc/default/alumni-agent` (env vars: model id, branch, paths).
5. Installs the systemd service + timer and enables the timer.

## Two manual steps the script cannot do

These need a human at the keyboard once.

### 1. Authenticate Copilot CLI

```bash
sudo -iu alumni
copilot
# Pick "Sign in with GitHub", visit the URL, paste the device code,
# approve. Then type /exit.
```

Auth is stored in `/home/alumni/.copilot/` and persists across reboots. Your Copilot subscription must be active on the GitHub account you sign in with.

### 2. Give the box a deploy key so it can push

```bash
sudo -iu alumni
ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
# Copy that line.
# Open https://github.com/tomasbb0/novasbealumni/settings/keys
# Click "Add deploy key", paste the public key, tick "Allow write access".

cd /home/alumni/NovaAlumniConnect
git remote set-url origin git@github.com:tomasbb0/novasbealumni.git
ssh -o StrictHostKeyChecking=accept-new -T git@github.com || true
```

## Verify it works

```bash
# See the timer
systemctl list-timers alumni-agent.timer
systemctl status alumni-agent.timer

# Force a tick right now (skips the "profiles unchanged" guard)
sudo -iu alumni FORCE_RUN=1 /home/alumni/NovaAlumniConnect/ops/tick.sh

# Watch the logs
journalctl -u alumni-agent.service -f
```

Expected output on a quiet tick (profiles haven't changed since last tick):

```
[2026-04-30T11:00:01Z] Pulling latest from origin/main...
[2026-04-30T11:00:02Z] Profiles unchanged since last tick and we ran less than 6h ago. Skipping.
```

Expected output on a productive tick:

```
[2026-04-30T11:00:01Z] Pulling latest from origin/main...
[2026-04-30T11:00:01Z] Running Copilot CLI (claude-haiku-4.5, effort=low) on 47 profiles...
[... agent reasoning ...]
[2026-04-30T11:00:38Z] Validating data/proposed-connections.json...
Validation OK, 13 total proposed connections.
[2026-04-30T11:00:38Z] Detected 2 new proposals. Committing and pushing...
[2026-04-30T11:00:40Z] Tick complete.
```

## Tuning

Edit `/etc/default/alumni-agent` then `sudo systemctl restart alumni-agent.timer`.

| Knob | Default | When to change |
|------|---------|----------------|
| `MODEL_ID` | `claude-haiku-4.5` | Bump to `claude-sonnet-4.5` once you have 200+ profiles and you want sharper reasoning. Costs more. |
| `EFFORT` | `low` | Bump to `medium` if the agent starts missing obvious matches. |
| Timer interval | 15 min | Edit `ops/alumni-agent.timer`, change `OnUnitActiveSec=`. |
| 6h hash short-circuit | hardcoded | Edit `SIX_HOURS` in `ops/tick.sh` if you want it to re-check sooner even when profiles are stable. |

## Cost discipline

The hash short-circuit in `tick.sh` is the whole reason this is cheap. Even at a 15 minute timer, the agent only invokes the LLM when:

- profiles changed since last tick, OR
- it has been more than 6 hours since the last invocation.

A typical week with 0 to 5 profile signups a day costs you maybe 10 to 30 LLM invocations, not 672.

## Updating the agent

Just push to `main`. The next tick auto-pulls before running, so prompt edits and code changes deploy on the next tick (within 15 minutes).

If you want to redeploy ops files (systemd units, install script):

```bash
sudo bash /home/alumni/NovaAlumniConnect/ops/install.sh
```

The installer is idempotent. Existing `/etc/default/alumni-agent` is left untouched so your local tuning survives.

## Uninstall

```bash
sudo systemctl disable --now alumni-agent.timer alumni-agent.service
sudo rm /etc/systemd/system/alumni-agent.{service,timer}
sudo rm /etc/default/alumni-agent
sudo systemctl daemon-reload
sudo userdel -r alumni    # also wipes the repo clone, ~/.copilot auth, state
```
