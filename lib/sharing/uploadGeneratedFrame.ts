"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const BUCKET_NAME = "generated-frames";
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const SHARE_ID_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const SHARE_ID_LENGTH = 8;
const MAX_ID_ATTEMPTS = 4;

export type ShareUploadErrorCode =
  | "configuration"
  | "invalid-image"
  | "storage"
  | "database"
  | "origin";

export class ShareUploadError extends Error {
  readonly code: ShareUploadErrorCode;

  constructor(code: ShareUploadErrorCode, message: string) {
    super(message);
    this.name = "ShareUploadError";
    this.code = code;
  }
}

export interface GeneratedFrameShare {
  shareId: string;
  imageUrl: string;
  shareUrl: string;
}

export interface UploadGeneratedFrameOptions {
  /** Defaults to window.location.origin, then NEXT_PUBLIC_SITE_URL. */
  origin?: string;
}

function getImageExtension(blob: Blob): "png" | "jpg" {
  if (blob.type === "image/png") {
    return "png";
  }

  if (blob.type === "image/jpeg") {
    return "jpg";
  }

  throw new ShareUploadError(
    "invalid-image",
    "The finished card must be a PNG or JPEG image.",
  );
}

function validateBlob(blob: Blob): void {
  if (blob.size === 0) {
    throw new ShareUploadError(
      "invalid-image",
      "The finished card is empty. Generate it again and retry.",
    );
  }

  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new ShareUploadError(
      "invalid-image",
      "The finished card is larger than the 10 MB sharing limit. Download still works.",
    );
  }
}

function createShareId(): string {
  if (!globalThis.crypto?.getRandomValues) {
    throw new ShareUploadError(
      "configuration",
      "Secure link generation is unavailable in this browser.",
    );
  }

  const random = new Uint8Array(SHARE_ID_LENGTH);
  globalThis.crypto.getRandomValues(random);

  // The alphabet has 32 characters, so masking preserves a uniform result.
  return Array.from(random, (value) => SHARE_ID_ALPHABET[value & 31]).join("");
}

function getShareOrigin(explicitOrigin?: string): string {
  const candidate =
    explicitOrigin ??
    (typeof window !== "undefined" ? window.location.origin : undefined) ??
    process.env.NEXT_PUBLIC_SITE_URL;

  if (!candidate) {
    throw new ShareUploadError(
      "origin",
      "The public site URL is not configured. Download still works.",
    );
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("Unsupported URL protocol");
    }
    return parsed.origin;
  } catch {
    throw new ShareUploadError(
      "origin",
      "The public site URL is invalid. Download still works.",
    );
  }
}

function isDuplicateKeyError(error: { code?: string; message?: string }): boolean {
  return error.code === "23505" || /duplicate|unique/i.test(error.message ?? "");
}

/**
 * Publishes only the finished canvas Blob. Call this from an explicit public
 * sharing action; local download and native file sharing do not need Supabase.
 */
export async function uploadGeneratedFrame(
  blob: Blob,
  options: UploadGeneratedFrameOptions = {},
): Promise<GeneratedFrameShare> {
  validateBlob(blob);
  const extension = getImageExtension(blob);
  const origin = getShareOrigin(options.origin);
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new ShareUploadError(
      "configuration",
      "Public sharing is not configured yet. You can still download your card.",
    );
  }

  for (let attempt = 0; attempt < MAX_ID_ATTEMPTS; attempt += 1) {
    const shareId = createShareId();
    const objectPath = `${shareId}.${extension}`;
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(objectPath);
    const imageUrl = publicUrlData.publicUrl;

    // Reserve the random ID before uploading so a database failure cannot
    // leave a user's card behind as an untracked public object.
    const { error: recordError } = await supabase
      .from("generated_frames")
      .insert({ id: shareId, image_url: imageUrl });

    if (recordError) {
      if (isDuplicateKeyError(recordError)) {
        continue;
      }

      throw new ShareUploadError(
        "database",
        "We could not create the public share link. Your local download is unaffected.",
      );
    }

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(objectPath, blob, {
        cacheControl: "31536000",
        contentType: blob.type,
        upsert: false,
      });

    if (uploadError) {
      // The migration exposes a narrow rollback function that removes only a
      // recent record whose matching Storage object does not exist. This keeps
      // network failures from accumulating broken share routes without giving
      // anonymous clients permission to delete valid frames.
      await supabase.rpc("discard_incomplete_frame", { frame_id: shareId });

      throw new ShareUploadError(
        "storage",
        "We could not upload the finished card. Check your connection and retry; downloading still works.",
      );
    }

    return {
      shareId,
      imageUrl,
      shareUrl: new URL(`/frame/${shareId}`, origin).toString(),
    };
  }

  throw new ShareUploadError(
    "database",
    "We could not reserve a share link. Please try once more.",
  );
}
