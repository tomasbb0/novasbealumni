import "dotenv/config";

import Fastify from "fastify";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runAgent } from "./agent.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const profilesPath = path.join(__dirname, "..", "data", "profiles.json");
const app = Fastify({ logger: true });
const activeStreams = new Map();

function createSessionId() {
  return globalThis.crypto?.randomUUID?.() ?? `session-${Date.now()}`;
}

async function loadProfiles() {
  const raw = await fs.readFile(profilesPath, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function writeSse(raw, event) {
  raw.write(`data: ${JSON.stringify(event)}\n\n`);
}

app.addHook("onRequest", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  reply.header("Access-Control-Allow-Headers", "Content-Type");
  reply.header("Cache-Control", "no-store");

  if (request.method === "OPTIONS") {
    reply.status(204).send();
  }
});

app.get("/health", async () => ({ ok: true }));

app.post("/chat", async (request, reply) => {
  const body = request.body ?? {};
  const query = typeof body.query === "string" ? body.query.trim() : "";

  if (!query) {
    return reply.status(400).send({ error: "query is required" });
  }

  const sessionId = typeof body.sessionId === "string" && body.sessionId.trim()
    ? body.sessionId.trim()
    : createSessionId();
  const controller = new AbortController();

  reply.raw.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Connection": "keep-alive",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
  });
  reply.raw.write(`event: ready\ndata: ${JSON.stringify({ type: "ready", sessionId })}\n\n`);

  const send = (event) => writeSse(reply.raw, event);
  activeStreams.set(sessionId, { controller, send, startedAt: Date.now() });

  request.raw.on("close", () => {
    controller.abort();
    activeStreams.delete(sessionId);
  });

  try {
    const profiles = await loadProfiles();

    if (body.emailMe?.email) {
      send({
        type: "narration",
        text: `Recebi o email ${body.emailMe.email}. Se fechares o portátil, continuo deste lado. `,
      });
    }

    await runAgent(query, profiles, send, { signal: controller.signal });
    send({ type: "done" });
  } catch (error) {
    if (controller.signal.aborted) {
      send({ type: "interrupted", text: "Diz-me o que mudar." });
    } else {
      request.log.error(error);
      send({
        type: "error",
        text: error instanceof Error ? error.message : "Agent error",
      });
    }
  } finally {
    activeStreams.delete(sessionId);
    reply.raw.end();
  }
});

app.post("/chat/:sessionId/interrupt", async (request, reply) => {
  const { sessionId } = request.params;
  const active = activeStreams.get(sessionId);

  if (!active) {
    return reply.status(404).send({ ok: false, error: "session not found" });
  }

  active.send({ type: "interrupted", text: "Diz-me o que mudar." });
  active.controller.abort();
  activeStreams.delete(sessionId);
  return { ok: true };
});

const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? "0.0.0.0";

app.listen({ port, host }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
