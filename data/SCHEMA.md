# Data contract

This folder is the contract between three parties.

1. The onboarding flow (`/onboard`, owned by sibling agent) writes new alumni into `profiles.json`.
2. The 24/7 networker agent runs as a GitHub Actions cron (`.github/workflows/alumni-agent.yml`, owned by this agent). It reads `profiles.json` and appends to `proposed-connections.json`. It may also emit activity events into `agent-activity.json`.
3. The static dashboards (`/connections`, `/alumni/[id]`, `/agent`, `/admin`) read these files at build time.

A push to `main` rebuilds the static site on GitHub Pages.

## Ownership boundary (do not cross)

To prevent the two agents from clobbering each other:

- **Sibling agent owns**: `src/app/onboard/**`, `src/app/agent/**`, `src/app/admin/**`, `src/app/alumni/[id]/**`, `src/lib/activity.ts`, the `/onboard` chat backend (wherever it lives), and writes to `data/profiles.json`.
- **This agent owns**: `.github/workflows/alumni-agent.yml`, `.github/agent-prompts/networker.md`, `ops/**`, `src/app/connections/**`, `src/lib/connections.ts`, and writes to `data/proposed-connections.json`.
- **Shared**: `data/SCHEMA.md`, `data/agent-activity.json`. Edits must be additive (new fields, new event kinds), never remove fields the other side reads.

Neither agent deletes the other's files. If the architecture needs to change, propose it through the user, not unilaterally.

If you change a field, update this file and the TS types in `src/lib/connections.ts` in the same commit.

## profiles.json

Array of `Profile` objects. One row per alumni.

```ts
type Profile = {
  id: string;                    // stable uuid, never reused
  full_name: string;
  email: string;                 // private, never rendered on /connections
  graduation_year: number;       // e.g. 2018
  programme: string;             // "MSc Finance", "BSc Economics", etc
  current_role: string;          // "Senior Associate"
  current_company: string;       // "Goldman Sachs"
  industry: string;              // "Investment Banking"
  city: string;                  // "New York"
  linkedin_url?: string;
  bio: string;                   // 2 to 4 sentences, what they do day to day
  expertise: string[];           // ["LBO modelling", "Portuguese tax law"]
  looking_for: string[];         // ["co-founder, fintech", "junior PM hire", "intros to NYC VCs"]
  can_offer: string[];           // ["mock interviews for IB", "intros to my old GS team"]
  open_to: ("intro" | "mentorship" | "co_founder" | "hiring" | "investing" | "advice")[];
  created_at: string;            // ISO8601
  updated_at: string;            // ISO8601
};
```

## proposed-connections.json

Array of `ProposedConnection`. The agent only appends. Never reorders or deletes.

```ts
type ProposedConnection = {
  id: string;                    // uuid
  alumni_a_id: string;           // Profile.id
  alumni_b_id: string;           // Profile.id
  opportunity_type:
    | "job_referral"
    | "co_founder"
    | "mentorship"
    | "warm_intro"
    | "deal_flow"
    | "knowledge_swap";
  synergy_summary: string;       // 1 to 2 sentences, why these two should talk
  suggested_intro_message: string; // 4 to 8 sentences, drafted intro the human admin can copy paste
  confidence: number;            // 0 to 100, agent's own scoring
  signals: string[];             // bullet evidence: ["both worked at McKinsey 2015 to 2018", "A is hiring fintech analysts, B is looking for fintech analyst role"]
  generated_at: string;          // ISO8601
  generated_by_model: string;    // "claude-haiku-4.5"
  status: "pending" | "sent" | "dismissed" | "successful";
};
```

## Dedupe rule

The agent must never create a `ProposedConnection` whose `(alumni_a_id, alumni_b_id)` pair (in either order) already exists with status `pending`, `sent`, or `successful`. Pairs with status `dismissed` may be re-proposed only if at least one of the two profiles' `updated_at` is more recent than the dismissal.

## Privacy

`email` is for the admin only. The dashboard renders `full_name`, `current_role`, `current_company`, `programme`, `graduation_year`, the synergy summary, and the intro draft. It never renders the email.

## agent-activity.json

Append-only feed of what the OpenClaw agent did each tick. Powers `/agent`.

```ts
type AgentActivity = {
  id: string;                    // uuid
  ts: string;                    // ISO8601
  kind:
    | "tick_start"
    | "tick_end"
    | "profile_added"
    | "profile_updated"
    | "connection_proposed"
    | "connection_status_changed"
    | "self_improvement"        // agent edited its own prompt or rules
    | "error"
    | "note";                    // free-form agent thought
  summary: string;               // 1 line, human-readable
  details?: string;              // optional longer body, markdown
  related_profile_ids?: string[];
  related_connection_id?: string;
  model: string;                 // e.g. "claude-haiku-4.5"
};
```

The frontend treats this file as opaque newest-first when rendered.
