"use client";

import { LoaderCircle } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "pink";
type ButtonSize = "default" | "large" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-[#fee101] bg-[#fee101] text-[#003c24] shadow-[0_5px_0_#c5a900] hover:-translate-y-0.5 hover:shadow-[0_7px_0_#c5a900] active:translate-y-1 active:shadow-[0_1px_0_#c5a900]",
  secondary:
    "border-white/20 bg-white/10 text-white hover:border-[#fee101]/60 hover:bg-white/15",
  ghost:
    "border-[#006b3c]/20 bg-transparent text-[#006b3c] hover:border-[#006b3c]/45 hover:bg-[#006b3c]/5",
  pink:
    "border-[#ff1684] bg-[#ff1684] text-white shadow-[0_5px_0_#ad0754] hover:-translate-y-0.5 hover:shadow-[0_7px_0_#ad0754] active:translate-y-1 active:shadow-[0_1px_0_#ad0754]",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "min-h-12 px-5 py-3 text-sm",
  large: "min-h-14 px-6 py-4 text-base sm:px-8",
  icon: "size-12 p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className = "",
    disabled,
    loading = false,
    size = "default",
    type = "button",
    variant = "primary",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 font-black tracking-tight transition duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
});
