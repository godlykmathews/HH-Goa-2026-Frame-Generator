import type { DecodedImage } from "@/types";
import { convertHeic, isHeicFile } from "./convertHeic";

export const MAX_IMAGE_FILE_SIZE = 30 * 1024 * 1024;

export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
] as const;

const SUPPORTED_MIME_TYPES = new Set<string>(SUPPORTED_IMAGE_MIME_TYPES);
const SUPPORTED_FILE_EXTENSION = /\.(?:jpe?g|png|webp|heic|heif)$/i;

function fileLooksSupported(file: File): boolean {
  const mimeType = file.type.toLocaleLowerCase("en-US").split(";", 1)[0].trim();
  return SUPPORTED_MIME_TYPES.has(mimeType) || SUPPORTED_FILE_EXTENSION.test(file.name);
}

function validateImageFile(file: File): void {
  if (!(file instanceof Blob)) {
    throw new Error("Choose a photo from your device to continue.");
  }

  if (file.size === 0) {
    throw new Error("This photo is empty. Choose a different image.");
  }

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    throw new Error("This photo is larger than 30 MB. Choose a smaller image.");
  }

  if (!fileLooksSupported(file)) {
    throw new Error("Choose a JPG, PNG, WEBP, HEIC, or HEIF photo.");
  }
}

function loadBrowserImage(objectUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The browser could not decode this photo."));
    image.src = objectUrl;
  });
}

/**
 * Validates and decodes an upload locally. Successful calls return a dedicated
 * object URL which must be revoked by the caller when the image is replaced.
 */
export async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof window === "undefined" || typeof URL.createObjectURL !== "function") {
    throw new Error("Photos can only be opened in your browser.");
  }

  validateImageFile(file);

  const wasConvertedFromHeic = isHeicFile(file);
  const drawableBlob = wasConvertedFromHeic ? await convertHeic(file) : file;
  const objectUrl = URL.createObjectURL(drawableBlob);

  try {
    const image = await loadBrowserImage(objectUrl);
    const width = image.naturalWidth;
    const height = image.naturalHeight;

    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
      throw new Error("This photo does not contain a usable image.");
    }

    return {
      source: image,
      width,
      height,
      objectUrl,
      mimeType: drawableBlob.type || "image/jpeg",
      wasConvertedFromHeic,
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);

    if (error instanceof Error && error.message === "This photo does not contain a usable image.") {
      throw error;
    }

    throw new Error(
      "We couldn't open this photo. It may be damaged or use an unsupported image variant.",
    );
  }
}
