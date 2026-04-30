# Data contract: worked examples

These are realistic, filled-in examples of each file in `data/`. Use as ground truth when wiring the sibling in-app agent. The TS types live in `src/lib/connections.ts` and `src/lib/activity.ts`. The narrative spec lives in `SCHEMA.md`.

## profiles.json — example entry

```json
{
  "id": "p_01HZ4T8K9V3Q2R7N6M5W3X2Y1Z",
  "full_name": "Madalena Faria",
  "email": "madalena.faria@example.com",
  "graduation_year": 2019,
  "programme": "MSc Finance",
  "current_role": "Senior Associate, M&A",
  "current_company": "Lazard",
  "industry": "Investment Banking",
  "city": "New York",
  "linkedin_url": "https://linkedin.com/in/madalena-faria",
  "bio": "Five years in cross-border M&A, mostly EU industrials and US tech. Currently helping a Portuguese family office think through a US tech bolt-on. Looking to swap notes with anyone who has run a successful Iberia to US tech acquisition.",
  "expertise": ["LBO modelling", "EU industrials M&A", "Iberian family office dynamics"],
  "looking_for": ["intros to US tech corp dev", "comparables for sub-100m EU to US deals"],
  "can_offer": ["mock IB interviews", "review of Iberia-focused models", "intros to Lisbon PE shops"],
  "open_to": ["intro", "mentorship", "advice"],
  "created_at": "2026-04-29T18:24:11.000Z",
  "updated_at": "2026-04-29T18:24:11.000Z"
}
```

## proposed-connections.json — example entry

```json
{
  "id": "c_01HZ4T9X8K2P3Q5R6N7M4V3W2Y",
  "alumni_a_id": "p_01HZ4T8K9V3Q2R7N6M5W3X2Y1Z",
  "alumni_b_id": "p_01HZ4TAB5C6D7E8F9G2H3J4K5L",
  "opportunity_type": "warm_intro",
  "synergy_summary": "Madalena is sourcing US tech corp dev intros for an Iberia client. João runs corp dev at a NYC mid-market SaaS firm and has explicitly said he is open to deal flow conversations.",
  "suggested_intro_message": "Hi João, hi Madalena.\n\nIntroducing two Nova SBE NYC alumni who should know each other.\n\nMadalena (Lazard, MSc Finance 2019) is advising a Portuguese family office on a potential US tech bolt-on, sub-100m EV, EU industrial buyer thesis with a US tech leg. She is looking for corp dev counterparts to sanity-check approach.\n\nJoão (corp dev lead at a NYC mid-market SaaS firm, MSc Management 2017) has been open to inbound conversations on tuck-in deals and might enjoy comparing notes even if there is no transaction.\n\nI will let the two of you take it from here.\n\nBest,\nNova SBE NY",
  "confidence": 78,
  "signals": [
    "Madalena listed 'intros to US tech corp dev' in looking_for",
    "João's open_to includes 'intro' and 'deal_flow'",
    "Both flagged availability for casual 30-min calls in their bio"
  ],
  "generated_at": "2026-04-30T02:15:00.000Z",
  "generated_by_model": "claude-haiku-4.5",
  "status": "pending"
}
```

## agent-activity.json — example entries

```json
[
  {
    "id": "a_01HZ4TC0001",
    "ts": "2026-04-30T02:15:00.000Z",
    "kind": "tick_start",
    "summary": "Tick triggered by new profile p_01HZ4TAB5C6D7E8F9G2H3J4K5L",
    "model": "claude-haiku-4.5"
  },
  {
    "id": "a_01HZ4TC0002",
    "ts": "2026-04-30T02:15:43.000Z",
    "kind": "connection_proposed",
    "summary": "Drafted warm intro between Madalena Faria and João Silva (confidence 78)",
    "related_profile_ids": [
      "p_01HZ4T8K9V3Q2R7N6M5W3X2Y1Z",
      "p_01HZ4TAB5C6D7E8F9G2H3J4K5L"
    ],
    "related_connection_id": "c_01HZ4T9X8K2P3Q5R6N7M4V3W2Y",
    "model": "claude-haiku-4.5"
  },
  {
    "id": "a_01HZ4TC0003",
    "ts": "2026-04-30T02:15:48.000Z",
    "kind": "tick_end",
    "summary": "Tick complete. 1 connection proposed. Committing.",
    "model": "claude-haiku-4.5"
  }
]
```

## /onboard chat endpoint contract

The `/onboard` page POSTs to whatever URL is set in `NEXT_PUBLIC_AGENT_CHAT_URL` at build time.

Request:
```json
{
  "session_id": "client-generated-uuid",
  "message": "user's latest message",
  "history": [
    { "role": "agent", "text": "..." },
    { "role": "user", "text": "..." }
  ]
}
```

Response:
```json
{ "reply": "agent's reply text" }
```

The agent is responsible for parsing the conversation, extracting profile fields, eventually appending to `profiles.json` (and optionally pushing). The frontend does not own the writes.
