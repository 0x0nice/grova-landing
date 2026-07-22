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
    "bg-accent text-black hover:bg-accent/82 font-medium text-subheadline",
  ghost:
    "bg-transparent border border-border text-text2 hover:border-border2 hover:text-text active:bg-surface-hover font-medium text-subheadline",
  approve:
    "bg-accent-dim text-accent hover:bg-accent hover:text-black font-medium text-subheadline",
  deny:
    "bg-orange-dim text-orange hover:bg-orange hover:text-white font-medium text-subheadline",
  restore:
    "bg-transparent border border-border text-text3 hover:text-text2 hover:border-border2 active:bg-surface-hover font-medium text-subheadline",
  icon:
    "bg-transparent border border-border text-text2 hover:text-text hover:border-border2 active:bg-surface-hover p-2",
  copy:
    "bg-transparent border border-border text-text2 hover:border-accent hover:text-accent active:bg-surface-hover font-medium text-subheadline",
  fill:
    "bg-accent text-black hover:bg-accent/82 font-medium text-subheadline",
};

function Spinner() {
  return (
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
  );
}

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
        relative inline-flex items-center justify-center gap-2 rounded px-6 py-3
        transition-colors duration-[180ms] ease
        cursor-pointer select-none
        disabled:opacity-40 disabled:cursor-not-allowed
        [html[data-theme=dark]_&]:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
        ${variantClasses[variant]}
        ${className}
      `}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      <span className={loading ? "invisible" : "inline-flex items-center gap-1.5"}>
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 inline-flex items-center justify-center">
          <Spinner />
        </span>
      )}
    </button>
  );
}
