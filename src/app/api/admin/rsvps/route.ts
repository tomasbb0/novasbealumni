import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const FILE = path.join(process.cwd(), "data", "rsvp.json");

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const required = process.env.ADMIN_TOKEN || "dev";
  if (token !== required) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const buf = await fs.readFile(FILE, "utf8");
    const rows = JSON.parse(buf);
    return NextResponse.json({ count: Array.isArray(rows) ? rows.length : 0, rows });
  } catch {
    return NextResponse.json({ count: 0, rows: [] });
  }
}
