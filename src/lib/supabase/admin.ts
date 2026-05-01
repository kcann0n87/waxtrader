import "server-only";
import { createClient as createSbAdmin } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for admin server actions only. Bypasses RLS
 * entirely — caller MUST verify the request is from an admin first via
 * requireAdmin() in @/lib/admin before using this.
 */
export function serviceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase service credentials not configured");
  }
  return createSbAdmin(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
