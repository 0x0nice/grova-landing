import { type ReactNode } from "react";

type CardVariant = "default" | "raised" | "interactive";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  variant?: CardVariant;
}

const variantClasses: Record<CardVariant, string> = {
  default: "bg-surface border border-border",
  raised: "bg-surface-raised border border-border shadow-sm",
  interactive:
    "bg-surface border border-border hover:bg-surface-hover hover:border-border2 transition-colors duration-[180ms] ease",
};

export function Card({
  children,
  className = "",
  padding = true,
  variant = "default",
}: CardProps) {
  return (
    <div
      className={`
        ${variantClasses[variant]} rounded-lg
        ${padding ? "p-6" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
