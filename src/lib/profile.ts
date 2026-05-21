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
  rich_profile: RichProfile | null;
  updated_at: string | null;
};

export type RichProfile = {
  about?: string | null;
  educations: { school: string | null; degree: string | null; field: string | null; start: number | null; end: number | null; description: string | null; logo?: unknown }[];
  experiences: { company: string | null; role: string | null; location: string | null; start: number | null; end: number | null; current: boolean; description: string | null; logo?: unknown }[];
  skills: { name: string | null; endorsements?: number | null }[];
  languages: { name: string | null; proficiency?: string | null }[];
  certifications: { name: string | null; issuer: string | null; year: number | null }[];
  honors?: { title: string | null; issuer: string | null; year: number | null }[];
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
