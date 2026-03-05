// ── AI PROMPT GENERATOR ──
// Generates category-aware engineering tickets from approved feedback.
// Replaces the old cursor-prompt.ts which dumped the full README verbatim.

import type { FeedbackItem } from "@/types/feedback";
import { effectiveScore, signalCount, typeLabel, scoreAnchor } from "./triage";
import { parseProjectContext, type ProjectContextParsed } from "./parse-project-context";

type Category = "bug" | "feature_request" | "feature" | "ux" | "complaint" | "question" | "praise" | "spam" | "other";

// ── Main export ──

export function generateAIPrompt(
  item: FeedbackItem,
  projectContext?: string
): string {
  const t = item.triage;
  const category = normalizeCategory(t?.category || item.type);
  const label = typeLabel(t?.category || item.type);
  const heading = t?.summary || item.message.slice(0, 80);
  const parsed = projectContext ? parseProjectContext(projectContext) : null;

  const sections: string[] = [];

  // 1. Title
  sections.push(`## ${label}: ${heading}`);
  sections.push("");

  // 2. Problem statement
  sections.push(buildProblemStatement(item, category));
  sections.push("");

  // 3. Technical context (from parsed README)
  const techCtx = buildTechContext(parsed);
  if (techCtx) {
    sections.push(techCtx);
    sections.push("");
  }

  // 4. Where to look
  const hints = buildInvestigationHints(item, category, parsed);
  if (hints) {
    sections.push(hints);
    sections.push("");
  }

  // 5. Environment (conditional by category)
  const env = buildEnvironment(item, category);
  if (env) {
    sections.push(env);
    sections.push("");
  }

  // 6. Console errors
  const errors = buildConsoleErrors(item);
  if (errors) {
    sections.push(errors);
    sections.push("");
  }

  // 7. Diagnostic questions
  sections.push(buildDiagnosticQuestions(item, category));
  sections.push("");

  // 8. Acceptance criteria
  sections.push(buildAcceptanceCriteria(item, category));
  sections.push("");

  // 9. Priority footer
  sections.push(buildFooter(item));

  return sections.join("\n");
}

// ── Helpers ──

function normalizeCategory(raw: string): Category {
  const map: Record<string, Category> = {
    bug: "bug",
    feature: "feature_request",
    feature_request: "feature_request",
    ux: "ux",
    complaint: "complaint",
    question: "question",
    praise: "praise",
    spam: "spam",
    other: "other",
  };
  return map[raw] || "bug";
}

function buildProblemStatement(item: FeedbackItem, category: Category): string {
  const t = item.triage;
  const sig = signalCount(item);
  const sigNote = sig > 1
    ? ` ${sig} users have independently reported this issue, indicating it is reproducible.`
    : "";

  const userSays = item.message.length > 200
    ? item.message.slice(0, 200) + "..."
    : item.message;
  const analysis = t?.reasoning ? ` AI analysis: ${t.reasoning}` : "";

  const lines = ["### Problem Statement"];

  switch (category) {
    case "bug":
      lines.push(`A user has reported a defect.${sigNote} The user describes: "${userSays}"${analysis}`);
      break;
    case "feature_request":
      lines.push(`A user has requested a new capability.${sigNote} Their description: "${userSays}"${analysis}`);
      break;
    case "ux":
    case "complaint":
      lines.push(`A user has flagged a usability issue.${sigNote} They describe: "${userSays}"${analysis}`);
      break;
    case "question":
      lines.push(`A user is confused about functionality.${sigNote} Their question: "${userSays}" This likely indicates unclear documentation or UI.${analysis}`);
      break;
    case "praise":
      lines.push(`Positive feedback received.${sigNote} The user says: "${userSays}" Consider what's working well here and how to preserve it.${analysis}`);
      break;
    default:
      lines.push(`User feedback received.${sigNote} The user says: "${userSays}"${analysis}`);
  }

  return lines.join("\n");
}

function buildTechContext(parsed: ProjectContextParsed | null): string | null {
  if (!parsed || parsed.techStack.length === 0) return null;

  const lines = ["### Technical Context"];

  if (parsed.techStack.length > 0) {
    lines.push(`- **Stack:** ${parsed.techStack.join(", ")}`);
  }
  if (parsed.stateManagement) {
    lines.push(`- **State management:** ${parsed.stateManagement}`);
  }
  if (parsed.database) {
    lines.push(`- **Database:** ${parsed.database}`);
  }
  if (parsed.styling) {
    lines.push(`- **Styling:** ${parsed.styling}`);
  }
  if (parsed.keyDirectories.length > 0) {
    lines.push(`- **Key areas:** ${parsed.keyDirectories.join(", ")}`);
  }

  return lines.join("\n");
}

