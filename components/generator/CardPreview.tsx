"use client";

/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import type { ImageTransform } from "@/types";

interface CardPreviewProps {
  builderTitle: string;
  imageHeight: number | null;
  imageWidth: number | null;
  name: string;
  previewUrl: string | null;
  role: string;
  transform: ImageTransform;
}

function photoStyle(imageWidth: number, imageHeight: number, transform: ImageTransform) {
  const imageRatio = imageWidth / imageHeight;
  const viewportRatio = 4 / 3;
  let baseWidth = 100;
  let baseHeight = 100;

  if (imageRatio > viewportRatio) baseWidth = (imageRatio / viewportRatio) * 100;
  else baseHeight = (viewportRatio / imageRatio) * 100;

  const width = baseWidth * transform.zoom;
  const height = baseHeight * transform.zoom;
  const shiftX = ((width - 100) / 2) * transform.offsetX;
  const shiftY = ((height - 100) / 2) * transform.offsetY;

  return {
    width: `${width}%`,
    height: `${height}%`,
    left: `calc(50% + ${shiftX}%)`,
    top: `calc(50% + ${shiftY}%)`,
    transform: "translate(-50%, -50%)",
  };
}

export function CardPreview({
  builderTitle,
  imageHeight,
  imageWidth,
  name,
  previewUrl,
  role,
  transform,
}: CardPreviewProps) {
  const fittedPhoto = previewUrl && imageWidth && imageHeight ? photoStyle(imageWidth, imageHeight, transform) : null;
  const nameSize = name.length > 28 ? "text-[clamp(.8rem,3.7vw,1.45rem)]" : "text-[clamp(1rem,4.8vw,1.8rem)]";

  return (
    <figure>
      <div
        className="relative mx-auto aspect-[4/5] w-full max-w-[30rem] overflow-hidden rounded-[1.5rem] border-2 border-[#fee101]/70 bg-[#006b3c] shadow-[0_24px_70px_rgba(0,36,22,.35)] sm:rounded-[2rem]"
        aria-label="Live HH Goa 2026 builder card layout preview"
      >
        <Image src="/brand/patterns/tech-weave.svg" alt="" fill sizes="(max-width: 1024px) 90vw, 420px" className="object-cover opacity-55" />

        <div className="absolute inset-x-[6.66%] top-[2.9%] flex h-[12.5%] items-center justify-between gap-3">
          <Image
            src="/brand/hh-goa-wordmark.svg"
            alt="HH Goa 2026"
            width={600}
            height={210}
            className="h-auto w-[48%] max-w-48"
          />
          <div className="text-right font-mono-hh text-[clamp(.38rem,1.5vw,.62rem)] uppercase tracking-[0.16em] text-[#fee101]">
            <span className="block text-white/65">Builder pass</span>
            <span>GOA / 28—31 OCT</span>
          </div>
        </div>

        <div className="absolute left-[6.66%] top-[18.52%] aspect-[4/3] w-[86.67%] overflow-hidden rounded-[3%] bg-[#003c24] shadow-[0_0_0_2px_rgba(254,225,1,.75)]">
          {fittedPhoto ? (
            <img src={previewUrl ?? undefined} alt="" draggable={false} className="absolute max-w-none select-none" style={fittedPhoto} />
          ) : (
            <div className="grid size-full place-items-center px-8 text-center font-mono-hh text-[clamp(.48rem,2vw,.8rem)] uppercase tracking-[0.16em] text-white/45">
              Your photo lands here
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#003c24]/20 to-transparent" />
          <span className="absolute bottom-[4%] left-[3%] rounded-full bg-[#ff1684] px-[3%] py-[1.5%] font-mono-hh text-[clamp(.4rem,1.8vw,.66rem)] font-black uppercase tracking-wider text-white">
            BUILD MODE: ON
          </span>
        </div>

        <div className="absolute inset-x-[6.66%] top-[72.7%]">
          <div className="font-mono-hh text-[clamp(.42rem,1.7vw,.65rem)] font-black uppercase tracking-[0.2em] text-[#fee101]">Builder</div>
          <div className={`mt-[1%] truncate font-display leading-none tracking-[-0.045em] text-white ${nameSize}`}>{name || "YOUR NAME"}</div>
          <div className="mt-[3%] inline-flex max-w-full -rotate-1 rounded-full bg-[#fee101] px-[4%] py-[2%] font-editorial text-[clamp(.65rem,2.9vw,1.1rem)] font-bold italic leading-none text-[#003c24] shadow-[3px_3px_0_#ff1684]">
            <span className="truncate">{builderTitle || "Your builder title"}</span>
          </div>
          <div className="mt-[4%] flex items-end justify-between gap-3">
            <span className="min-w-0 truncate font-mono-hh text-[clamp(.4rem,1.65vw,.64rem)] font-bold uppercase tracking-[0.12em] text-white/75">
              {role || "YOUR STACK / ROLE"}
            </span>
            <span className="shrink-0 font-mono-hh text-[clamp(.4rem,1.65vw,.64rem)] font-black text-[#fee101]">#FrameInGoa</span>
          </div>
        </div>

        <div className="absolute -bottom-[3%] -right-[2%] size-[21%] rounded-full border-[clamp(4px,1vw,8px)] border-[#ff1684]/70" />
      </div>
      <figcaption className="mt-4 text-center font-mono-hh text-[10px] uppercase tracking-[0.16em] text-white/50">
        Live layout preview · export is 1080 × 1350 PNG
      </figcaption>
    </figure>
  );
}
