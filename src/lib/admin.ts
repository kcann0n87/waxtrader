import "server-only";
import { createClient } from "./supabase/server";

/**
 * Returns the current admin user, or null if the request isn't from a
 * signed-in admin. Use in server components / route handlers as the FIRST
 * line of defense — never trust the route path alone.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) return null;
  return { ...profile, id: user.id, email: user.email };
}

/**
 * Convenience: throw 404 if not admin so server components can simply
 * call this at the top.
 */
export async function requireAdminOrNotFound() {
  const admin = await requireAdmin();
  if (!admin) {
    const { notFound } = await import("next/navigation");
    notFound();
  }
  return admin!;
}

/**
 * Append a row to admin_actions. Best-effort — failures are logged but
 * never block the actual operation.
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  details?: Record<string, unknown>,
) {
  try {
    const supabase = await createClient();
    await supabase.from("admin_actions").insert({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details: details ?? null,
    });
  } catch (e) {
    console.error("logAdminAction failed:", e);
  }
}