function buildInvestigationHints(
  item: FeedbackItem,
  category: Category,
  parsed: ProjectContextParsed | null
): string | null {
  const hints: string[] = [];

  // Console errors → direct trace
  if (item.console_errors?.length) {
    const first = item.console_errors[0];
    hints.push(`Start with the console error: \`${first.message}\` at \`${first.source}:${first.line}\`. Trace this to the root cause.`);
  }

  // Page URL → find the route
  if (item.page) {
    const page = item.page === "/" ? "the root/index page" : `\`${item.page}\``;
    hints.push(`This was reported on ${page} — locate the route or component that renders this page.`);
  }

  // Screenshot available
  if (item.screenshot) {
    hints.push("A screenshot was captured with this report — review it for visual context.");
  }

  // Tech-stack-aware hints
  if (parsed) {
    if (category === "bug") {
      if (parsed.stateManagement) {
        hints.push(`This project uses ${parsed.stateManagement} for state management. Check for stale state, missing subscriptions, or incorrect selectors.`);
      }
      if (parsed.techStack.includes("React")) {
        hints.push("For React bugs, check useEffect cleanup, stale closures, and re-render cascades.");
      }
    }

    if ((category === "ux" || category === "complaint") && parsed.styling) {
      hints.push(`Styling uses ${parsed.styling}. Check for responsive breakpoints, overflow, or z-index issues.`);
    }

    if (category === "feature_request") {
      hints.push("Review existing components in the relevant area to understand current capabilities before designing the addition.");
    }
  }

  // Responsive / cross-browser hints from metadata
  const m = item.metadata;
  if (m) {
    if (m.device_type === "mobile" && (category === "bug" || category === "ux" || category === "complaint")) {
      hints.push(`Reported on a mobile device${m.viewport ? ` (${m.viewport})` : ""}. This may be a responsive layout issue.`);
    }
    if (m.browser && /safari/i.test(m.browser) && category === "bug") {
      hints.push("Reported in Safari — check for Safari-specific quirks (flexbox gaps, autofill behavior, date parsing, etc.).");
    }
  }

  if (hints.length === 0) return null;

  return "### Where to Look\n" + hints.map((h, i) => `${i + 1}. ${h}`).join("\n");
}

function buildEnvironment(item: FeedbackItem, category: Category): string | null {
  const m = item.metadata;
  if (!m) return null;

  // Only include environment for categories where it matters
  if (category === "question" || category === "praise" || category === "spam") return null;

  const lines = ["### Environment"];

  if (category === "feature_request") {
    // Feature requests only need the page context
    if (m.url) lines.push(`- **URL:** ${m.url}`);
    else if (item.page) lines.push(`- **Page:** ${item.page}`);
    return lines.length > 1 ? lines.join("\n") : null;
  }

  if (category === "ux" || category === "complaint") {
    // UX issues need viewport/device context
    if (m.device_type) lines.push(`- **Device:** ${m.device_type}`);
    if (m.viewport) lines.push(`- **Viewport:** ${m.viewport}`);
    if (m.browser) lines.push(`- **Browser:** ${m.browser}`);
    if (m.url) lines.push(`- **URL:** ${m.url}`);
    return lines.length > 1 ? lines.join("\n") : null;
  }

  // Bugs get full environment
  if (m.browser) lines.push(`- **Browser:** ${m.browser}`);
  if (m.os) lines.push(`- **OS:** ${m.os}`);
  if (m.device_type) lines.push(`- **Device:** ${m.device_type}`);
  if (m.viewport) lines.push(`- **Viewport:** ${m.viewport}`);
  if (m.url) lines.push(`- **URL:** ${m.url}`);
  if (m.connection) lines.push(`- **Connection:** ${m.connection}`);

  return lines.length > 1 ? lines.join("\n") : null;
}

function buildConsoleErrors(item: FeedbackItem): string | null {
  if (!item.console_errors?.length) return null;

  const lines = [
    "### Console Errors",
    "These errors were captured in the user's browser session during the report:",
  ];

  for (const err of item.console_errors) {
    lines.push(`- \`${err.message}\` (${err.source}:${err.line})`);
  }

  return lines.join("\n");
}

