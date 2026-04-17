import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  interactive?: boolean;
}

export function Card({
  children,
  className = "",
  padding = true,
  interactive = false,
}: CardProps) {
  return (
    <div
      className={`
        bg-surface border border-border rounded-lg
        [html[data-theme=dark]_&]:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
        ${interactive ? "cursor-pointer transition-all duration-[180ms] hover:border-border2 hover:-translate-y-px hover:shadow-sm" : ""}
        ${padding ? "p-6" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
