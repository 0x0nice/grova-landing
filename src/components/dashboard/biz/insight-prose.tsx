interface InsightProseProps {
  lines: string[];
}

export function InsightProse({ lines }: InsightProseProps) {
  if (lines.length === 0) return null;

  return (
    <div className="border-l-[3px] border-accent pl-5 py-1 my-6">
      {lines.map((line, i) => (
        <p
          key={i}
          className="font-mono text-callout text-text2 leading-[1.8] mb-1 last:mb-0"
        >
          {line}
        </p>
      ))}
    </div>
  );
}
