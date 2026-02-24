"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "ghost"
  | "approve"
  | "deny"
  | "restore"
  | "icon"
  | "copy"
  | "fill";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-black hover:bg-accent/90 font-mono text-subheadline uppercase tracking-[0.05em]",
  ghost:
    "bg-transparent border border-border text-text2 hover:border-border2 hover:text-text font-mono text-subheadline uppercase tracking-[0.05em]",
  approve:
    "bg-accent-dim text-accent hover:bg-accent hover:text-black font-mono text-subheadline uppercase tracking-[0.05em]",
  deny:
    "bg-orange-dim text-orange hover:bg-orange hover:text-white font-mono text-subheadline uppercase tracking-[0.05em]",
  restore:
    "bg-transparent border border-border text-text3 hover:text-text2 hover:border-border2 font-mono text-subheadline uppercase tracking-[0.05em]",
  icon:
    "bg-transparent border border-border text-text2 hover:text-text hover:border-border2 p-2",
  copy:
    "bg-transparent border border-border text-text2 hover:border-accent hover:text-accent font-mono text-subheadline uppercase tracking-[0.05em]",
  fill:
    "bg-accent text-black hover:bg-accent/90 font-mono text-subheadline uppercase tracking-[0.05em]",
};

export function Button({
  variant = "primary",
  children,
  loading,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded px-6 py-3
        transition-all duration-[180ms] ease
        cursor-pointer select-none
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "..." : children}
    </button>
  );
}