function buildDiagnosticQuestions(item: FeedbackItem, category: Category): string {
  const lines = ["### Diagnostic Questions"];

  switch (category) {
    case "bug":
      lines.push("1. Can you reproduce this with the given environment details?");
      lines.push("2. Is this a regression? Check git log for recent changes to the affected area.");
      if (item.console_errors?.length) {
        lines.push("3. What causes the null reference or error condition?");
        lines.push("4. Are there error boundaries or fallback behaviors that should catch this?");
      } else {
        lines.push("3. What is the expected behavior vs. actual behavior?");
        lines.push("4. Are there edge cases in the input or state that trigger this?");
      }
      break;

    case "feature_request":
      lines.push("1. Does a partial version of this capability already exist?");
      lines.push("2. What's the minimal implementation that would satisfy this request?");
      lines.push("3. Are there architectural constraints that affect this feature?");
      lines.push("4. What existing components or patterns can be extended?");
      break;

    case "ux":
    case "complaint":
      lines.push("1. Is this a styling/layout issue or a behavioral/interaction issue?");
      lines.push("2. Does this reproduce across viewports (mobile, tablet, desktop)?");
      lines.push("3. Are there accessibility concerns (contrast, touch targets, screen readers)?");
      lines.push("4. Is the current behavior intentional design or unintended?");
      break;

    case "question":
      lines.push("1. Is the answer to this question documented anywhere?");
      lines.push("2. Should a tooltip, help text, or onboarding step address this?");
      lines.push("3. Is the confusion caused by unclear UI labels or missing affordances?");
      lines.push("4. Would a small copy change resolve this without code changes?");
      break;

    case "praise":
      lines.push("1. What specific implementation or design pattern is driving this positive feedback?");
      lines.push("2. Can this pattern be applied to other parts of the product?");
      lines.push("3. Is this behavior documented for future contributors to preserve?");
      break;

    default:
      lines.push("1. What is the user actually asking for or describing?");
      lines.push("2. Which area of the codebase is most relevant?");
      lines.push("3. What's the minimal change needed?");
  }

  return lines.join("\n");
}

function buildAcceptanceCriteria(item: FeedbackItem, category: Category): string {
  const lines = ["### Acceptance Criteria"];

  switch (category) {
    case "bug": {
      const browser = item.metadata?.browser;
      const env = browser ? ` in ${browser}` : "";
      lines.push(`- The reported behavior no longer occurs${env}`);
      lines.push("- No regressions introduced in related functionality");
      if (item.console_errors?.length) {
        lines.push("- Console errors from this report are resolved");
      }
      lines.push("- The fix handles edge cases gracefully");
      break;
    }

    case "feature_request":
      lines.push("- The requested capability works as described");
      lines.push("- Existing functionality is not broken");
      lines.push("- The implementation follows established patterns in this codebase");
      lines.push("- The feature is accessible and works across supported devices");
      break;

    case "ux":
    case "complaint": {
      const device = item.metadata?.device_type;
      const viewport = item.metadata?.viewport;
      const ctx = device ? ` on ${device}${viewport ? ` (${viewport})` : ""}` : "";
      lines.push(`- The usability issue is resolved${ctx}`);
      lines.push("- The interaction feels intuitive and consistent");
      lines.push("- No visual regressions on other viewports");
      break;
    }

    case "question":
      lines.push("- The source of confusion is addressed through code changes (better UI/copy) or documentation");
      lines.push("- A new user encountering this area would understand it without external help");
      break;

    case "praise":
      lines.push("- No code changes needed unless doubling down on this pattern");
      lines.push("- Document what's working well for future reference");
      break;

    default:
      lines.push("- The user's concern is addressed");
      lines.push("- No regressions introduced");
  }

  return lines.join("\n");
}

function scopeLabel(scopeEstimate?: number): string {
  if (scopeEstimate == null) return "Unknown";
  if (scopeEstimate >= 0.7) return "Small";
  if (scopeEstimate >= 0.4) return "Medium";
  return "Large";
}

function buildFooter(item: FeedbackItem): string {
  const es = effectiveScore(item);
  const sig = signalCount(item);
  const t = item.triage;
  const anchor = scoreAnchor(es);
  const scope = scopeLabel(t?.sub_scores?.scope_estimate);

  const parts = [`**Priority:** ${es}/10 — ${anchor}`];
  if (sig > 1) parts[0] += ` | ${sig} users reported`;

  if (t?.recommended_action) {
    parts.push(`**Recommended action:** ${t.recommended_action}`);
  }

  parts.push(`**Scope:** ${scope}`);

  return "---\n" + parts.join("\n");
}
