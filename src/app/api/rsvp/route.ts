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

  // Best-effort persistence. On read-only filesystems (e.g. Vercel serverless)
  // this will fail; swap for KV / Supabase / Resend before going to prod.
  try {
    const all = await readAll();
    if (!all.find((r) => r.email === email)) {
      all.push(row);
      await writeAll(all);
    }
  } catch (err) {
    console.error("rsvp persist failed", err);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const all = await readAll();
  return NextResponse.json({ count: all.length });
}
