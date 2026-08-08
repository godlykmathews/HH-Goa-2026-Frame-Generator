"use client";

import { LockKeyhole, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface GeneratorControlsProps {
  disabled: boolean;
  loading: boolean;
  onGenerate: () => void;
}

export function GeneratorControls({ disabled, loading, onGenerate }: GeneratorControlsProps) {
  return (
    <div className="rounded-2xl bg-[#003c24] p-4 sm:p-5">
      <Button className="w-full" size="large" loading={loading} disabled={disabled} onClick={onGenerate}>
        {!loading ? <WandSparkles className="size-5" aria-hidden="true" /> : null}
        {loading ? "Rendering 1080 × 1350…" : "Generate my card"}
      </Button>
      <p className="mt-4 flex items-start justify-center gap-2 text-center text-xs leading-5 text-white/65">
        <LockKeyhole className="mt-0.5 size-3.5 shrink-0 text-[#fee101]" aria-hidden="true" />
        Your original photo stays in this browser. Nothing is uploaded to generate or download.
      </p>
    </div>
  );
}
