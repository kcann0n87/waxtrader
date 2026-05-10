import "server-only";
import { cookies } from "next/headers";
import { requireAdmin } from "./admin";

/**
 * Admin "preview mode" lets a signed-in admin see is_published=false
 * SKUs everywhere on the site as if they were published — catalog,
 * search, release calendar, product pages, the lot. Used to stage a
 * new sport / set of products and walk through the buyer experience
 * before flipping any rows live.
 *
 * The toggle is a cookie (`wd_preview`). Anyone can have the cookie
 * set, but the resolver below requires both the cookie AND a valid
 * admin session before it returns true. So a non-admin manually
 * setting the cookie gets nothing — they still see the public catalog.
 *
 * Server actions in @/app/actions/preview-mode.ts read/write the
 * cookie. UI components (admin nav, floating pill) call those.
 */

const COOKIE = "wd_preview";

/**
 * Returns true when the current request should bypass the
 * is_published filter. Caches the result on the cookies()/admin lookup
 * pair — Next dedupes those automatically across a single request.
 */
export async function isPreviewModeOn(): Promise<boolean> {
  const cookieStore = await cookies();
  if (cookieStore.get(COOKIE)?.value !== "1") return false;
  const admin = await requireAdmin();
  return !!admin;
}

export const PREVIEW_COOKIE_NAME = COOKIE;
