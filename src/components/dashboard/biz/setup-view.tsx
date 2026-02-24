"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useProjectStore } from "@/stores/project-store";
import { useBizStore, type BizConfig } from "@/stores/biz-store";
import { CAT_PRESETS } from "@/lib/cat-presets";
import { useToast } from "@/components/ui/toast";

export function SetupView() {
  const active = useProjectStore((s) => s.active);
  const { config, loadConfig, saveConfig } = useBizStore();
  const { show } = useToast();
  const [newCat, setNewCat] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    if (active) loadConfig(active.id);
  }, [active, loadConfig]);

  const save = useCallback(
    (updated: BizConfig) => {
      if (active) saveConfig(active.id, updated);
    },
    [active, saveConfig]
  );

  function handleNameChange(name: string) {
    save({ ...config, name });
  }

  function handleTypeChange(type: string) {
    const cats = [...(CAT_PRESETS[type] || CAT_PRESETS.default)];
    save({ ...config, type, categories: cats });
  }

  function addCategory() {
    const val = newCat.trim();
    if (!val || config.categories.includes(val)) return;
    save({ ...config, categories: [...config.categories, val] });
    setNewCat("");
  }

  function removeCategory(idx: number) {
    const cats = [...config.categories];
    cats.splice(idx, 1);
    save({ ...config, categories: cats });
  }

  function resetCategories() {
    const cats = [...(CAT_PRESETS[config.type] || CAT_PRESETS.default)];
    save({ ...config, categories: cats });
    show("Categories reset");
  }

  function handleDragStart(idx: number) {
    setDragIdx(idx);
  }

  function handleDrop(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const cats = [...config.categories];
    const [moved] = cats.splice(dragIdx, 1);
    cats.splice(targetIdx, 0, moved);
    save({ ...config, categories: cats });
    setDragIdx(null);
  }

  // Build embed snippet
  const source = active?.source || "your-business-id";
  const catStr = config.categories.join(",");
  let snippet = `<script\n  src="https://grova.dev/grova-business-widget.js"\n  data-source="${source}"`;
  if (config.type && config.type !== "default") {
    snippet += `\n  data-business-type="${config.type}"`;
  }
  if (config.name) {
    snippet += `\n  data-name="${config.name.replace(/"/g, "&quot;")}"`;
  }
  if (catStr) {
    snippet += `\n  data-categories="${catStr}"`;
  }
  snippet += `>\n</script>`;

  function copySnippet() {
    navigator.clipboard.writeText(snippet).then(() => show("Snippet copied"));
  }

  if (!active) return null;

  return (
    <div className="max-w-[640px]">
      {/* Business profile */}
      <div className="mb-10">
        <span className="block font-mono text-micro text-text3 uppercase tracking-[0.14em] mb-4">
          Business profile
        </span>
        <div className="flex flex-col gap-4">
          <Input
            id="biz-name"
            label="Business name"
            value={config.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Corner Bistro"
          />
          <Select
            id="biz-type"
            label="Business type"
            value={config.type}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <option value="restaurant">Restaurant</option>
            <option value="salon">Salon / Spa</option>
            <option value="retail">Retail store</option>
            <option value="default">Other</option>
          </Select>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-micro text-text3 uppercase tracking-[0.14em]">
            Categories
          </span>
          <button
            onClick={resetCategories}
            className="font-mono text-micro text-text3 hover:text-text2 transition-colors cursor-pointer"
          >
            Reset to defaults
          </button>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {config.categories.map((cat, i) => (
            <div
              key={`${cat}-${i}`}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              className="flex items-center gap-1.5 bg-surface border border-border rounded px-3 py-1.5
                         font-mono text-footnote text-text2 cursor-grab active:cursor-grabbing
                         [html[data-theme=light]_&]:bg-white"
            >
              {cat}
              <button
                onClick={() => removeCategory(i)}
                className="text-text3 hover:text-red transition-colors cursor-pointer ml-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Add category */}
        <div className="flex items-center gap-2">
          <input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
            placeholder="Add category..."
            className="flex-1 bg-bg2 border border-border rounded px-3 py-2
                       font-mono text-footnote text-text placeholder:text-text3
                       focus:outline-none focus:border-accent transition-colors"
          />
          <button
            onClick={addCategory}
            className="font-mono text-footnote text-accent hover:text-accent/80
                       transition-colors cursor-pointer px-2 py-2"
          >
            Add
          </button>
        </div>
      </div>

      {/* Embed snippet */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-micro text-text3 uppercase tracking-[0.14em]">
            Embed snippet
          </span>
          <button
            onClick={copySnippet}
            className="font-mono text-micro text-accent hover:text-accent/80
                       transition-colors cursor-pointer"
          >
            Copy
          </button>
        </div>
        <pre className="bg-bg2 border border-border rounded p-4 font-mono text-micro text-text2 leading-[1.8] overflow-x-auto whitespace-pre-wrap">
          {snippet}
        </pre>
      </div>

      {/* Widget preview */}
      <div>
        <span className="block font-mono text-micro text-text3 uppercase tracking-[0.14em] mb-3">
          Widget preview
        </span>
        <div className="bg-surface border border-border rounded p-6 max-w-[320px] [html[data-theme=light]_&]:bg-white">
          <span className="block font-mono text-micro text-text3 uppercase tracking-[0.12em] mb-2">
            Get in touch
          </span>
          <h3 className="font-serif text-callout text-text mb-4">
            {config.name
              ? `Leave a message for ${config.name}`
              : "How can we help?"}
          </h3>
          <div className="flex flex-col gap-2">
            {config.categories.map((cat) => (
              <div
                key={cat}
                className="bg-bg2 border border-border rounded px-3 py-2
                           font-mono text-footnote text-text2 [html[data-theme=light]_&]:bg-surface"
              >
                {cat}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
