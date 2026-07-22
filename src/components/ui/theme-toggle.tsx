"use client";

import { useTheme } from "@/hooks/use-theme";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className={`
        inline-flex items-center justify-center
        w-[34px] h-[34px]
        border-none bg-transparent
        text-text2 hover:text-text
        transition-colors duration-[180ms] ease
        cursor-pointer
        ${className}
      `}
      aria-label="Toggle theme"
    >
      ◐
    </button>
  );
}
