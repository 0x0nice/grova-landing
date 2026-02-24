"use client";

import { type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({
  label,
  children,
  className = "",
  id,
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="font-mono text-footnote text-text2 uppercase tracking-[0.04em]"
        >
          {label}
        </label>
      )}
      <select
        id={id}
        className={`
          w-full bg-bg2 border border-border rounded px-4 py-3
          font-mono text-body text-text
          transition-colors duration-[180ms] ease
          focus:outline-none focus:border-accent
          appearance-none cursor-pointer
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
