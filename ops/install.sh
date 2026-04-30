#!/usr/bin/env bash
# One-shot installer for the Nova SBE alumni networker agent on Ubuntu 24.04.
# Run as root (sudo) on a fresh VPS.
#
#   curl -fsSL https://raw.githubusercontent.com/tomasbb0/novasbealumni/main/ops/install.sh | sudo bash
#
# Or, if you have the repo locally on the VPS already:
#   sudo bash ops/install.sh
#
# What it does:
#   1. apt update + installs git, curl, ca-certificates.
#   2. Installs Node.js 20 LTS via NodeSource.
#   3. Installs the GitHub Copilot CLI globally (@github/copilot).
#   4. Creates a dedicated unprivileged user 'alumni' with /home/alumni.
#   5. Clones (or updates) the repo to /home/alumni/NovaAlumniConnect.
#   6. Drops /etc/default/alumni-agent from ops/alumni-agent.env.example.
#   7. Installs systemd unit + timer, enables and starts the timer.
#   8. Prints the manual one-time steps you still need to do.

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/tomasbb0/novasbealumni.git}"
REPO_BRANCH="${REPO_BRANCH:-main}"
AGENT_USER="${AGENT_USER:-alumni}"
REPO_DIR="/home/$AGENT_USER/NovaAlumniConnect"

if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)." >&2
  exit 1
fi

echo "==> apt update + base packages"
apt-get update -qq
apt-get install -y -qq git curl ca-certificates gnupg

if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js 20 LTS"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi

echo "==> Installing GitHub Copilot CLI"
npm install -g @github/copilot

if ! id "$AGENT_USER" >/dev/null 2>&1; then
  echo "==> Creating user '$AGENT_USER'"
  useradd -m -s /bin/bash "$AGENT_USER"
fi

echo "==> Cloning / updating repo at $REPO_DIR"
if [ -d "$REPO_DIR/.git" ]; then
  sudo -u "$AGENT_USER" git -C "$REPO_DIR" fetch --quiet origin "$REPO_BRANCH"
  sudo -u "$AGENT_USER" git -C "$REPO_DIR" reset --quiet --hard "origin/$REPO_BRANCH"
else
  sudo -u "$AGENT_USER" git clone --quiet --branch "$REPO_BRANCH" "$REPO_URL" "$REPO_DIR"
fi

chmod +x "$REPO_DIR/ops/tick.sh"

echo "==> Installing /etc/default/alumni-agent"
if [ ! -f /etc/default/alumni-agent ]; then
  cp "$REPO_DIR/ops/alumni-agent.env.example" /etc/default/alumni-agent
  chmod 644 /etc/default/alumni-agent
else
  echo "    (already exists, leaving alone)"
fi

echo "==> Installing systemd units"
install -m 644 "$REPO_DIR/ops/alumni-agent.service" /etc/systemd/system/alumni-agent.service
install -m 644 "$REPO_DIR/ops/alumni-agent.timer"   /etc/systemd/system/alumni-agent.timer

echo "==> Creating state + cache + copilot dirs for $AGENT_USER"
sudo -u "$AGENT_USER" mkdir -p "/home/$AGENT_USER/.local/state/alumni-agent"
sudo -u "$AGENT_USER" mkdir -p "/home/$AGENT_USER/.copilot"
sudo -u "$AGENT_USER" mkdir -p "/home/$AGENT_USER/.cache"

systemctl daemon-reload
systemctl enable --now alumni-agent.timer

cat <<EOF

=========================================================
 Install complete.
=========================================================

The systemd timer is enabled and will fire every 15 minutes.
First tick happens 2 minutes after boot (or 2 minutes from now).

YOU STILL NEED TO DO TWO THINGS, MANUALLY, AS THE 'alumni' USER:

  1. Authenticate the GitHub Copilot CLI (one time, interactive).
     This stores credentials in /home/$AGENT_USER/.copilot/.

       sudo -iu $AGENT_USER
       copilot
       # follow the device-code flow, then type /exit

  2. Add an SSH deploy key so the agent can push commits.

       sudo -iu $AGENT_USER
       ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519
       cat ~/.ssh/id_ed25519.pub
       # add that key to https://github.com/tomasbb0/novasbealumni/settings/keys
       # tick "Allow write access"

     Then switch the repo origin from HTTPS to SSH:

       cd $REPO_DIR
       git remote set-url origin git@github.com:tomasbb0/novasbealumni.git
       ssh -o StrictHostKeyChecking=accept-new -T git@github.com || true

USEFUL COMMANDS:

  systemctl status alumni-agent.timer
  systemctl list-timers alumni-agent.timer
  journalctl -u alumni-agent.service -n 200 --no-pager
  sudo -iu $AGENT_USER FORCE_RUN=1 $REPO_DIR/ops/tick.sh    # force a tick now

EOF
