"use client";

import { getSupabase, hasSupabaseConfig } from "./supabase";

export type AlumniEvent = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string | null;
  date_label: string | null;
  venue_label: string | null;
  city: string | null;
  rsvp_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type EventInput = {
  id?: string;
  title: string;
  description?: string | null;
  starts_at?: string | null;
  date_label?: string | null;
  venue_label?: string | null;
  city?: string | null;
  rsvp_url?: string | null;
  is_published?: boolean;
};

export async function listUpcomingEvents(limit = 10): Promise<AlumniEvent[]> {
  if (!hasSupabaseConfig()) return [];
  const nowIso = new Date().toISOString();
  const { data, error } = await getSupabase()
    .from("events")
    .select("*")
    .eq("is_published", true)
    .or(`starts_at.gte.${nowIso},starts_at.is.null`)
    .order("starts_at", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as AlumniEvent[];
}

export async function listAllEvents(): Promise<AlumniEvent[]> {
  if (!hasSupabaseConfig()) return [];
  const { data, error } = await getSupabase()
    .from("events")
    .select("*")
    .order("starts_at", { ascending: true, nullsFirst: false });
  if (error) return [];
  return (data ?? []) as AlumniEvent[];
}

export async function upsertEvent(input: EventInput): Promise<AlumniEvent | null> {
  if (!hasSupabaseConfig()) return null;
  const supabase = getSupabase();
  const payload = { ...input, updated_at: new Date().toISOString() };
  const { data, error } = input.id
    ? await supabase.from("events").update(payload).eq("id", input.id).select().single()
    : await supabase.from("events").insert(payload).select().single();
  if (error) throw error;
  return data as AlumniEvent;
}

export async function deleteEvent(id: string): Promise<void> {
  if (!hasSupabaseConfig()) return;
  const { error } = await getSupabase().from("events").delete().eq("id", id);
  if (error) throw error;
}
