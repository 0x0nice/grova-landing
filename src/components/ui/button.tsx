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
    "bg-accent text-black hover:bg-accent/90 active:bg-accent/80 font-mono font-medium text-subheadline uppercase",
  ghost:
    "bg-transparent border border-border text-text2 hover:border-border2 hover:text-text active:bg-surface-hover font-mono font-medium text-subheadline uppercase",
  approve:
    "bg-accent-dim text-accent hover:bg-accent hover:text-black active:bg-accent/80 font-mono font-medium text-subheadline uppercase",
  deny:
    "bg-orange-dim text-orange hover:bg-orange hover:text-white active:bg-orange/80 font-mono font-medium text-subheadline uppercase",
  restore:
    "bg-transparent border border-border text-text3 hover:text-text2 hover:border-border2 active:bg-surface-hover font-mono font-medium text-subheadline uppercase",
  icon:
    "bg-transparent border border-border text-text2 hover:text-text hover:border-border2 active:bg-surface-hover p-2",
  copy:
    "bg-transparent border border-border text-text2 hover:border-accent hover:text-accent active:bg-surface-hover font-mono font-medium text-subheadline uppercase",
  fill:
    "bg-accent text-black hover:bg-accent/90 active:bg-accent/80 font-mono font-medium text-subheadline uppercase",
};

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="animate-spin"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
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
        relative inline-flex items-center justify-center rounded px-6 py-3
        transition-all duration-[180ms] ease
        cursor-pointer select-none
        active:translate-y-px
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-y-0
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
