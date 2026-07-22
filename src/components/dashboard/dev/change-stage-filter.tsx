import type { ChangePackage } from "@/types/change";
import { changeMatchesFilter, type ChangeFilter } from "@/stores/change-store";

const stages: Array<{ key: ChangeFilter; label: string }> = [
  { key: "attention", label: "Needs you" },
  { key: "working", label: "Agent working" },
  { key: "proof", label: "Proof ready" },
  { key: "released", label: "Released" },
  { key: "all", label: "All" },
];

export function ChangeStageFilter({
  items,
  value,
  onChange,
}: {
  items: ChangePackage[];
  value: ChangeFilter;
  onChange: (value: ChangeFilter) => void;
}) {
  return (
    <div className="flex items-center min-w-0 overflow-x-auto scrollbar-none" role="tablist" aria-label="Change stage">
      {stages.map(stage => {
        const active = value === stage.key;
        const count = items.filter(item => changeMatchesFilter(item.status, stage.key)).length;
        return (
          <button
            type="button"
            role="tab"
            aria-selected={active}
            key={stage.key}
            onClick={() => onChange(stage.key)}
            className={`shrink-0 px-3 py-2 text-footnote transition-colors cursor-pointer rounded-sm ${
              active ? "bg-surface text-text font-medium" : "text-text3 hover:text-text2"
            }`}
          >
            {stage.label}
            <span className="ml-1.5 tabular-nums text-text3">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
