import { type ReactNode } from "react";

interface DashboardHeroProps {
  title: string;
  subtitle?: ReactNode;
  className?: string;
}

export function DashboardHero({
  title,
  subtitle,
  className = "",
}: DashboardHeroProps) {
  return (
    <header className={`mb-6 ${className}`}>
      <h1 className="font-serif text-headline text-text leading-[1.1]">
        {title}
      </h1>
      {subtitle && (
        <p className="font-mono text-callout text-text3 mt-1.5 leading-[1.55]">
          {subtitle}
        </p>
      )}
    </header>
  );
}
