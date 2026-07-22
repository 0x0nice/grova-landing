"use client";

import { useEffect, useMemo, useState } from "react";
import type { AgentProvider, ChangeDetail, ChangePackage } from "@/types/change";
import { getChange } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { EnrichmentPanel } from "./enrichment-panel";

function label(value: string) {
  return value.replaceAll("_", " ");
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-5 border-b border-border last:border-b-0">
      <h3 className="text-footnote font-medium text-text mb-3">{title}</h3>
      {children}
    </section>
  );
}

export function ChangeDetailPanel({
  item,
  onApprove,
  onDismiss,
  onRelease,
  onRollback,
  onRetryRelease,
}: {
  item: ChangePackage;
  onApprove: (provider: AgentProvider, mode: "local_automated" | "interactive") => Promise<void>;
  onDismiss: (rationale: string | null) => Promise<void>;
  onRelease: (releaseId: string, targets: Array<{ surface_id: string; environment: string }>) => Promise<void>;
  onRollback: (releaseId: string, deploymentId: string, rationale: string) => Promise<void>;
  onRetryRelease: (releaseId: string, rationale: string | null) => Promise<void>;
}) {
  const { session, isDemo } = useAuth();
  const [detail, setDetail] = useState<ChangeDetail | null>(null);
  const [provider, setProvider] = useState<AgentProvider>("codex");
  const [mode, setMode] = useState<"local_automated" | "interactive">("local_automated");
  const [submitting, setSubmitting] = useState(false);
  const [dismissOpen, setDismissOpen] = useState(false);
  const [rationale, setRationale] = useState("");
  const [releaseTargets, setReleaseTargets] = useState<Record<string, string>>({});
  const [rollbackDeployment, setRollbackDeployment] = useState<string | null>(null);
  const [rollbackReason, setRollbackReason] = useState("");
  const [retryReason, setRetryReason] = useState("");

  useEffect(() => {
    setDetail(null);
    if (isDemo || !session?.access_token) return;
    let active = true;
    void getChange(item.id, session.access_token)
      .then(result => active && setDetail(result))
      .catch(() => {});
    return () => { active = false; };
  }, [item.id, item.status, item.updated_at, isDemo, session?.access_token]);

  const current: ChangePackage = detail || item;
  const feedback = detail?.feedback || current.feedback;
  const canApprove = current.status === "proposal_ready" || current.status === "approved";
  const canDismiss = ["proposal_ready", "approved"].includes(current.status);
  const runnerState = current.latest_agent_run || detail?.agent_runs[0] || null;
  const confidence = typeof current.proposal.confidence === "number"
    ? Math.round(current.proposal.confidence * 100)
    : null;
  const surfaces = useMemo(() => detail?.surfaces || [], [detail?.surfaces]);
  const releaseCandidate = detail?.release_candidates.find(candidate => candidate.status === "ready") || null;
  const failedRelease = detail?.release_candidates.find(candidate => candidate.status === "failed") || null;
  const releaseCancellationActive = detail?.deployments.some(deployment =>
    deployment.release_candidate_id === failedRelease?.id &&
    ["queued", "deploying", "cancel_requested"].includes(deployment.status)
  ) || false;
  const deployableSurfaces = useMemo(() => surfaces.filter(surface => {
    const commands = surface.deployment_config?.commands || {};
    return surface.release_channels.some(channel => Array.isArray(commands[channel]) && commands[channel].length > 0);
  }), [surfaces]);
  const context = useMemo(() => {
    const value = feedback?.context || current.proposal.observed_context;
    return value && typeof value === "object" ? value as Record<string, unknown> : null;
  }, [feedback?.context, current.proposal.observed_context]);

  useEffect(() => {
    if (!releaseCandidate || deployableSurfaces.length === 0) return;
    setReleaseTargets(existing => {
      const next = { ...existing };
      for (const surface of deployableSurfaces) {
        const commands = surface.deployment_config?.commands || {};
        const channels = surface.release_channels.filter(channel => Array.isArray(commands[channel]) && commands[channel].length > 0);
        if (!channels.includes(next[surface.id])) next[surface.id] = channels.includes("preview") ? "preview" : channels[0];
      }
      return next;
    });
  }, [releaseCandidate, deployableSurfaces]);

  async function approve() {
    setSubmitting(true);
    try { await onApprove(provider, mode); } finally { setSubmitting(false); }
  }

  async function dismiss() {
    setSubmitting(true);
    try {
      await onDismiss(rationale.trim() || null);
      setDismissOpen(false);
    } finally { setSubmitting(false); }
  }

  async function release() {
    if (!releaseCandidate) return;
    const targets = deployableSurfaces.map(surface => ({
      surface_id: surface.id,
      environment: releaseTargets[surface.id],
    })).filter(target => Boolean(target.environment));
    setSubmitting(true);
    try { await onRelease(releaseCandidate.id, targets); } finally { setSubmitting(false); }
  }

  async function rollback(releaseId: string, deploymentId: string) {
    if (!rollbackReason.trim()) return;
    setSubmitting(true);
    try {
      await onRollback(releaseId, deploymentId, rollbackReason.trim());
      setRollbackDeployment(null);
      setRollbackReason("");
    } finally { setSubmitting(false); }
  }

  async function retryFailedRelease() {
    if (!failedRelease || releaseCancellationActive) return;
    setSubmitting(true);
    try {
      await onRetryRelease(failedRelease.id, retryReason.trim() || null);
      setRetryReason("");
    } finally { setSubmitting(false); }
  }

  return (
    <article className="bg-surface px-6 max-md:px-4 min-w-0">
      <header className="py-5 border-b border-border">
        <div className="flex items-center gap-x-3 gap-y-1 text-footnote mb-3 flex-wrap">
          <span className="font-medium text-text capitalize whitespace-nowrap">{label(current.status)}</span>
          <span className={`${current.risk_level === "protected" ? "text-red" : "text-text3"} whitespace-nowrap`}>
            {current.risk_level} risk
          </span>
          <span className="text-text3 whitespace-nowrap">version {current.version}</span>
          {confidence !== null && <span className="ml-auto text-text3 tabular-nums whitespace-nowrap max-sm:ml-0 max-sm:w-full">{confidence}% interpretation confidence</span>}
        </div>
        <h1 className="font-serif text-title text-text leading-[1.15] max-w-[32ch]">{current.title}</h1>
      </header>

      {canApprove && (
        <div className="py-4 border-b border-border flex flex-wrap items-end gap-3">
          <label className="text-footnote text-text2">
            Agent
            <select
              value={provider}
              onChange={event => setProvider(event.target.value as AgentProvider)}
              className="mt-1 block bg-bg border border-border rounded-sm px-3 py-2 text-footnote text-text min-w-28"
            >
              <option value="codex">Codex</option>
              <option value="claude">Claude Code</option>
            </select>
          </label>
          <label className="text-footnote text-text2">
            Handoff
            <select
              value={mode}
              onChange={event => setMode(event.target.value as "local_automated" | "interactive")}
              className="mt-1 block bg-bg border border-border rounded-sm px-3 py-2 text-footnote text-text min-w-40"
            >
              <option value="local_automated">Local runner</option>
              <option value="interactive">Open interactively</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => void approve()}
            disabled={submitting}
            className="bg-text text-bg rounded-sm px-4 py-2 text-footnote font-medium cursor-pointer disabled:opacity-50 hover:bg-text2 transition-colors"
          >
            {submitting ? "Authorizing…" : `Approve and send to ${provider === "codex" ? "Codex" : "Claude"}`}
          </button>
          {canDismiss && (
            <button
              type="button"
              onClick={() => setDismissOpen(value => !value)}
              className="px-3 py-2 text-footnote text-text3 hover:text-text transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {dismissOpen && (
        <div className="py-4 border-b border-border">
          <label className="text-footnote text-text2 block mb-2" htmlFor={`dismiss-${current.id}`}>
            Why dismiss this proposal? Optional, but Grova learns from the decision.
          </label>
          <div className="flex gap-2 max-sm:flex-col">
            <input
              id={`dismiss-${current.id}`}
              value={rationale}
              onChange={event => setRationale(event.target.value)}
              maxLength={2000}
              className="flex-1 bg-bg border border-border rounded-sm px-3 py-2 text-footnote text-text"
              placeholder="Wrong interpretation, duplicate, not worth changing…"
            />
            <button
              type="button"
              disabled={submitting}
              onClick={() => void dismiss()}
              className="bg-red text-white rounded-sm px-4 py-2 text-footnote cursor-pointer disabled:opacity-50"
            >
              Confirm dismissal
            </button>
          </div>
        </div>
      )}

      {runnerState && (
        <DetailSection title="Agent run">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-footnote max-sm:grid-cols-1">
            <p><span className="text-text3">Provider:</span> <span className="text-text capitalize">{runnerState.provider}</span></p>
            <p><span className="text-text3">State:</span> <span className="text-text capitalize">{label(runnerState.status)}</span></p>
            {runnerState.branch_name && <p className="col-span-full break-all"><span className="text-text3">Branch:</span> {runnerState.branch_name}</p>}
            {runnerState.commit_sha && <p className="col-span-full break-all"><span className="text-text3">Commit:</span> {runnerState.commit_sha}</p>}
          </div>
        </DetailSection>
      )}

      <DetailSection title="What Grova believes should change">
        <p className="text-body text-text leading-[1.6] max-w-[70ch]">{current.proposal.objective}</p>
        {current.proposal.likely_cause && (
          <p className="text-footnote text-text2 leading-[1.6] mt-3 max-w-[78ch]">
            <span className="text-text3">Evidence points to:</span> {current.proposal.likely_cause}
          </p>
        )}
        {current.proposal.uncertainty && current.proposal.uncertainty.length > 0 && (
          <div className="mt-4 bg-orange-dim px-3 py-3 text-footnote text-orange leading-[1.55]">
            {current.proposal.uncertainty.map(value => <p key={value}>{value}</p>)}
          </div>
        )}
      </DetailSection>

      <DetailSection title="Proof required">
        <ol className="space-y-2 text-footnote text-text2 leading-[1.55]">
          {current.acceptance_criteria.map((criterion, index) => (
            <li key={`${criterion}-${index}`} className="grid grid-cols-[1.5rem_1fr] gap-2">
              <span className="text-text3 tabular-nums">{index + 1}.</span>
              <span>{criterion}</span>
            </li>
          ))}
        </ol>
      </DetailSection>

      <DetailSection title="Affected surfaces">
        {surfaces.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {surfaces.map(surface => (
              <div key={surface.id} className="bg-bg px-3 py-3">
                <p className="text-footnote font-medium text-text">{surface.display_name}</p>
                <p className="text-micro text-text3 mt-1">{surface.platform}{surface.build_target ? ` · ${surface.build_target}` : ""}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-footnote text-orange">No surface is confirmed yet. Confirm scope before authorizing code changes.</p>
        )}
      </DetailSection>

      <DetailSection title="Original report">
        <p className="text-body text-text2 leading-[1.65] whitespace-pre-wrap">{feedback?.message || current.problem_statement}</p>
        {feedback?.page && <p className="text-micro text-text3 mt-3 break-all">Observed at {feedback.page}</p>}
      </DetailSection>

      {feedback && (
        <DetailSection title="Captured evidence">
          <EnrichmentPanel
            metadata={feedback.metadata}
            consoleErrors={feedback.console_errors}
            screenshot={feedback.screenshot}
          />
          {context && (
            <details className="mt-4">
              <summary className="text-footnote text-text3 hover:text-text2 cursor-pointer">Context envelope</summary>
              <pre className="mt-3 bg-bg px-4 py-3 text-micro text-text2 leading-[1.55] overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(context, null, 2)}
              </pre>
            </details>
          )}
        </DetailSection>
      )}

      {detail && detail.verification_runs.length > 0 && (
        <DetailSection title="Independent proof">
          {detail.verification_runs.map(run => (
            <div key={run.id} className="mb-4 last:mb-0">
              <p className={`text-footnote font-medium ${run.status === "passed" ? "text-accent" : "text-red"}`}>
                {label(run.status)}
              </p>
              {run.summary && <p className="text-footnote text-text2 mt-1">{run.summary}</p>}
            </div>
          ))}
        </DetailSection>
      )}

      {releaseCandidate && (
        <DetailSection title="Release proven commit">
          <p className="text-footnote text-text2 leading-[1.55] mb-4">
            Commit <code className="font-mono text-micro text-text">{releaseCandidate.commit_sha.slice(0, 12)}</code> passed every required check. Choose where each affected surface should ship.
          </p>
          {deployableSurfaces.length > 0 ? (
            <div className="space-y-3">
              {deployableSurfaces.map(surface => {
                const commands = surface.deployment_config?.commands || {};
                const channels = surface.release_channels.filter(channel => Array.isArray(commands[channel]) && commands[channel].length > 0);
                return (
                  <div key={surface.id} className="grid grid-cols-[1fr_minmax(9rem,12rem)] gap-3 items-center bg-bg px-3 py-3 max-sm:grid-cols-1">
                    <div>
                      <p className="text-footnote font-medium text-text">{surface.display_name}</p>
                      <p className="text-micro text-text3 mt-1">{surface.deployment_config.adapter || "command"} adapter</p>
                    </div>
                    <select
                      aria-label={`Release channel for ${surface.display_name}`}
                      value={releaseTargets[surface.id] || ""}
                      onChange={event => setReleaseTargets(currentTargets => ({ ...currentTargets, [surface.id]: event.target.value }))}
                      className="bg-surface border border-border rounded-sm px-3 py-2 text-footnote text-text"
                    >
                      {channels.map(channel => <option key={channel} value={channel}>{label(channel)}</option>)}
                    </select>
                  </div>
                );
              })}
              <button
                type="button"
                disabled={submitting || deployableSurfaces.length !== surfaces.length}
                onClick={() => void release()}
                className="bg-text text-bg rounded-sm px-4 py-2 text-footnote font-medium cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Queuing release…" : "Release all affected surfaces"}
              </button>
              {deployableSurfaces.length !== surfaces.length && (
                <p className="text-footnote text-orange">Every affected surface needs a deployment recipe before this coordinated release can run.</p>
              )}
            </div>
          ) : (
            <p className="text-footnote text-orange">Add a deployment recipe in Delivery setup before releasing this commit.</p>
          )}
        </DetailSection>
      )}

      {detail && detail.deployments.length > 0 && (
        <DetailSection title="Deployments">
          {failedRelease && (
            <div className="mb-3 bg-red-dim px-3 py-3">
              <p className="text-footnote font-medium text-red">Coordinated release stopped</p>
              <p className="text-micro text-text2 mt-1 leading-[1.5]">
                Grova stopped the remaining targets after one failed. Already successful surfaces stay untouched; retry queues only failed or cancelled targets.
              </p>
              <div className="mt-3 flex gap-2 max-sm:flex-col">
                <input
                  value={retryReason}
                  onChange={event => setRetryReason(event.target.value)}
                  placeholder="Optional note for the retry"
                  className="flex-1 bg-surface border border-border rounded-sm px-3 py-2 text-footnote text-text"
                />
                <button
                  type="button"
                  disabled={submitting || releaseCancellationActive}
                  onClick={() => void retryFailedRelease()}
                  className="bg-text text-bg rounded-sm px-4 py-2 text-footnote font-medium cursor-pointer disabled:opacity-50"
                >
                  {releaseCancellationActive ? "Stopping targets…" : "Retry failed targets"}
                </button>
              </div>
            </div>
          )}
          <div className="space-y-3">
            {detail.deployments.map(deployment => {
              const surface = surfaces.find(value => value.id === deployment.surface_id);
              const canRollback = deployment.status === "succeeded" && !deployment.rollback_of;
              return (
                <div key={deployment.id} className="bg-bg px-3 py-3">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <p className="text-footnote font-medium text-text">{surface?.display_name || "Product surface"}</p>
                    <span className="text-micro text-text3">{label(deployment.environment)}</span>
                    <span className={deployment.status === "failed" ? "text-micro text-red" : "text-micro text-text3"}>{label(deployment.status)}</span>
                    {deployment.url && <a href={deployment.url} target="_blank" rel="noreferrer" className="ml-auto text-micro text-text2 hover:text-text">Open release</a>}
                    {canRollback && (
                      <button type="button" onClick={() => setRollbackDeployment(deployment.id)} className="ml-auto text-micro text-red cursor-pointer">Rollback</button>
                    )}
                  </div>
                  {deployment.last_error && <p className="text-micro text-red mt-2">{deployment.last_error}</p>}
                  {rollbackDeployment === deployment.id && (
                    <div className="mt-3 flex gap-2 max-sm:flex-col">
                      <input
                        value={rollbackReason}
                        onChange={event => setRollbackReason(event.target.value)}
                        placeholder="Required reason for rollback"
                        className="flex-1 bg-surface border border-border rounded-sm px-3 py-2 text-footnote text-text"
                      />
                      <button
                        type="button"
                        disabled={submitting || !rollbackReason.trim()}
                        onClick={() => void rollback(deployment.release_candidate_id, deployment.id)}
                        className="bg-red text-white rounded-sm px-4 py-2 text-footnote cursor-pointer disabled:opacity-50"
                      >
                        Confirm rollback
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </DetailSection>
      )}

      {detail && detail.events.length > 0 && (
        <DetailSection title="Audit trail">
          <div className="space-y-3">
            {detail.events.map(event => (
              <div key={event.id} className="flex items-baseline gap-3 text-footnote">
                <span className="text-text3 tabular-nums shrink-0">{new Date(event.created_at).toLocaleString()}</span>
                <span className="text-text2">{label(event.event_type)}</span>
              </div>
            ))}
          </div>
        </DetailSection>
      )}
    </article>
  );
}
