import type { FeedbackItem } from "@/types/feedback";
import { effectiveScore, timeAgo } from "@/lib/triage";
import { Badge } from "@/components/ui/badge";
import { ScoreDisplay } from "@/components/dashboard/dev/score-display";
import { EmptyState } from "@/components/ui/empty-state";

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

interface EmptyStatePreviewProps {
  kind?: EmptyKind;
  heading: string;
  description?: string;
  action?: EmptyStateAction;
  /** Sample feedback items to preview underneath the empty state. */
  previewItems: FeedbackItem[];
  /** How many preview cards to show. Defaults to 3. */
  previewLimit?: number;
}

function PreviewCard({ item }: { item: FeedbackItem }) {
  return (
    <div
      aria-hidden="true"
      className="bg-surface border border-border rounded-lg p-4 grid grid-cols-[64px_1fr] gap-4
                 opacity-50 select-none pointer-events-none
                 [html[data-theme=light]_&]:bg-white"
    >
      <div className="flex flex-col items-center pt-1">
        <ScoreDisplay score={effectiveScore(item)} size="lg" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge type={item.triage?.category || item.type} />
          {item.page && (
            <span className="font-mono text-micro text-text3 truncate max-w-[200px]">
              {item.page}
            </span>
          )}
          <span className="font-mono text-micro text-text3 ml-auto">
            {timeAgo(item.created_at)}
          </span>
        </div>
        <p className="font-mono text-callout text-text2 leading-[1.6] line-clamp-2">
          {item.message}
        </p>
      </div>
    </div>
  );
}

export function EmptyStatePreview({
  kind,
  heading,
  description,
  action,
  previewItems,
  previewLimit = 3,
}: EmptyStatePreviewProps) {
  const previews = previewItems.slice(0, previewLimit);

  return (
    <div>
      <div className="py-12">
        <EmptyState
          kind={kind}
          heading={heading}
          description={description}
          action={action}
        />
      </div>

      {previews.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-micro text-text3">
              Preview · Sample data
            </span>
            <span
              className="flex-1 h-px bg-border"
              aria-hidden="true"
            />
          </div>
          <div className="flex flex-col gap-3">
            {previews.map((item) => (
              <PreviewCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
