import { Button } from "@/components/ui/button";

interface LoadMoreProps {
  loaded: number;
  total: number;
  loading: boolean;
  onLoad: () => void;
  context?: string;
}

export function LoadMore({ loaded, total, loading, onLoad, context = "items" }: LoadMoreProps) {
  if (loaded >= total) return null;

  return (
    <div className="mt-6 border-t border-border pt-5 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
      <p className="font-mono text-micro text-text3">
        Showing {loaded} of {total} {context}. Calculations use the loaded set.
      </p>
      <Button variant="ghost" onClick={onLoad} loading={loading}>
        Load more
      </Button>
    </div>
  );
}
