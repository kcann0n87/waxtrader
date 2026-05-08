import "server-only";
import { isPreviewModeOn } from "@/lib/preview-mode";
import { PreviewModePillClient } from "./preview-mode-pill-client";

/**
 * Server wrapper that only renders the client pill component when
 * preview mode is currently active. Prevents the "off" state from
 * shipping client JS to non-admin visitors.
 */
export async function PreviewModePill() {
  const on = await isPreviewModeOn();
  if (!on) return null;
  return <PreviewModePillClient />;
}
