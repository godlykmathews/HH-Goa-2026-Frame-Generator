const HEIC_MIME_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

const HEIC_FILE_EXTENSION = /\.(?:heic|heif)$/i;

type NamedBlob = Blob & { name?: string };

export function isHeicFile(file: NamedBlob): boolean {
  const mimeType = file.type.toLocaleLowerCase("en-US").split(";", 1)[0].trim();
  return HEIC_MIME_TYPES.has(mimeType) || HEIC_FILE_EXTENSION.test(file.name ?? "");
}

/**
 * Converts an iPhone HEIC/HEIF image entirely in the browser. `heic2any` is
 * dynamically imported so its decoder is excluded from the initial page bundle.
 */
export async function convertHeic(file: NamedBlob): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("HEIC photos can only be converted in your browser.");
  }

  if (!isHeicFile(file)) {
    throw new Error("This file is not recognized as a HEIC or HEIF photo.");
  }

  try {
    const { default: heic2any } = await import("heic2any");
    const result = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.94,
      multiple: true,
    });
    const converted = Array.isArray(result) ? result[0] : result;

    if (!(converted instanceof Blob) || converted.size === 0) {
      throw new Error("The converter did not return an image.");
    }

    return converted.type === "image/jpeg"
      ? converted
      : new Blob([converted], { type: "image/jpeg" });
  } catch (error) {
    const reason = error instanceof Error ? error.message.toLocaleLowerCase("en-US") : "";

    if (reason.includes("memory") || reason.includes("allocation")) {
      throw new Error(
        "This HEIC photo is too large to convert on this device. Try a smaller photo or export it as JPEG.",
      );
    }

    throw new Error(
      "We couldn't convert this HEIC photo. Try choosing it again, or export it as JPEG or PNG.",
    );
  }
}

export const convertHeicToJpeg = convertHeic;
