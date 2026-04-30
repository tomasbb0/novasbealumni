# Running the 24/7 agent on a VPS

The Nova SBE alumni networker is a tiny systemd unit that wakes up every 15 minutes, checks if there are new alumni profiles to look at, and if so asks GitHub Copilot CLI (Claude Haiku 4.5) to draft any high signal connections it finds. New proposals get pushed back to the repo, which triggers GitHub Pages to rebuild the `/connections` dashboard. Total runtime infra: one cheap (or free) Linux box.

## Recommended host

**Default recommendation: Hetzner CX22**. €4.59 a month, 2 vCPU, 4GB RAM, Ubuntu 24.04. Pay by the hour, kill any time, no surprises. For a 24/7 alumni community agent, paying €5/mo to own the relationship beats fighting Oracle's quota system.

**If you really want free: Oracle Cloud Always Free**. The Ampere A1 ARM shape (4 vCPU, 24GB RAM) is free forever, but free Ampere capacity is often "out of stock" in EU regions. Expect to retry for a few hours. Acceptable if you treat the agent as best effort, less ideal for a service you actually care about.

**Avoid**: AWS / GCP free tiers. They expire after 12 months and the bills get weird.

In both cases pick **Ubuntu 24.04 LTS**.

## Install

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
