import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { lookupGeneratedFrame } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface FramePageProps {
  params: Promise<{ shareId: string }>;
}

const shareDescription =
  "A builder just framed their Hacker House Goa 2026 identity. Create yours with #FrameInGoa.";

export async function generateMetadata({
  params,
}: FramePageProps): Promise<Metadata> {
  const { shareId } = await params;
  const result = await lookupGeneratedFrame(shareId);

  if (result.status !== "found") {
    return {
      title: result.status === "not-found" ? "Frame not found" : "Frame unavailable",
      description: shareDescription,
      robots: { index: false, follow: true },
    };
  }

  return {
    title: "A builder just framed Goa",
    description: shareDescription,
    alternates: { canonical: `/frame/${result.frame.id}` },
    openGraph: {
      type: "website",
      url: `/frame/${result.frame.id}`,
      siteName: "HH Goa 2026",
      title: "HH Goa 2026 Builder Card",
      description: shareDescription,
      images: [
        {
          url: result.frame.image_url,
          width: 1080,
          height: 1350,
          alt: "A personalized HH Goa 2026 builder card",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "HH Goa 2026 Builder Card",
      description: shareDescription,
      images: [result.frame.image_url],
    },
  };
}

function FrameUnavailable() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-12 text-[#fff9dc]">
      <div className="pointer-events-none absolute -left-24 top-12 size-64 rounded-full bg-[#fee101]/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-8 size-72 rounded-full bg-[#ff1684]/12 blur-3xl" />

      <section className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/15 bg-[#003c24]/85 p-7 text-center shadow-2xl backdrop-blur md:p-10">
        <div className="absolute inset-x-0 top-0 h-2 bg-[linear-gradient(90deg,#fee101_0_33%,#ff1684_33%_66%,#b7f43b_66%)]" />
        <p className="font-mono-hh text-xs font-bold uppercase tracking-[0.24em] text-[#fee101]">
          HH Goa 2026 · Share desk
        </p>
        <h1 className="font-display mt-5 text-4xl leading-none uppercase md:text-5xl">
          Frame taking a beach break
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-white/75">
          This public card cannot be loaded right now. Try the link again in a
          moment, or build a fresh Goa identity.
        </p>
        <Link
          href="/#generator"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#fee101] px-7 py-3 font-extrabold text-[#003c24] transition hover:-translate-y-0.5 hover:bg-[#fff07a]"
        >
          Create your own
        </Link>
        <p className="font-mono-hh mt-7 text-xs tracking-[0.18em] text-white/55">
          #FrameInGoa
        </p>
      </section>
    </main>
  );
}

export default async function FramePage({ params }: FramePageProps) {
  const { shareId } = await params;
  const result = await lookupGeneratedFrame(shareId);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "unavailable") {
    return <FrameUnavailable />;
  }

  return (
    <main className="noise-overlay relative min-h-screen overflow-hidden px-4 py-5 text-[#fff9dc] sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute -left-32 top-12 size-80 rounded-full bg-[#fee101]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-36 top-1/3 size-96 rounded-full bg-[#ff1684]/10 blur-3xl" />

      <nav className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="HH Goa 2026 Frame Generator home"
          className="rounded-xl bg-[#006b3c]/80 p-1 transition hover:bg-[#007b46]"
        >
          {/* A plain image keeps this swappable brand asset independent of remote image config. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/hh-goa-wordmark.svg"
            width="150"
            height="53"
            alt="HH Goa 2026"
            className="h-auto w-[128px] sm:w-[150px]"
          />
        </Link>
        <span className="font-mono-hh rounded-full border border-[#fee101]/35 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#fee101] sm:text-xs">
          Builder signal live
        </span>
      </nav>

      <section className="relative mx-auto mt-8 grid w-full max-w-6xl items-center gap-9 pb-12 lg:mt-12 lg:grid-cols-[minmax(0,620px)_minmax(270px,1fr)] lg:gap-16">
        <div className="relative mx-auto w-full max-w-[620px]">
          <div className="absolute -inset-2 -rotate-1 rounded-[1.8rem] bg-[#fee101] shadow-[0_24px_90px_rgba(0,0,0,0.3)]" />
          <div className="absolute -inset-2 rotate-1 rounded-[1.8rem] border-[3px] border-[#ff1684]" />
          <figure className="relative overflow-hidden rounded-[1.35rem] border border-white/20 bg-[#002c1c]">
            {/* The URL is validated against the configured Supabase origin and bucket server-side. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.frame.image_url}
              width="1080"
              height="1350"
              alt="Personalized HH Goa 2026 builder card"
              className="block aspect-[4/5] h-auto w-full object-cover"
              fetchPriority="high"
            />
          </figure>
        </div>

        <div className="mx-auto w-full max-w-lg text-center lg:text-left">
          <p className="font-mono-hh text-xs font-bold uppercase tracking-[0.25em] text-[#b7f43b]">
            Builder identity · unlocked
          </p>
          <h1 className="font-display mt-4 text-balance text-5xl leading-[0.94] uppercase sm:text-6xl lg:text-7xl">
            Your Goa era starts here.
          </h1>
          <p className="mt-6 text-base leading-7 text-white/72 sm:text-lg">
            Made for the builders, breakers, shippers, and midnight debuggers
            heading to Hacker House Goa 2026.
          </p>

          <Link
            href="/#generator"
            className="mt-8 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[#fee101] px-7 py-4 text-base font-black text-[#003c24] shadow-[0_8px_0_#ff1684] transition hover:-translate-y-1 hover:shadow-[0_12px_0_#ff1684] sm:w-auto"
          >
            Create your own
            <span aria-hidden="true" className="ml-2">
              ↗
            </span>
          </Link>

          <div className="font-mono-hh mt-10 flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.17em] text-white/55 lg:justify-start">
            <span className="h-px w-8 bg-[#fee101]/60" />
            Goa, India · 28–31 Oct 2026
          </div>
          <p className="font-mono-hh mt-3 text-sm font-bold text-[#fee101]">
            #FrameInGoa
          </p>
        </div>
      </section>
    </main>
  );
}
