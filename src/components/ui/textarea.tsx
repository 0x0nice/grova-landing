"use client";

import { type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  charCount?: boolean;
}

export function Textarea({
  label,
  charCount,
  value,
  maxLength,
  className = "",
  id,
  ...props
}: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={id}
            className="font-mono text-footnote text-text2 uppercase tracking-[0.04em]"
          >
            {label}
          </label>
        )}
        {charCount && (
          <span className="font-mono text-footnote text-text3">
            {String(value ?? "").length}
            {maxLength ? `/${maxLength}` : ""}
          </span>
        )}
      </div>
      <textarea
        id={id}
        value={value}
        maxLength={maxLength}
        className={`
          w-full bg-bg2 border border-border rounded px-4 py-3
          font-mono text-body text-text leading-[1.65]
          placeholder:text-text3
          transition-colors duration-[180ms] ease
          focus:outline-none focus:border-accent
          resize-y min-h-[120px]
          ${className}
        `}
        {...props}
      />
    </div>
  );
}
