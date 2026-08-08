"use client";

export interface NativeShareOptions {
  blob: Blob;
  builderTitle: string;
  filename?: string;
  /** Used only as a link-only fallback after a public share already exists. */
  fallbackUrl?: string;
}

export type NativeShareResult =
  | { status: "shared"; mode: "file" | "link" }
  | { status: "cancelled" }
  | { status: "unsupported"; message: string }
  | { status: "failed"; message: string };

function cleanBuilderTitle(builderTitle: string): string {
  const cleaned = builderTitle
    .replace(/#frameingoa/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || "Goa Builder";
}

export function buildNativeShareCaption(builderTitle: string): string {
  return [
    "I'm building at HH Goa 2026 🌴⚡",
    "",
    "My builder identity:",
    cleanBuilderTitle(builderTitle),
    "",
    "Create yours 👇",
    "",
    "#FrameInGoa",
  ].join("\n");
}

function imageFilename(filename: string | undefined, mimeType: string): string {
  const extension = mimeType === "image/jpeg" ? "jpg" : "png";
  const base = (filename ?? "hh-goa-2026-builder-card")
    .replace(/\.(?:png|jpe?g)$/i, "")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

  return `${base || "hh-goa-2026-builder-card"}.${extension}`;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/** Shares the generated image as a local File when the browser supports it. */
export async function shareNative(
  options: NativeShareOptions,
): Promise<NativeShareResult> {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return {
      status: "unsupported",
      message: "Native sharing is unavailable here. Download the image instead.",
    };
  }

  if (options.blob.type !== "image/png" && options.blob.type !== "image/jpeg") {
    return {
      status: "failed",
      message: "Generate the card again before sharing it.",
    };
  }

  const caption = buildNativeShareCaption(options.builderTitle);
  const file = new File(
    [options.blob],
    imageFilename(options.filename, options.blob.type),
    { type: options.blob.type },
  );

  let canShareFile = false;
  if (typeof navigator.canShare === "function") {
    try {
      canShareFile = navigator.canShare({ files: [file] });
    } catch {
      canShareFile = false;
    }
  }

  try {
    if (canShareFile) {
      await navigator.share({
        files: [file],
        text: caption,
        title: "My HH Goa 2026 Builder Card",
      });
      return { status: "shared", mode: "file" };
    }

    if (options.fallbackUrl) {
      await navigator.share({
        text: caption,
        title: "My HH Goa 2026 Builder Card",
        url: options.fallbackUrl,
      });
      return { status: "shared", mode: "link" };
    }

    return {
      status: "unsupported",
      message: "This browser cannot share image files. Download the card to share it manually.",
    };
  } catch (error) {
    if (isAbortError(error)) {
      return { status: "cancelled" };
    }

    return {
      status: "failed",
      message: "The share sheet could not open. Download the image and share it manually.",
    };
  }
}
