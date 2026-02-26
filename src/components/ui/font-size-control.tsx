"use client";

import { useFontSize, type FontSizePreset } from "@/providers/font-size-provider";

const PRESETS: { label: string; value: FontSizePreset }[] = [
  { label: "Small", value: 0 },
  { label: "Default", value: 1 },
  { label: "Large", value: 2 },
  { label: "X-Large", value: 3 },
];

export function FontSizeControl() {
  const { preset, setPreset } = useFontSize();

  return (
    <div className="flex flex-col gap-5">
      {/* Slider row with A labels */}
      <div className="flex items-center gap-4">
        <span
          className="font-serif text-text3 select-none shrink-0 leading-none"
          style={{ fontSize: "0.75rem" }}
          aria-hidden="true"
        >
          A
        </span>

        <input
          type="range"
          min={0}
          max={3}
          step={1}
          value={preset}
          onChange={(e) => setPreset(Number(e.target.value) as FontSizePreset)}
          className="font-size-slider flex-1"
          aria-label="Text size"
          aria-valuetext={PRESETS[preset].label}
        />

        <span
          className="font-serif text-text3 select-none shrink-0 leading-none"
          style={{ fontSize: "1.4rem" }}
          aria-hidden="true"
        >
          A
        </span>
      </div>

      {/* Preset buttons */}
      <div className="flex gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPreset(p.value)}
            className={`flex-1 font-mono text-micro py-2 rounded-lg border transition-all duration-200 cursor-pointer
              ${
                p.value === preset
                  ? "bg-accent/10 border-accent/30 text-accent"
                  : "bg-bg2 border-border text-text3 hover:text-text2 hover:border-border2"
              }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Live preview */}
      <p className="font-mono text-footnote text-text3 leading-relaxed">
        The quick brown fox jumps over the lazy dog.
      </p>
    </div>
  );
}
