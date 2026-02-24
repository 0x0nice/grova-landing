interface InsightCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  highlight?: boolean;
}

export function InsightCard({
  label,
  value,
  subtitle,
  highlight,
}: InsightCardProps) {
  return (
    <div
      className={`bg-surface border rounded p-5 [html[data-theme=light]_&]:bg-white ${
        highlight ? "border-accent/30" : "border-border"
      }`}
    >
      <span className="block font-mono text-micro text-text3 uppercase tracking-[0.12em] mb-2">
        {label}
      </span>
      <span className="block font-serif text-[2rem] text-text leading-none mb-1">
        {value}
      </span>
      {subtitle && (
        <span className="block font-mono text-micro text-text3 mt-1">
          {subtitle}
        </span>
      )}
    </div>
  );
}
