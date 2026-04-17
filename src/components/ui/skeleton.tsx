interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "h-4 w-full" }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-border2/40 rounded ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)]"
        style={{
          backgroundSize: "200% 100%",
          animation: "shimmer 1.8s ease-in-out infinite",
        }}
      />
    </div>
  );
}
