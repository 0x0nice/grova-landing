interface ProgressBarProps {
  steps: string[];
  current: number;
}

export function ProgressBar({ steps, current }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => (
        <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
          <div
            className={`
              h-1 w-full rounded-full transition-colors duration-300
              ${i <= current ? "bg-accent" : "bg-border"}
            `}
          />
          <span
            className={`
              font-mono text-micro uppercase tracking-[0.08em] transition-colors duration-300
              ${i <= current ? "text-text2" : "text-text3"}
              ${i === current ? "text-accent" : ""}
            `}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
