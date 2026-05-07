type SkeletonVariant = "default" | "inbox-card";

interface SkeletonProps {
  className?: string;
  variant?: SkeletonVariant;
}

function Block({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-border2/50 rounded animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}

export function Skeleton({ className = "h-4 w-full", variant = "default" }: SkeletonProps) {
  if (variant === "inbox-card") {
    return (
      <div
        className="bg-surface border border-border rounded-lg p-4 grid grid-cols-[64px_1fr_auto] gap-4 max-md:grid-cols-[66px_1fr] max-md:gap-3 max-md:p-3"
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-2 pt-1">
          <Block className="h-9 w-9 rounded-full" />
          <Block className="h-2 w-8" />
        </div>
        <div className="min-w-0 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Block className="h-4 w-14" />
            <Block className="h-3 w-24" />
          </div>
          <Block className="h-3 w-full" />
          <Block className="h-3 w-5/6" />
          <Block className="h-3 w-12 mt-1" />
        </div>
        <div className="flex flex-col gap-2 shrink-0 max-md:hidden">
          <Block className="h-8 w-20" />
          <Block className="h-8 w-20" />
        </div>
      </div>
    );
  }

  return <Block className={className} />;
}
