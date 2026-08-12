"use client";

/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import { createBuilderCredentialCode } from "@/lib/builderCredential";
import { BUILDER_CARD_FORMAT } from "@/lib/canvas/renderBuilderCard";
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
  const viewportRatio =
    BUILDER_CARD_FORMAT.photoViewport.width / BUILDER_CARD_FORMAT.photoViewport.height;
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

interface RailFieldProps {
  highlight?: boolean;
  label: string;
  value: string;
}

function RailField({ highlight = false, label, value }: RailFieldProps) {
  return (
    <div className="min-w-0">
      <span className="block font-mono-hh text-[1.3cqw] font-bold uppercase tracking-[0.08em] text-[#ff1684]">
        {label}
      </span>
      <span
        className={`mt-[1.5%] block truncate font-mono-hh text-[2.35cqw] font-black uppercase leading-none ${
          highlight ? "text-[#fee101]" : "text-[#fff9dc]"
        }`}
      >
        {value}
      </span>
    </div>
  );
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
  const fittedPhoto =
    previewUrl && imageWidth && imageHeight
      ? photoStyle(imageWidth, imageHeight, transform)
      : null;
  const code = createBuilderCredentialCode(name, role);
  const nameSize = name.length > 34 ? "text-[5.2cqw]" : name.length > 24 ? "text-[6.6cqw]" : "text-[9cqw]";
  const titleSize = builderTitle.length > 30 ? "text-[3.15cqw]" : "text-[4cqw]";

  return (
    <figure>
      <div
        className="relative mx-auto w-full max-w-[21rem] overflow-hidden rounded-[1.8rem] border border-[#fee101]/80 bg-[#064d34] shadow-[0_24px_70px_rgba(0,36,22,.42)] [container-type:inline-size]"
        style={{
          aspectRatio: `${BUILDER_CARD_FORMAT.width} / ${BUILDER_CARD_FORMAT.height}`,
        }}
        aria-label="Live HH Goa 2026 builder credential preview"
      >
        <Image
          src="/brand/patterns/tech-weave.svg"
          alt=""
          fill
          sizes="(max-width: 1024px) 72vw, 336px"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-[2.6%] rounded-[4.5%] border border-[#fee101]/65 shadow-[3px_4px_0_rgba(255,22,132,.65)]" />
        <div className="absolute right-[2.6%] top-[1.65%] h-[5.2%] w-[23%] bg-[#ff1684] [clip-path:polygon(0_0,100%_0,100%_100%,28%_100%)]" />
        <div className="absolute inset-x-[4.95%] top-[3.05%] h-[.9%] bg-[repeating-linear-gradient(135deg,#fee101_0_6px,#ff1684_6px_12px)]" />

        <div className="absolute left-[6.1%] top-[5.1%] rounded-full bg-[#ff1684] px-[2.2%] py-[.9%] font-mono-hh text-[1.65cqw] font-black uppercase tracking-[0.08em] text-[#fff9dc]">
          HH // GOA 2026 // ID
        </div>
        <span className="absolute right-[6.1%] top-[5.15%] font-mono-hh text-[1.35cqw] font-bold uppercase tracking-[0.09em] text-[#fff9dc]">
          ISSUE // 26
        </span>

        <Image
          src="/brand/hacker-house.png"
          alt="Hacker House"
          width={1148}
          height={237}
          className="absolute left-[6.1%] top-[8.2%] h-auto w-[61.2%]"
          priority
        />
        <Image
          src="/brand/goa-hindi.svg"
          alt="Goa"
          width={181}
          height={180}
          className="absolute right-[6.1%] top-[6.9%] h-auto w-[13.5%]"
        />

        <div className="absolute left-[6.1%] top-[17.63%] h-[42.22%] w-[55.88%] overflow-hidden rounded-[5.8%] bg-[#003c24] shadow-[0_10px_28px_rgba(0,0,0,.28),0_0_0_2px_#ff1684,0_0_0_3px_#fee101]">
          {fittedPhoto ? (
            <img
              src={previewUrl ?? undefined}
              alt=""
              draggable={false}
              className="absolute max-w-none select-none"
              style={fittedPhoto}
            />
          ) : (
            <div className="grid size-full place-items-center px-[12%] text-center font-mono-hh text-[2cqw] uppercase tracking-[0.12em] text-white/42">
              Your portrait lands here
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#003c24]/70 via-transparent to-transparent" />
          <div className="pointer-events-none absolute left-[4%] top-[4%] size-[8%] border-l border-t border-[#fff9dc]" />
          <div className="pointer-events-none absolute right-[4%] top-[4%] size-[8%] border-r border-t border-[#fff9dc]" />
          <span className="absolute bottom-[3.4%] left-[4%] rounded-full bg-[#fee101] px-[4%] py-[2.1%] font-mono-hh text-[1.55cqw] font-black uppercase tracking-[0.06em] text-[#003c24]">
            BUILD MODE // ON
          </span>
          <span className="absolute bottom-[4.8%] right-[4%] font-mono-hh text-[1.15cqw] font-bold uppercase tracking-[0.08em] text-[#fff9dc]">
            PORTRAIT // LIVE
          </span>
        </div>

        <div className="absolute right-[6.1%] top-[17.63%] h-[42.22%] w-[29.76%] overflow-hidden rounded-[9%] border border-[#fee101]/35 bg-[#002c1c]/95 px-[2.65%] pb-[2.2%] pt-[2.3%] shadow-[0_10px_28px_rgba(0,0,0,.22)]">
          <div className="absolute bottom-[4%] left-[4%] top-[4%] w-px bg-[#fee101]" />
          <div className="absolute right-0 top-0 h-[11%] w-[29%] bg-[#ff1684] [clip-path:polygon(0_0,100%_0,100%_100%)]" />
          <div className="ml-[5%] flex h-full min-w-0 flex-col">
            <span className="font-mono-hh text-[1.3cqw] font-bold uppercase tracking-[0.08em] text-[#fee101]">
              Credential / live
            </span>
            <span className="mt-[4%] flex items-center gap-[4%] font-mono-hh text-[1.8cqw] font-black uppercase text-[#fff9dc]">
              <i className="size-[1.4cqw] shrink-0 rounded-full bg-[#ff1684] not-italic shadow-[0_0_8px_#ff1684]" />
              Active
            </span>
            <div className="my-[6%] h-px bg-white/15" />
            <div className="flex min-h-0 flex-1 flex-col justify-between">
              <RailField label="Builder ID" value={code} />
              <RailField label="Location" value="Goa, India" />
              <RailField label="Event window" value="28—31 Oct" />
              <RailField label="Access" value="All build zones" />
              <RailField highlight label="Class" value="Builder" />
            </div>
            <div className="mt-[5%] h-[8%] bg-[repeating-linear-gradient(90deg,#fff9dc_0_2px,transparent_2px_5px,#ff1684_5px_7px,transparent_7px_11px)] opacity-85" />
            <span className="mt-[3%] font-mono-hh text-[1.1cqw] font-bold uppercase tracking-[0.06em] text-white/55">
              Access key // HH26
            </span>
          </div>
        </div>

        <div className="absolute inset-x-[6.1%] top-[62.6%] min-w-0">
          <div className="flex min-w-0 items-center justify-between gap-[3%] border-b border-white/15 pb-[1.6%] font-mono-hh text-[1.55cqw] font-black uppercase tracking-[0.08em]">
            <span className="truncate text-[#ff1684]">Builder // identified</span>
            <span className="shrink-0 text-[#fee101]">One of one // verified</span>
          </div>
          <div className={`mt-[2.3%] truncate font-display leading-none tracking-[-0.045em] text-[#fff9dc] ${nameSize}`}>
            {name || "YOUR NAME"}
          </div>
          <div className="mt-[2.4%] flex h-[8.95cqw] min-w-0 items-center rounded-[1.4cqw] border border-[#fee101] bg-[#ff1684] px-[3.5%] shadow-[2px_2px_0_rgba(254,225,1,.35)]">
            <span className={`block min-w-0 truncate font-display leading-none text-[#fff9dc] ${titleSize}`}>
              {builderTitle || "Your builder title"}
            </span>
          </div>
          <div className="mt-[4.1%] font-mono-hh text-[1.4cqw] font-black uppercase tracking-[0.08em] text-[#ff1684]">
            Stack / role
          </div>
          <div className="mt-[1.4%] line-clamp-2 break-words text-[3.5cqw] font-extrabold leading-[1.06] text-[#fee101]">
            {role || "YOUR STACK / ROLE"}
          </div>
        </div>

        <div className="absolute inset-x-[6.1%] top-[89.25%] border-t border-white/20 pt-[2.5%]">
          <div className="flex items-center justify-between gap-[3%] font-mono-hh text-[1.5cqw] font-black uppercase tracking-[0.07em]">
            <span className="text-[#fee101]">#FrameInGoa</span>
            <span className="truncate text-[#fff9dc]">{code}</span>
          </div>
          <div className="mt-[2.5%] flex items-end gap-[4%]">
            <div className="h-[2.15cqw] flex-1 bg-[repeating-linear-gradient(90deg,#fff9dc_0_2px,transparent_2px_5px,#ff1684_5px_7px,transparent_7px_11px)] opacity-80" />
            <span className="shrink-0 font-mono-hh text-[1.2cqw] font-bold uppercase tracking-[0.05em] text-white/60">
              Build / ship / repeat
            </span>
          </div>
        </div>

        <div className="absolute inset-x-[4.95%] bottom-[2.05%] h-[.9%] bg-[repeating-linear-gradient(135deg,#fee101_0_6px,#ff1684_6px_12px)]" />
      </div>
      <figcaption className="mt-4 text-center font-mono-hh text-[10px] uppercase tracking-[0.14em] text-white/50">
        Live credential preview · export is {BUILDER_CARD_FORMAT.width} × {BUILDER_CARD_FORMAT.height} PNG
      </figcaption>
    </figure>
  );
}
