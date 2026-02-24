import type { FeedbackItem } from "@/types/feedback";
import { effectiveScore, signalCount, typeLabel } from "./triage";

export function generateCursorPrompt(
  item: FeedbackItem,
  projectContext?: string
): string {
  const t = item.triage;
  const label = typeLabel(t?.category || item.type);
  const heading = t?.summary || item.message.slice(0, 80);
  const lines: string[] = [];

  lines.push(`## ${label}: ${heading}`);
  lines.push("");

  // Project context
  if (projectContext?.trim()) {
    lines.push("### Project context");
    lines.push(projectContext.trim());
    lines.push("");
  }

  // User report
  lines.push("### User report");
  lines.push(`> ${item.message}`);
  lines.push("");

  // Basic info
  if (item.page) {
    lines.push(`**Page:** ${item.page}`);
  }

  const es = effectiveScore(item);
  const sig = signalCount(item);
  let scoreStr = `${es}/10`;
  if (sig > 1) scoreStr += ` (${sig} users reported)`;
  lines.push(`**Triage score:** ${scoreStr}`);

  if (t?.recommended_action) {
    lines.push(`**Recommended action:** ${t.recommended_action}`);
  }
  if (t?.reasoning) {
    lines.push(`**Analysis:** ${t.reasoning}`);
  }
  lines.push("");

  // Environment / metadata
  const m = item.metadata;
  if (m) {
    lines.push("### Environment");
    if (m.browser) lines.push(`- **Browser:** ${m.browser}`);
    if (m.os) lines.push(`- **OS:** ${m.os}`);
    if (m.device_type) lines.push(`- **Device:** ${m.device_type}`);
    if (m.viewport) lines.push(`- **Viewport:** ${m.viewport}`);
    if (m.screen) lines.push(`- **Screen:** ${m.screen}`);
    if (m.language) lines.push(`- **Language:** ${m.language}`);
    if (m.timezone) lines.push(`- **Timezone:** ${m.timezone}`);
    if (m.url) lines.push(`- **URL:** ${m.url}`);
    if (m.connection) lines.push(`- **Connection:** ${m.connection}`);
    lines.push("");
  }

  // Console errors
  if (item.console_errors?.length) {
    lines.push("### Console errors");
    for (const err of item.console_errors) {
      lines.push(
        `- \`${err.message}\` (${err.source}:${err.line})`
      );
    }
    lines.push("");
  }

  // Instructions
  lines.push("### Instructions");
  lines.push("1. Understand the root cause of this issue");
  lines.push("2. Identify the minimal change needed to fix it");
  lines.push(
    '3. Ask yourself: "Is there a more elegant solution?"'
  );
  lines.push("4. Only touch code directly related to this issue");
  lines.push("5. Do not refactor unrelated areas");
  lines.push("6. Verify the fix resolves the reported problem");
  lines.push("7. List any follow-up items or related concerns");

  return lines.join("\n");
}
