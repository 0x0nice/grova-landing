import type { InsightEvidence } from "@/lib/biz-helpers";

interface InsightProseProps {
  evidence: InsightEvidence;
}

function truncate(text: string, max = 100): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

function trendPhrase(trend: NonNullable<InsightEvidence["topTheme"]>["trend"]): string {
  switch (trend) {
    case "up":
      return " — up from last week";
    case "down":
      return " — down from last week";
    case "new":
      return " — new this week";
    case "steady":
    default:
      return "";
  }
}

export function InsightProse({ evidence }: InsightProseProps) {
  const { thisWeekCount, totalCount, sinceLastVisit, topTheme, needsReply } =
    evidence;

  if (totalCount === 0) return null;

  const sentences: React.ReactNode[] = [];

  // Sentence 1 — volume framing.
  if (sinceLastVisit && sinceLastVisit.count > 0) {
    sentences.push(
      <>
        <Strong>{sinceLastVisit.count}</Strong> new{" "}
        {sinceLastVisit.count === 1 ? "message" : "messages"} since{" "}
        {sinceLastVisit.label}
        {thisWeekCount > 0 && (
          <>
            , <Strong>{thisWeekCount}</Strong> total this week
          </>
        )}
        .
      </>
    );
  } else if (thisWeekCount > 0) {
    sentences.push(
      <>
        <Strong>{thisWeekCount}</Strong>{" "}
        {thisWeekCount === 1 ? "message" : "messages"} this week.
      </>
    );
  } else {
    sentences.push(<>No messages this week — your stream is quiet.</>);
  }

  // Sentence 2 — top theme + representative quote.
  if (topTheme) {
    sentences.push(
      <>
        <Strong>{topTheme.count}</Strong>{" "}
        {topTheme.count === 1 ? "message" : "messages"} about{" "}
        <Strong>{topTheme.category.toLowerCase()}</Strong>
        {trendPhrase(topTheme.trend)}.
        {topTheme.quote && (
          <>
            {" "}
            One reads: <Quote>{truncate(topTheme.quote, 120)}</Quote>
          </>
        )}
      </>
    );
  }

  // Sentence 3 — pending replies.
  if (needsReply && needsReply > 0) {
    sentences.push(
      <>
        <Strong>{needsReply}</Strong>{" "}
        {needsReply === 1 ? "message looks" : "messages look"} like{" "}
        {needsReply === 1 ? "it" : "they"} might need a reply from you.
      </>
    );
  }

  if (sentences.length === 0) return null;

  return (
    <div className="border-l-[3px] border-accent pl-5 py-1 my-6">
      {sentences.map((s, i) => (
        <p
          key={i}
          className="font-mono text-callout text-text2 leading-[1.8] mb-1 last:mb-0"
        >
          {s}
        </p>
      ))}
    </div>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-text font-medium tabular-nums">{children}</span>
  );
}

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-serif italic text-text">
      &ldquo;{children}&rdquo;
    </span>
  );
}
