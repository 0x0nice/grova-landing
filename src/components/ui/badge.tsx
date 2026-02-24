type BadgeType = "bug" | "feature" | "ux" | "spam" | "other" | string;

interface BadgeProps {
  type: BadgeType;
  className?: string;
}

const badgeColors: Record<string, string> = {
  bug: "bg-red-dim text-red",
  feature: "bg-accent-dim text-accent",
  ux: "bg-[rgba(100,160,255,0.1)] text-blue",
  spam: "bg-[rgba(96,96,96,0.15)] text-text3",
  other: "bg-[rgba(96,96,96,0.15)] text-text3",
};

export function Badge({ type, className = "" }: BadgeProps) {
  const colors = badgeColors[type.toLowerCase()] ?? badgeColors.other;
  return (
    <span
      className={`
        inline-flex items-center rounded px-2 py-0.5
        font-mono text-micro uppercase tracking-[0.1em] font-semibold
        ${colors} ${className}
      `}
    >
      {type}
    </span>
  );
}
