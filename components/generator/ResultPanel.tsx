"use client";

/* eslint-disable @next/next/no-img-element */

import { AlertCircle, CheckCircle2, Download, ExternalLink, Link, RefreshCw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type PublicShareTarget = "x" | "linkedin";

interface ManualShareLink {
  href: string;
  label: string;
}

interface ResultPanelProps {
  consent: boolean;
  error: string | null;
  fileName: string;
  imageUrl: string;
  manualShareLink: ManualShareLink | null;
  publicShareUrl: string | null;
  sharingTarget: "native" | PublicShareTarget | null;
  status: string | null;
  onConsentChange: (consent: boolean) => void;
  onDownload: () => void;
  onNativeShare: () => void;
  onPublicShare: (target: PublicShareTarget) => void;
  onStartOver: () => void;
}

export function ResultPanel({
  consent,
  error,
  fileName,
  imageUrl,
  manualShareLink,
  publicShareUrl,
  sharingTarget,
  status,
  onConsentChange,
  onDownload,
  onNativeShare,
  onPublicShare,
  onStartOver,
}: ResultPanelProps) {
  const sharingPublicly = sharingTarget === "x" || sharingTarget === "linkedin";

  return (
    <section id="result" aria-labelledby="result-title" className="border-t border-[#fee101]/25 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#fee101] px-3 py-1.5 font-mono-hh text-[10px] font-black uppercase tracking-[0.15em] text-[#003c24]">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Render complete
          </span>
          <h2 id="result-title" className="mt-5 font-display text-4xl leading-[0.92] tracking-[-0.045em] text-white sm:text-6xl">
            Your Goa identity is ready.
          </h2>
          <p className="mt-4 text-white/68">Download it privately, share the image from your phone, or create a public preview link for X and LinkedIn.</p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,34rem)_minmax(22rem,1fr)] lg:gap-14">
          <figure>
            <div className="overflow-hidden rounded-[1.75rem] border-2 border-[#fee101]/60 bg-[#003c24] p-2 shadow-[10px_10px_0_#ff1684] sm:p-3">
              <img src={imageUrl} alt="Your completed HH Goa 2026 builder card" className="aspect-[4/5] w-full rounded-[1.2rem] object-cover" />
            </div>
            <figcaption className="mt-4 truncate text-center font-mono-hh text-[10px] uppercase tracking-[0.13em] text-white/50">
              {fileName} · 1080 × 1350 PNG
            </figcaption>
          </figure>

          <div className="space-y-5">
            <div className="rounded-2xl bg-[#fff9dc] p-5 text-[#003c24] sm:p-6">
              <h3 className="font-display text-xl tracking-[-0.025em]">Keep it local</h3>
              <p className="mt-1 text-sm leading-6 text-[#003c24]/65">These actions never upload your card.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Button onClick={onDownload} className="w-full">
                  <Download className="size-5" aria-hidden="true" />
                  Download image
                </Button>
                <Button
                  variant="ghost"
                  onClick={onNativeShare}
                  loading={sharingTarget === "native"}
                  disabled={sharingPublicly}
                  className="w-full"
                >
                  {sharingTarget !== "native" ? <Share2 className="size-5" aria-hidden="true" /> : null}
                  Share image
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-[#fee101]/45 bg-[#003c24] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl tracking-[-0.025em] text-[#fee101]">Share with a public preview</h3>
                  <p className="mt-2 text-sm leading-6 text-white/64">
                    X and LinkedIn need a public page so your finished graphic can appear in the link preview.
                  </p>
                </div>
                <ExternalLink className="mt-1 size-5 shrink-0 text-[#ff1684]" aria-hidden="true" />
              </div>

              <label
                htmlFor="public-share-consent"
                className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-white/12 bg-white/[0.06] p-4 text-sm leading-5 text-white/78 hover:border-[#fee101]/45"
              >
                <input
                  id="public-share-consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => onConsentChange(event.currentTarget.checked)}
                  className="mt-0.5 size-5 shrink-0 accent-[#ff1684]"
                />
                <span>
                  I understand that <strong className="text-white">only my finished card</strong> will be uploaded and publicly accessible. My original photo is never uploaded separately.
                </span>
              </label>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Button
                  variant="pink"
                  className="w-full"
                  loading={sharingTarget === "x"}
                  disabled={sharingTarget !== null && sharingTarget !== "x"}
                  onClick={() => onPublicShare("x")}
                >
                  {sharingTarget !== "x" ? <span className="text-lg" aria-hidden="true">𝕏</span> : null}
                  Share to X
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  loading={sharingTarget === "linkedin"}
                  disabled={sharingTarget !== null && sharingTarget !== "linkedin"}
                  onClick={() => onPublicShare("linkedin")}
                >
                  {sharingTarget !== "linkedin" ? <Link className="size-5" aria-hidden="true" /> : null}
                  Share to LinkedIn
                </Button>
              </div>

              {publicShareUrl ? (
                <p className="mt-4 break-all rounded-lg bg-black/15 px-3 py-2 font-mono-hh text-[10px] leading-5 text-white/58">
                  Public preview: {publicShareUrl}
                </p>
              ) : null}

              {manualShareLink ? (
                <a
                  href={manualShareLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-black text-[#003c24] hover:bg-[#fee101]"
                >
                  {manualShareLink.label}
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              ) : null}
            </div>

            <div aria-live="polite" aria-atomic="true">
              {status ? (
                <p className="flex items-start gap-2 rounded-xl border border-[#b7f43b]/35 bg-[#b7f43b]/10 px-4 py-3 text-sm font-semibold text-white">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#b7f43b]" aria-hidden="true" />
                  {status}
                </p>
              ) : null}
              {error ? (
                <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-300/35 bg-red-950/25 px-4 py-3 text-sm font-semibold text-red-50">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-300" aria-hidden="true" />
                  {error}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onStartOver}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-white/72 hover:bg-white/[0.07] hover:text-white"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Start over with a new card
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
