// Cloudflare Worker that dispatches the Oracle A1 grabber workflow on a 5-min schedule.
// Server-side, no laptop needed, no GH Actions cron throttling.
//
// Required secret (set via: wrangler secret put GH_TOKEN):
//   GH_TOKEN  - GitHub fine-grained PAT with "Actions: Read and Write" on tomasbb0/novasbealumni

interface Env {
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  WORKFLOW_FILE: string;
  GH_TOKEN: string;
}

async function dispatch(env: Env, source: string): Promise<Response> {
  const url = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/actions/workflows/${env.WORKFLOW_FILE}/dispatches`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.GH_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "oracle-grabber-cron-worker",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ref: "main" }),
  });
  const ts = new Date().toISOString();
  if (res.ok) {
    console.log(`[${ts}] ${source}: dispatched ok (${res.status})`);
    return new Response(`ok ${ts}`, { status: 200 });
  }
  const body = await res.text();
  console.error(`[${ts}] ${source}: dispatch failed ${res.status}: ${body}`);
  return new Response(`fail ${res.status}: ${body}`, { status: res.status });
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(dispatch(env, "cron").then(() => undefined));
  },

  async fetch(req: Request, env: Env): Promise<Response> {
    // Manual trigger via HTTPS for testing. Visit the worker URL to fire one immediately.
    const url = new URL(req.url);
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true, ts: new Date().toISOString() }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return dispatch(env, "manual");
  },
} satisfies ExportedHandler<Env>;
