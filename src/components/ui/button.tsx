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
    "bg-accent text-black hover:bg-accent/90 hover:-translate-y-px hover:shadow-sm font-mono font-medium text-subheadline uppercase",
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
    "bg-accent text-black hover:bg-accent/90 hover:-translate-y-px hover:shadow-sm font-mono font-medium text-subheadline uppercase",
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
        inline-flex items-center justify-center gap-2 rounded px-6 py-3
        transition-all duration-[180ms] ease
        active:scale-[0.98] active:translate-y-0
        cursor-pointer select-none
        disabled:opacity-40 disabled:cursor-not-allowed
        [html[data-theme=dark]_&]:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
        ${variantClasses[variant]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="w-4 h-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="45"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}
