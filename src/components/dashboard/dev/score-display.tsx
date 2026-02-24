import { scoreClass, scoreColor } from "@/lib/triage";

interface ScoreDisplayProps {
  score: number;
  size?: "sm" | "lg";
}

export function ScoreDisplay({ score, size = "lg" }: ScoreDisplayProps) {
  const cls = scoreClass(score);
  const color = scoreColor(cls);

  return (
    <div className="flex flex-col items-center">
      <span
        className={`font-serif italic leading-none ${color} ${
          size === "lg" ? "text-[2.6rem]" : "text-[1.8rem]"
        }`}
      >
        {score.toFixed(1)}
      </span>
      <span className="font-mono text-micro text-text3 uppercase tracking-[0.08em] mt-1">
        score
      </span>
    </div>
  );
}
