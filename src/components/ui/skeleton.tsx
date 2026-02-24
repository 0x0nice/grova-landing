interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "h-4 w-full" }: SkeletonProps) {
  return (
    <div
      className={`bg-border/50 rounded animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}
