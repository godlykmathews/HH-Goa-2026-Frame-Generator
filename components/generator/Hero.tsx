"use client";

import Image from "next/image";
import { ArrowDown, LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HeroProps {
  onStart: () => void;
}

export function Hero({ onStart }: HeroProps) {
  return (
    <header className="relative isolate overflow-hidden border-b border-[#fee101]/25 px-4 pb-16 pt-5 sm:px-6 sm:pb-24 lg:px-8">
      <Image
        src="/brand/patterns/tech-weave.svg"
        alt=""
        width={640}
        height={640}
        priority
        className="pointer-events-none absolute -right-44 -top-32 -z-10 w-[38rem] rotate-12 opacity-60"
      />
      <div className="pointer-events-none absolute -left-28 top-44 -z-10 size-72 rounded-full bg-[#fee101]/10 blur-3xl" />

      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4" aria-label="Primary navigation">
        <a href="#top" className="inline-flex items-center gap-3 rounded-md" aria-label="HH Goa 2026 home">
          <Image
            src="/brand/hh-goa-wordmark.svg"
            alt="HH Goa 2026"
            width={600}
            height={210}
            className="h-auto w-36 sm:w-44"
            priority
          />
        </a>
        <div className="hidden items-center gap-2 text-right font-mono-hh text-[11px] uppercase tracking-[0.18em] text-white/70 sm:flex">
          <LockKeyhole className="size-4 text-[#fee101]" aria-hidden="true" />
          Photo stays on this device
        </div>
      </nav>

      <div className="mx-auto mt-16 grid max-w-7xl items-end gap-12 sm:mt-24 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <div className="mb-6 inline-flex rotate-[-2deg] items-center gap-2 rounded-full border-2 border-[#ff1684] bg-[#ff1684] px-4 py-2 text-xs font-black uppercase tracking-[0.17em] text-white shadow-[4px_4px_0_#fee101]">
            <Sparkles className="size-4" aria-hidden="true" />
            Hacker House · Goa · 28—31 Oct
          </div>
          <h1 className="max-w-5xl font-display text-[clamp(3.4rem,13vw,9.5rem)] leading-[0.78] tracking-[-0.075em] text-[#fee101]">
            BUILD YOUR
            <span className="block font-editorial italic tracking-[-0.06em] text-white">Goa identity.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-balance text-base leading-7 text-white/78 sm:text-lg">
            Turn one photo into a bold HH Goa 2026 builder graphic—ready to download, post, and take over the timeline.
          </p>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button size="large" onClick={onStart}>
              Create my Builder Card
              <ArrowDown className="size-5" aria-hidden="true" />
            </Button>
            <span className="font-mono-hh text-xs uppercase tracking-[0.14em] text-white/55">
              No login · About 60 seconds
            </span>
          </div>
        </div>

        <div className="relative hidden lg:block" aria-hidden="true">
          <div className="absolute -left-8 -top-8 size-24 rounded-full bg-[#ff1684] blur-2xl" />
          <div className="relative rotate-3 rounded-[2rem] border-2 border-[#fee101] bg-[#003c24] p-5 shadow-[14px_14px_0_#ff1684]">
            <div className="mb-12 flex items-center justify-between font-mono-hh text-[10px] uppercase tracking-[0.2em] text-[#fee101]">
              <span>Builder pass</span>
              <span>GOA/26</span>
            </div>
            <p className="font-editorial text-5xl italic leading-none text-white">Made to build.</p>
            <div className="mt-10 h-2 w-full bg-[#fee101]" />
            <p className="mt-3 text-right font-mono-hh text-xs uppercase tracking-widest text-white/70">#FrameInGoa</p>
          </div>
        </div>
      </div>
    </header>
  );
}
