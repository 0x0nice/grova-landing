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
    "bg-accent text-black hover:bg-accent/90 font-mono font-medium text-subheadline uppercase",
  ghost:
    "bg-transparent border border-border text-text2 hover:border-border2 hover:text-text font-mono font-medium text-subheadline uppercase",
  approve:
    "bg-accent-dim text-accent hover:bg-accent hover:text-black font-mono font-medium text-subheadline uppercase",
  deny:
    "bg-orange-dim text-orange hover:bg-orange hover:text-white font-mono font-medium text-subheadline uppercase",
  restore:
    "bg-transparent border border-border text-text3 hover:text-text2 hover:border-border2 font-mono font-medium text-subheadline uppercase",
  icon:
    "bg-transparent border border-border text-text2 hover:text-text hover:border-border2 p-2",
  copy:
    "bg-transparent border border-border text-text2 hover:border-accent hover:text-accent font-mono font-medium text-subheadline uppercase",
  fill:
    "bg-accent text-black hover:bg-accent/90 font-mono font-medium text-subheadline uppercase",
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
