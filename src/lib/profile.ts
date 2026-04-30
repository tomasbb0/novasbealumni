import { getSupabase } from "./supabase";

export type Profile = {
  id: string;
  full_name: string | null;
  headline: string | null;
  programme: string | null;
  grad_year: number | null;
  current_company: string | null;
  current_role: string | null;
  city: string | null;
  country: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  offering: string | null;
  seeking: string | null;
  updated_at: string | null;
};

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile) ?? null;
}

export async function upsertProfile(p: Partial<Profile> & { id: string }): Promise<void> {
  const { error } = await getSupabase()
    .from("profiles")
    .upsert({ ...p, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw error;
}

export function isProfileComplete(p: Profile | null): boolean {
  if (!p) return false;
  return Boolean(p.full_name && p.programme && p.grad_year && p.city);
}
