"use client";

import { Check, Sparkles } from "lucide-react";

interface BuilderTitlePickerProps {
  roleReady: boolean;
  selectedTitle: string;
  titles: readonly string[];
  onSelect: (title: string) => void;
}

export function BuilderTitlePicker({ roleReady, selectedTitle, titles, onSelect }: BuilderTitlePickerProps) {
  return (
    <fieldset>
      <legend className="flex items-center gap-2 font-black text-[#003c24]">
        <Sparkles className="size-4 text-[#ff1684]" aria-hidden="true" />
        Pick your builder title
      </legend>
      <p className="mt-2 text-xs leading-5 text-[#003c24]/58">Generated locally from your stack. No AI call, no waiting.</p>

      {roleReady ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {titles.slice(0, 3).map((title) => {
            const selected = title === selectedTitle;
            return (
              <label
                key={title}
                className={`relative flex min-h-24 cursor-pointer items-end rounded-xl border-2 p-4 transition focus-within:outline focus-within:outline-3 focus-within:outline-offset-3 focus-within:outline-[#ff1684] ${
                  selected
                    ? "border-[#006b3c] bg-[#fee101] text-[#003c24] shadow-[4px_4px_0_#ff1684]"
                    : "border-[#006b3c]/18 bg-white text-[#003c24] hover:border-[#006b3c]/45"
                }`}
              >
                <input
                  type="radio"
                  name="builder-title"
                  value={title}
                  checked={selected}
                  onChange={() => onSelect(title)}
                  className="sr-only"
                />
                <span className="pr-5 font-editorial text-xl font-bold italic leading-tight">{title}</span>
                {selected ? (
                  <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-[#006b3c] text-[#fee101]">
                    <Check className="size-4" aria-hidden="true" />
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border-2 border-dashed border-[#006b3c]/18 bg-[#006b3c]/[0.025] px-5 py-6 text-center text-sm font-semibold text-[#003c24]/52">
          Add your stack or role above to reveal three titles.
        </div>
      )}
    </fieldset>
  );
}
