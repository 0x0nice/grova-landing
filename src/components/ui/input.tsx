"use client";

import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
}

export function Input({
  label,
  error,
  className = "",
  id,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="font-mono text-footnote text-text2 uppercase"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full bg-bg2 border rounded px-4 py-3
          font-mono text-body text-text
          placeholder:text-text3
          transition-colors duration-[180ms] ease
          focus:outline-none focus:border-accent
          focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface
          ${error ? "border-red" : "border-border"}
          ${className}
        `}
        {...props}
      />
    </div>
  );
}
