"use client";

export interface ShareToXOptions {
  builderTitle: string;
  shareUrl: string;
}

export type ShareToXResult =
  | { status: "opened"; intentUrl: string }
  | { status: "blocked"; intentUrl: string };

function cleanBuilderTitle(builderTitle: string): string {
  const cleaned = builderTitle
    .replace(/#frameingoa/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || "Goa Builder";
}

function requirePublicUrl(shareUrl: string): string {
  const parsed = new URL(shareUrl);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Share URL must use http or https.");
  }
  return parsed.toString();
}

export function buildXShareCaption(options: ShareToXOptions): string {
  const shareUrl = requirePublicUrl(options.shareUrl);

  return [
    "I'm ready to build at HH Goa 2026 🌴⚡",
    "",
    "Apparently I'm:",
    `"${cleanBuilderTitle(options.builderTitle)}"`,
    "",
    "Create your HH Goa builder card:",
    shareUrl,
    "",
    "#FrameInGoa #HHGoa2026",
  ].join("\n");
}

export function buildXIntentUrl(options: ShareToXOptions): string {
  const params = new URLSearchParams({ text: buildXShareCaption(options) });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/** Opens a real X Web Intent and reports popup blocking to the UI. */
export function openShareToX(options: ShareToXOptions): ShareToXResult {
  const intentUrl = buildXIntentUrl(options);
  const popup = window.open(intentUrl, "_blank");

  if (!popup) {
    return { status: "blocked", intentUrl };
  }

  popup.opener = null;
  return { status: "opened", intentUrl };
}
