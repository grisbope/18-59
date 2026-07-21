import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function supabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || undefined;
}

/** Publishable (sb_publishable_…) o anon JWT legacy. */
export function supabasePublishableKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    undefined
  );
}

/** Secret (sb_secret_…) o service_role JWT legacy. */
export function supabaseSecretKey(): string | undefined {
  return (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    undefined
  );
}

export function getSupabaseBrowser(): SupabaseClient | null {
  const url = supabaseUrl();
  const key = supabasePublishableKey();
  if (!url || !key) return null;
  return createClient(url, key);
}

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = supabaseUrl();
  const key = supabaseSecretKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function hasSupabase(): boolean {
  return Boolean(supabaseUrl() && (supabasePublishableKey() || supabaseSecretKey()));
}

export const STORAGE_BUCKET = "app1859";
export const STATS_OBJECT = "community/sector_stats.json";
