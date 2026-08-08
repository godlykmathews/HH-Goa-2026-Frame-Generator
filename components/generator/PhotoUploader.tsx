"use client";

/* eslint-disable @next/next/no-img-element */

import { AlertCircle, ImagePlus, LoaderCircle, Upload } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";

interface PhotoUploaderProps {
  busy: boolean;
  error: string | null;
  fileName: string | null;
  previewUrl: string | null;
  onFile: (file: File) => void;
}

export function PhotoUploader({ busy, error, fileName, previewUrl, onFile }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const useDroppedFile = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files.item(0);
    if (file) onFile(file);
  };

  return (
    <div>
      <label
        htmlFor="builder-photo"
        onDragEnter={(event) => {
          event.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={useDroppedFile}
        className={`group relative flex min-h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-5 py-7 text-center transition focus-within:outline focus-within:outline-3 focus-within:outline-offset-4 focus-within:outline-[#fee101] ${
          dragging
            ? "border-[#ff1684] bg-[#ff1684]/10"
            : error
              ? "border-red-500 bg-red-50"
              : "border-[#006b3c]/30 bg-[#006b3c]/[0.035] hover:border-[#006b3c]/60 hover:bg-[#006b3c]/[0.07]"
        }`}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Selected photo preview"
              className="absolute inset-0 size-full object-cover opacity-18 blur-[2px] transition group-hover:opacity-25"
            />
            <div className="absolute inset-0 bg-[#fff9dc]/80" />
          </>
        ) : null}
        <input
          ref={inputRef}
          id="builder-photo"
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
          disabled={busy}
          aria-describedby={error ? "photo-error photo-formats" : "photo-formats"}
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            const file = event.currentTarget.files?.item(0);
            if (file) onFile(file);
            event.currentTarget.value = "";
          }}
        />

        <div className="relative flex flex-col items-center">
          <span className="mb-4 grid size-12 place-items-center rounded-full bg-[#006b3c] text-[#fee101] shadow-[3px_3px_0_#ff1684]">
            {busy ? (
              <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
            ) : previewUrl ? (
              <ImagePlus className="size-6" aria-hidden="true" />
            ) : (
              <Upload className="size-6" aria-hidden="true" />
            )}
          </span>
          <span className="font-black text-[#003c24]" aria-live="polite">
            {busy ? "Getting your photo ready…" : previewUrl ? "Choose a different photo" : "Drop a photo or tap to choose"}
          </span>
          {fileName ? <span className="mt-1 max-w-64 truncate text-xs text-[#006b3c]/65">{fileName}</span> : null}
          <span id="photo-formats" className="mt-2 font-mono-hh text-[10px] uppercase tracking-[0.12em] text-[#003c24]/55">
            JPG · PNG · WEBP · HEIC/HEIF · max 40 MB
          </span>
        </div>
      </label>

      {error ? (
        <p id="photo-error" role="alert" className="mt-3 flex items-start gap-2 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
