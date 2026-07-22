import type { ChangePackage, ChangeStatus } from "@/types/change";
import { timeAgo } from "@/lib/triage";

const statusLabel: Record<ChangeStatus, string> = {
  proposal_ready: "Review",
  approved: "Approved",
  dismissed: "Dismissed",
  dispatched: "Queued",
  working: "Working",
  change_ready: "Change ready",
  verifying: "Verifying",
  proof_failed: "Proof failed",
  ready_to_release: "Proof ready",
  deploying: "Deploying",
  deployed: "Released",
  observing: "Observing",
  closed: "Closed",
  regressed: "Regressed",
  rolled_back: "Rolled back",
};

function statusTone(status: ChangeStatus) {
  if (["proof_failed", "regressed"].includes(status)) return "text-red";
  if (["proposal_ready", "ready_to_release"].includes(status)) return "text-orange";
  if (["working", "verifying", "deploying", "dispatched"].includes(status)) return "text-accent";
  return "text-text3";
}

export function ChangeQueue({
  items,
  selectedId,
  onSelect,
}: {
  items: ChangePackage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="bg-bg" aria-label="Change queue">
      {items.map(item => {
        const selected = item.id === selectedId;
        const summary = item.feedback?.triage?.summary || item.problem_statement;
        return (
          <button
            type="button"
            key={item.id}
            onClick={() => onSelect(item.id)}
            aria-current={selected ? "true" : undefined}
            className={`w-full text-left px-4 py-4 border-b border-border transition-colors cursor-pointer ${
              selected ? "bg-surface text-text" : "text-text2 hover:bg-surface/50"
            }`}
          >
            <div className="flex items-baseline gap-3 mb-2">
              <span className={`text-footnote font-medium ${statusTone(item.status)}`}>
                {statusLabel[item.status]}
              </span>
              <span className="text-caption text-text3 capitalize truncate">{item.category?.replaceAll("_", " ")}</span>
              <span className="ml-auto text-micro text-text3 shrink-0 tabular-nums">
                {timeAgo(item.created_at)}
              </span>
            </div>
            <h2 className="text-callout font-medium leading-[1.35] line-clamp-2 mb-1.5">{item.title}</h2>
            <p className="text-footnote text-text3 leading-[1.45] line-clamp-2">{summary}</p>
            <div className="mt-3 flex items-center gap-3 text-micro text-text3">
              <span className={item.risk_level === "protected" ? "text-red" : ""}>{item.risk_level} risk</span>
              {item.latest_agent_run && (
                <span>{item.latest_agent_run.provider} · {item.latest_agent_run.status.replaceAll("_", " ")}</span>
              )}
            </div>
          </button>
        );
      })}
    </section>
  );
}
