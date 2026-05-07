import { type ReactElement } from "react";

type EmptyKind =
  | "inbox"
  | "chart"
  | "trend"
  | "folder"
  | "done"
  | "archive"
  | "card";

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  kind?: EmptyKind;
  icon?: string;
  heading: string;
  description?: string;
  action?: EmptyStateAction;
}

const iconProps = {
  width: 32,
  height: 32,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const kindIcons: Record<EmptyKind, ReactElement> = {
  inbox: (
    <svg {...iconProps}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </svg>
  ),
  chart: (
    <svg {...iconProps}>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
      <line x1="3" y1="20" x2="21" y2="20" />
    </svg>
  ),
  trend: (
    <svg {...iconProps}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  folder: (
    <svg {...iconProps}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  done: (
    <svg {...iconProps}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  archive: (
    <svg {...iconProps}>
      <rect x="2" y="4" width="20" height="5" rx="1" />
      <path d="M4 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" />
      <line x1="10" y1="13" x2="14" y2="13" />
    </svg>
  ),
  card: (
    <svg {...iconProps}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
};

export function EmptyState({
  kind,
  icon,
  heading,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {kind ? (
        <span className="text-text3 mb-5" aria-hidden="true">
          {kindIcons[kind]}
        </span>
      ) : icon ? (
        <span className="text-[2.5rem] mb-4" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <h3 className="font-serif text-title text-text2 mb-2">{heading}</h3>
      {description && (
        <p className="font-mono text-callout text-text3 max-w-[360px] leading-[1.55]">
          {description}
        </p>
      )}
      {action &&
        (action.href ? (
          <a
            href={action.href}
            className="mt-5 font-mono text-footnote text-accent hover:text-accent/80 transition-colors uppercase tracking-[0.04em]"
          >
            {action.label} →
          </a>
        ) : action.onClick ? (
          <button
            onClick={action.onClick}
            className="mt-5 font-mono text-footnote text-accent hover:text-accent/80 transition-colors cursor-pointer uppercase tracking-[0.04em]"
          >
            {action.label} →
          </button>
        ) : null)}
    </div>
  );
}
