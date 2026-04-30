#!/usr/bin/env bash
# Single tick of the Nova SBE 24/7 alumni networker agent.
# Designed to run on Ubuntu 24.04 under a systemd timer, every 15 minutes.
#
# What it does (in order):
#   1. cd to repo, pull --rebase from origin/main.
#   2. Hash data/profiles.json. If unchanged since last successful tick AND
#      we ran in the last 6 hours, exit 0. Saves Copilot quota on quiet weeks.
#   3. Run the Copilot CLI in non-interactive mode against the networker prompt.
#   4. Validate that data/proposed-connections.json is still parseable JSON.
#   5. If proposed-connections.json changed, commit + push.
#   6. Persist the new profiles hash and tick timestamp.
#
# Logs go to stdout, captured by systemd into journalctl.
# State lives in $STATE_DIR (default ~/.local/state/alumni-agent).
#
# Required env (from /etc/default/alumni-agent or systemd Environment=):
#   REPO_DIR        absolute path to the checked-out repo
#   GIT_REMOTE      defaults to "origin"
#   GIT_BRANCH      defaults to "main"
#   MODEL_ID        defaults to "claude-haiku-4.5"
#   EFFORT          defaults to "low" (low|medium|high|xhigh)
#   FORCE_RUN       set to "1" to skip the unchanged-profiles short circuit
#   STATE_DIR       defaults to $HOME/.local/state/alumni-agent
#   AGENT_GIT_NAME  committer name, default "nova-networker-bot"
#   AGENT_GIT_EMAIL committer email, default "bot@novasbealumni.com"

set -euo pipefail

REPO_DIR="${REPO_DIR:?REPO_DIR is required}"
GIT_REMOTE="${GIT_REMOTE:-origin}"
GIT_BRANCH="${GIT_BRANCH:-main}"
MODEL_ID="${MODEL_ID:-claude-haiku-4.5}"
EFFORT="${EFFORT:-low}"
FORCE_RUN="${FORCE_RUN:-0}"
STATE_DIR="${STATE_DIR:-$HOME/.local/state/alumni-agent}"
AGENT_GIT_NAME="${AGENT_GIT_NAME:-nova-networker-bot}"
AGENT_GIT_EMAIL="${AGENT_GIT_EMAIL:-bot@novasbealumni.com}"

mkdir -p "$STATE_DIR"
LAST_HASH_FILE="$STATE_DIR/last-profiles-hash"
LAST_RUN_FILE="$STATE_DIR/last-run-epoch"

log() {
  printf '[%s] %s\n' "$(date -u +%FT%TZ)" "$*"
}

cd "$REPO_DIR"

log "Pulling latest from $GIT_REMOTE/$GIT_BRANCH..."
git fetch --quiet "$GIT_REMOTE" "$GIT_BRANCH"
git reset --quiet --hard "$GIT_REMOTE/$GIT_BRANCH"

PROFILES_HASH=$(sha256sum data/profiles.json | cut -d' ' -f1)
LAST_HASH=$(cat "$LAST_HASH_FILE" 2>/dev/null || echo "none")
LAST_RUN=$(cat "$LAST_RUN_FILE" 2>/dev/null || echo "0")
NOW=$(date +%s)
SIX_HOURS=$((6 * 3600))

if [ "$FORCE_RUN" != "1" ] \
   && [ "$PROFILES_HASH" = "$LAST_HASH" ] \
   && [ $((NOW - LAST_RUN)) -lt "$SIX_HOURS" ]; then
  log "Profiles unchanged since last tick and we ran less than 6h ago. Skipping."
  exit 0
fi

PROFILE_COUNT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('data/profiles.json','utf8')).length)")
if [ "$PROFILE_COUNT" -lt 2 ]; then
  log "Only $PROFILE_COUNT profiles. Need at least 2 to match. Skipping."
  echo "$PROFILES_HASH" > "$LAST_HASH_FILE"
  echo "$NOW" > "$LAST_RUN_FILE"
  exit 0
fi

BEFORE_HASH=$(sha256sum data/proposed-connections.json | cut -d' ' -f1)

log "Running Copilot CLI ($MODEL_ID, effort=$EFFORT) on $PROFILE_COUNT profiles..."

PROMPT_BODY=$(cat .github/agent-prompts/networker.md)

# --allow-all-tools is required for non-interactive mode.
# --allow-all-paths because we operate on data/ which is inside the repo anyway.
# We deliberately do NOT pass --allow-all-urls; the agent must not call out.
MODEL_ID="$MODEL_ID" copilot \
  --model "$MODEL_ID" \
  --effort "$EFFORT" \
  --allow-all-tools \
  --allow-all-paths \
  --no-banner \
  -p "$PROMPT_BODY"

log "Validating data/proposed-connections.json..."
node -e "
  const fs = require('fs');
  const arr = JSON.parse(fs.readFileSync('data/proposed-connections.json','utf8'));
  if (!Array.isArray(arr)) { console.error('Not an array'); process.exit(1); }
  const required = ['id','alumni_a_id','alumni_b_id','opportunity_type','synergy_summary','suggested_intro_message','confidence','signals','generated_at','generated_by_model','status'];
  for (const c of arr) {
    for (const k of required) if (!(k in c)) { console.error('Missing field', k, 'in entry', c.id || '(no id)'); process.exit(1); }
  }
  console.log('Validation OK,', arr.length, 'total proposed connections.');
"

AFTER_HASH=$(sha256sum data/proposed-connections.json | cut -d' ' -f1)

if [ "$BEFORE_HASH" = "$AFTER_HASH" ]; then
  log "Agent produced no new proposals. Nothing to commit."
else
  BEFORE_COUNT=$(git show HEAD:data/proposed-connections.json | node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>console.log(JSON.parse(s).length))")
  AFTER_COUNT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('data/proposed-connections.json','utf8')).length)")
  NEW_COUNT=$((AFTER_COUNT - BEFORE_COUNT))
  log "Detected $NEW_COUNT new proposals. Committing and pushing..."
  git config user.name  "$AGENT_GIT_NAME"
  git config user.email "$AGENT_GIT_EMAIL"
  git add data/proposed-connections.json
  git commit -m "feat(connections): $NEW_COUNT new proposed connection(s) from 24/7 networker"
  git push "$GIT_REMOTE" "HEAD:$GIT_BRANCH"
fi

echo "$PROFILES_HASH" > "$LAST_HASH_FILE"
echo "$NOW" > "$LAST_RUN_FILE"

log "Tick complete."
