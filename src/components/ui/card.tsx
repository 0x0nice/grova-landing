import { type ReactNode } from "react";

type CardVariant = "default" | "raised" | "interactive";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  variant?: CardVariant;
  /** @deprecated Use variant="interactive" instead. Kept for backwards compat. */
  interactive?: boolean;
}

const variantClasses: Record<CardVariant, string> = {
  default: "bg-surface border border-border",
  raised: "bg-surface-raised border border-border shadow-sm",
  interactive:
    "bg-surface border border-border cursor-pointer transition-colors duration-[180ms] hover:bg-surface-hover hover:border-border2",
};

export function Card({
  children,
  className = "",
  padding = true,
  variant,
  interactive = false,
}: CardProps) {
  const resolvedVariant: CardVariant =
    variant ?? (interactive ? "interactive" : "default");

  return (
    <div
      className={`
        ${variantClasses[resolvedVariant]} rounded-lg
        [html[data-theme=dark]_&]:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
        ${padding ? "p-6" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
