"use client";

import { Code2, UserRound } from "lucide-react";

interface BuilderDetailsFormProps {
  name: string;
  nameError: string | null;
  role: string;
  roleError: string | null;
  onNameChange: (value: string) => void;
  onRoleChange: (value: string) => void;
}

const ROLE_EXAMPLES = ["Full Stack + AI", "Frontend Developer", "Backend Engineer", "Designer", "AI/ML", "Product Builder"];

export function BuilderDetailsForm({
  name,
  nameError,
  role,
  roleError,
  onNameChange,
  onRoleChange,
}: BuilderDetailsFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="builder-name" className="mb-2 flex items-center justify-between gap-3 font-black text-[#003c24]">
          <span className="flex items-center gap-2">
            <UserRound className="size-4 text-[#ff1684]" aria-hidden="true" />
            Your name
          </span>
          <span className="font-mono-hh text-[10px] font-normal tracking-normal text-[#003c24]/45">{name.length}/48</span>
        </label>
        <input
          id="builder-name"
          type="text"
          value={name}
          maxLength={48}
          autoComplete="name"
          placeholder="e.g. Mathews"
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? "builder-name-error" : undefined}
          onChange={(event) => onNameChange(event.currentTarget.value)}
          className="min-h-13 w-full rounded-xl border-2 border-[#006b3c]/20 bg-white px-4 py-3 font-bold text-[#003c24] placeholder:text-[#003c24]/35 hover:border-[#006b3c]/40 focus:border-[#ff1684] focus:outline-none"
        />
        {nameError ? (
          <p id="builder-name-error" role="alert" className="mt-2 text-sm font-semibold text-red-700">
            {nameError}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="builder-role" className="mb-2 flex items-center justify-between gap-3 font-black text-[#003c24]">
          <span className="flex items-center gap-2">
            <Code2 className="size-4 text-[#ff1684]" aria-hidden="true" />
            Stack / role
          </span>
          <span className="font-mono-hh text-[10px] font-normal tracking-normal text-[#003c24]/45">{role.length}/60</span>
        </label>
        <input
          id="builder-role"
          type="text"
          value={role}
          maxLength={60}
          autoComplete="organization-title"
          placeholder="e.g. Full Stack + AI"
          aria-invalid={Boolean(roleError)}
          aria-describedby={roleError ? "builder-role-help builder-role-error" : "builder-role-help"}
          onChange={(event) => onRoleChange(event.currentTarget.value)}
          className="min-h-13 w-full rounded-xl border-2 border-[#006b3c]/20 bg-white px-4 py-3 font-bold text-[#003c24] placeholder:text-[#003c24]/35 hover:border-[#006b3c]/40 focus:border-[#ff1684] focus:outline-none"
        />
        <p id="builder-role-help" className="mt-2 text-xs leading-5 text-[#003c24]/58">
          Be specific—your three builder titles are generated from these words.
        </p>
        {roleError ? (
          <p id="builder-role-error" role="alert" className="mt-2 text-sm font-semibold text-red-700">
            {roleError}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2" aria-label="Role examples">
          {ROLE_EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => onRoleChange(example)}
              className="min-h-10 rounded-full border border-[#006b3c]/18 bg-[#006b3c]/5 px-3 py-2 text-xs font-bold text-[#006b3c] transition hover:border-[#006b3c]/45 hover:bg-[#fee101]/35"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
