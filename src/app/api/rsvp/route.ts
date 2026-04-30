import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

type Rsvp = {
  name: string;
  email: string;
  gradYear: string;
  programme?: string;
  currentRole?: string;
  attending?: string;
  notes?: string;
  ts: string;
  ip?: string;
};

const FILE = path.join(process.cwd(), "data", "rsvp.json");

async function readAll(): Promise<Rsvp[]> {
  try {
    const buf = await fs.readFile(FILE, "utf8");
    const j = JSON.parse(buf);
    return Array.isArray(j) ? j : [];
  } catch {
    return [];
  }
}

async function writeAll(rows: Rsvp[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(rows, null, 2), "utf8");
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

async function relayWebhook(row: Rsvp) {
  const url = process.env.RSVP_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "rsvp", row }),
    });
  } catch (err) {
    console.error("rsvp webhook failed", err);
  }
}

async function relayDiscord(row: Rsvp) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  const sep = " | ";
  const parts: string[] = [];
  parts.push("**New RSVP**" + sep + row.name + " (" + row.email + ")");
  parts.push("Grad " + row.gradYear + (row.programme ? sep + row.programme : ""));
  if (row.currentRole) parts.push("Role: " + row.currentRole);
  parts.push("Attending: " + (row.attending || "yes"));
  if (row.notes) parts.push("Notes: " + row.notes);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: parts.join("\n") }),
    });
  } catch (err) {
    console.error("discord webhook failed", err);
  }
}

async function relayResend(row: Rsvp) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.RSVP_NOTIFY_EMAIL;
  if (!key || !to) return;
  const from = process.env.RSVP_FROM_EMAIL || "Nova SBE Alumni <onboarding@resend.dev>";
  const subject = "New RSVP: " + row.name;
  const text = JSON.stringify(row, null, 2);
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, text }),
    });
  } catch (err) {
    console.error("resend relay failed", err);
  }
}

export async function POST(req: Request) {
  let body: Partial<Rsvp> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const gradYear = String(body.gradYear || "").trim();

  if (!name || !email || !gradYear) {
    return NextResponse.json(
      { error: "Name, email and grad year are required." },
      { status: 400 }
    );
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: "That email looks off." }, { status: 400 });
  }

  const row: Rsvp = {
    name,
    email,
    gradYear,
    programme: String(body.programme || "").trim() || undefined,
    currentRole: String(body.currentRole || "").trim() || undefined,
    attending: String(body.attending || "yes"),
    notes: String(body.notes || "").trim() || undefined,
    ts: new Date().toISOString(),
    ip: req.headers.get("x-forwarded-for") || undefined,
  };

  console.log("[rsvp]", JSON.stringify(row));

  try {
    const all = await readAll();
    if (!all.find((r) => r.email === email)) {
      all.push(row);
      await writeAll(all);
    }
  } catch (err) {
    console.error("rsvp file persist failed (expected on serverless)", err);
  }

  await Promise.allSettled([relayWebhook(row), relayDiscord(row), relayResend(row)]);

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const all = await readAll();
  return NextResponse.json({ count: all.length });
}
