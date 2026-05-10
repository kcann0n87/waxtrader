"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { PREVIEW_COOKIE_NAME } from "@/lib/preview-mode";

/**
 * Toggle admin preview mode (the wd_preview cookie). Admin-only —
 * non-admins calling this do nothing; the cookie isn't useful to
 * them anyway because isPreviewModeOn() also gates on requireAdmin.
 *
 * 1-year max-age cookie — long enough to forget about, short enough
 * to expire on stale clients. httpOnly + secure so JS can't read it.
 */
export async function setPreviewMode(on: boolean): Promise<{ ok: boolean }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };

  const cookieStore = await cookies();
  if (on) {
    cookieStore.set(PREVIEW_COOKIE_NAME, "1", {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  } else {
    cookieStore.delete(PREVIEW_COOKIE_NAME);
  }
  // Public catalog pages cache aggressively at the data-layer level,
  // so revalidate the most-visited paths whenever the toggle flips.
  revalidatePath("/", "layout");
  return { ok: true };
}
