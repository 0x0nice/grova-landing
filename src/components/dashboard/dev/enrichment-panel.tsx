import type { Metadata, ConsoleError } from "@/types/feedback";

interface EnrichmentPanelProps {
  metadata?: Metadata;
  consoleErrors?: ConsoleError[];
  screenshot?: string;
}

export function EnrichmentPanel({
  metadata,
  consoleErrors,
  screenshot,
}: EnrichmentPanelProps) {
  const hasMetadata = metadata && Object.keys(metadata).length > 0;
  const hasErrors = consoleErrors && consoleErrors.length > 0;

  if (!hasMetadata && !hasErrors && !screenshot) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Device / environment info */}
      {hasMetadata && (
        <div>
          <span className="block font-mono text-micro text-text3 uppercase tracking-[0.12em] mb-2.5">
            Environment
          </span>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            {metadata.browser && (
              <MetaItem label="Browser" value={metadata.browser} />
            )}
            {metadata.os && <MetaItem label="OS" value={metadata.os} />}
            {metadata.device_type && (
              <MetaItem label="Device" value={metadata.device_type} />
            )}
            {metadata.viewport && (
              <MetaItem label="Viewport" value={metadata.viewport} />
            )}
            {metadata.screen && (
              <MetaItem label="Screen" value={metadata.screen} />
            )}
            {metadata.language && (
              <MetaItem label="Language" value={metadata.language} />
            )}
            {metadata.timezone && (
              <MetaItem label="Timezone" value={metadata.timezone} />
            )}
            {metadata.connection && (
              <MetaItem label="Connection" value={metadata.connection} />
            )}
            {metadata.url && (
              <MetaItem label="URL" value={metadata.url} />
            )}
          </div>
        </div>
      )}

      {/* Console errors */}
      {hasErrors && (
        <div>
          <span className="block font-mono text-micro text-text3 uppercase tracking-[0.12em] mb-2.5">
            Console errors ({consoleErrors.length})
          </span>
          <div className="flex flex-col gap-1.5">
            {consoleErrors.map((err, i) => (
              <div
                key={i}
                className="font-mono text-footnote text-red/80 bg-red/5 border border-red/10 rounded px-3 py-2"
              >
                <code>{err.message}</code>
                <span className="text-text3 ml-2">
                  {err.source}:{err.line}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Screenshot */}
      {screenshot && (
        <div>
          <span className="block font-mono text-micro text-text3 uppercase tracking-[0.12em] mb-2.5">
            Screenshot
          </span>
          <img
            src={screenshot}
            alt="User screenshot"
            className="max-w-full rounded border border-border cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <span className="font-mono text-micro">
      <span className="text-text3">{label}:</span>{" "}
      <span className="text-text2">{value}</span>
    </span>
  );
}
