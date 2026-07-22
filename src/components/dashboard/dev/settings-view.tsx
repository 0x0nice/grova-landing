"use client";

import { useEffect, useState } from "react";
import { useProjectStore } from "@/stores/project-store";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/components/ui/toast";
import { WidgetInstallSection } from "@/components/dashboard/widget-install-section";
import {
  createProjectSurface,
  createRunnerPairingCode,
  getProjectSurfaces,
  getRunnerDevices,
  putProjectPreferences,
  revokeRunnerDevice,
  updateProjectSurface,
} from "@/lib/api";
import type { ProjectSurface, RunnerDevice } from "@/types/change";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface px-5 py-5 max-md:px-4">
      <div className="mb-5">
        <h2 className="font-serif text-callout text-text mb-1">{title}</h2>
        <p className="text-footnote text-text3 leading-[1.55] max-w-[72ch]">{description}</p>
      </div>
      {children}
    </section>
  );
}

const inputClass = "w-full bg-bg border border-border rounded-sm px-3 py-2 text-footnote text-text";
const releaseEnvironments = new Set(["preview", "staging", "testflight", "beta", "production"]);

function parseRecipeLines(value: string) {
  const result: Record<string, string[]> = {};
  for (const rawLine of value.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const separator = line.indexOf("=");
    const environment = separator > 0 ? line.slice(0, separator).trim() : "";
    const command = separator > 0 ? line.slice(separator + 1).trim() : "";
    if (!releaseEnvironments.has(environment) || !command) {
      throw new Error(`Invalid release recipe: ${line}. Use environment=command.`);
    }
    result[environment] = [...(result[environment] || []), command];
  }
  return result;
}

function recipeLines(value?: Record<string, Array<string | { command: string }>>) {
  return Object.entries(value || {}).flatMap(([environment, commands]) =>
    commands.map(command => `${environment}=${typeof command === "string" ? command : command.command}`)
  ).join("\n");
}

export function SettingsView() {
  const active = useProjectStore(state => state.active);
  const { session, isDemo } = useAuth();
  const { show } = useToast();
  const token = session?.access_token || "demo";
  const [context, setContext] = useState("");
  const [surfaces, setSurfaces] = useState<ProjectSurface[]>([]);
  const [devices, setDevices] = useState<RunnerDevice[]>([]);
  const [pairing, setPairing] = useState<{ code: string; expires_at: string } | null>(null);
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<string | null>(null);
  const [delivery, setDelivery] = useState({
    adapter: "command" as NonNullable<ProjectSurface["deployment_config"]["adapter"]>,
    release_channels: "preview\nproduction",
    commands: "",
    smoke_commands: "",
    rollback_commands: "",
    expected_url: "",
  });
  const [form, setForm] = useState({
    surface_key: "web",
    display_name: "Desktop web",
    platform: "web" as ProjectSurface["platform"],
    repository_remote: "",
    source_root: "",
    build_target: "",
    bundle_id: "",
    verify_commands: "npm run lint\nnpm run typecheck\nnpm run build",
    release_channels: "preview\nproduction",
    protected_paths: "src/auth\nsrc/billing",
  });

  useEffect(() => {
    setContext(active?.project_context || "");
    if (!active || isDemo) {
      setSurfaces([]);
      setDevices([]);
      return;
    }
    let current = true;
    setLoadingSetup(true);
    void Promise.all([
      getProjectSurfaces(active.id, token),
      getRunnerDevices(token),
    ]).then(([nextSurfaces, nextDevices]) => {
      if (!current) return;
      setSurfaces(nextSurfaces);
      setDevices(nextDevices);
    }).catch(error => {
      if (current) show(error instanceof Error ? error.message : "Could not load delivery setup");
    }).finally(() => current && setLoadingSetup(false));
    return () => { current = false; };
  }, [active, isDemo, token, show]);

  if (!active) return null;

  async function saveContext() {
    if (!active) return;
    setSaving(true);
    try {
      if (isDemo) localStorage.setItem(`grova-ctx-${active.id}`, context);
      else await putProjectPreferences(active.id, { project_context: context || null }, token);
      show("Project rules saved");
    } catch (error) {
      show(error instanceof Error ? error.message : "Could not save project rules");
    } finally {
      setSaving(false);
    }
  }

  async function addSurface() {
    if (!active || isDemo) return;
    setSaving(true);
    try {
      const created = await createProjectSurface(active.id, {
        surface_key: form.surface_key,
        display_name: form.display_name,
        platform: form.platform,
        repository_remote: form.repository_remote || null,
        source_root: form.source_root || null,
        build_target: form.build_target || null,
        bundle_id: form.bundle_id || null,
        verify_commands: form.verify_commands.split("\n").map(value => value.trim()).filter(Boolean),
        deployment_config: {},
        release_channels: form.release_channels.split("\n").map(value => value.trim()).filter(Boolean),
        context_schema: {},
        protected_paths: form.protected_paths.split("\n").map(value => value.trim()).filter(Boolean),
        risk_policy: {},
      }, token);
      setSurfaces(current => [...current, created].sort((a, b) => a.display_name.localeCompare(b.display_name)));
      show(`${created.display_name} added`);
    } catch (error) {
      show(error instanceof Error ? error.message : "Could not add product surface");
    } finally {
      setSaving(false);
    }
  }

  async function toggleSurface(surface: ProjectSurface) {
    if (!active || isDemo) return;
    try {
      const updated = await updateProjectSurface(active.id, surface.id, { enabled: !surface.enabled }, token);
      setSurfaces(current => current.map(value => value.id === updated.id ? updated : value));
    } catch (error) {
      show(error instanceof Error ? error.message : "Could not update surface");
    }
  }

  function configureDelivery(surface: ProjectSurface) {
    setEditingDelivery(surface.id);
    setDelivery({
      adapter: surface.deployment_config.adapter || "command",
      release_channels: surface.release_channels.join("\n"),
      commands: recipeLines(surface.deployment_config.commands),
      smoke_commands: recipeLines(surface.deployment_config.smoke_commands),
      rollback_commands: recipeLines(surface.deployment_config.rollback_commands),
      expected_url: surface.deployment_config.expected_url || "",
    });
  }

  async function saveDelivery(surface: ProjectSurface) {
    if (!active || isDemo) return;
    setSaving(true);
    try {
      const updated = await updateProjectSurface(active.id, surface.id, {
        release_channels: delivery.release_channels.split("\n").map(value => value.trim()).filter(Boolean),
        deployment_config: {
          adapter: delivery.adapter,
          commands: parseRecipeLines(delivery.commands),
          smoke_commands: parseRecipeLines(delivery.smoke_commands),
          rollback_commands: parseRecipeLines(delivery.rollback_commands),
          expected_url: delivery.expected_url.trim() || null,
        },
      }, token);
      setSurfaces(current => current.map(value => value.id === updated.id ? updated : value));
      setEditingDelivery(null);
      show(`${surface.display_name} release recipe saved`);
    } catch (error) {
      show(error instanceof Error ? error.message : "Could not save release recipe");
    } finally {
      setSaving(false);
    }
  }

  async function createPairingCode() {
    if (isDemo) return;
    try {
      const result = await createRunnerPairingCode(token);
      setPairing(result);
      show("Pairing code created for ten minutes");
    } catch (error) {
      show(error instanceof Error ? error.message : "Could not create pairing code");
    }
  }

  async function revoke(device: RunnerDevice) {
    try {
      await revokeRunnerDevice(device.id, token);
      setDevices(current => current.filter(value => value.id !== device.id));
      show(`${device.name} revoked`);
    } catch (error) {
      show(error instanceof Error ? error.message : "Could not revoke runner");
    }
  }

  return (
    <div>
      <header className="mb-5 flex items-baseline gap-3">
        <h1 className="font-serif text-title text-text">Delivery setup</h1>
        <span className="text-footnote text-text3">{active.name}</span>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
        <div className="flex flex-col gap-5">
          <Section
            title="Product surfaces"
            description="Map every version users can report from. Grova uses these identities to select the right local repository, proof recipe, and release channel. Absolute local paths never leave your Mac."
          >
            {loadingSetup && surfaces.length === 0 ? (
              <div className="space-y-3" aria-label="Loading product surfaces">
                <div className="h-14 bg-bg" />
                <div className="h-14 bg-bg" />
              </div>
            ) : surfaces.length > 0 ? (
              <div className="mb-6">
                {surfaces.map(surface => (
                  <div key={surface.id} className="py-3 border-b border-border last:border-b-0 flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-footnote font-medium text-text">{surface.display_name}</p>
                      <p className="text-micro text-text3 mt-1 truncate">
                        {surface.platform}{surface.repository_remote ? ` · ${surface.repository_remote}` : " · repository not set"}
                      </p>
                    </div>
                    <span className="text-micro text-text3 tabular-nums">{surface.verify_commands.length} checks</span>
                    <button type="button" onClick={() => configureDelivery(surface)} className="text-micro text-text3 hover:text-text cursor-pointer">
                      Configure release
                    </button>
                    <button type="button" onClick={() => void toggleSurface(surface)} className="text-micro text-text3 hover:text-text cursor-pointer">
                      {surface.enabled ? "Disable" : "Enable"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-footnote text-orange mb-5">No surfaces configured. Grova will not dispatch code until the target workspace can be proven.</p>
            )}

            {editingDelivery && (() => {
              const surface = surfaces.find(value => value.id === editingDelivery);
              if (!surface) return null;
              return (
                <div className="mb-6 bg-bg px-4 py-4">
                  <div className="flex items-baseline justify-between gap-3 mb-4">
                    <div>
                      <p className="text-footnote font-medium text-text">Release recipe for {surface.display_name}</p>
                      <p className="text-micro text-text3 mt-1">Commands run locally only after proof passes and you approve release.</p>
                    </div>
                    <button type="button" onClick={() => setEditingDelivery(null)} className="text-micro text-text3 hover:text-text cursor-pointer">Close</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                    <label className="text-footnote text-text2">Adapter
                      <select className={`${inputClass} mt-1`} value={delivery.adapter} onChange={event => setDelivery(current => ({ ...current, adapter: event.target.value as typeof delivery.adapter }))}>
                        <option value="command">Command</option>
                        <option value="vercel">Vercel</option>
                        <option value="cloudflare">Cloudflare</option>
                        <option value="railway">Railway</option>
                        <option value="xcode">Xcode / TestFlight</option>
                      </select>
                    </label>
                    <label className="text-footnote text-text2">Release channels
                      <textarea className={`${inputClass} mt-1 min-h-20`} value={delivery.release_channels} onChange={event => setDelivery(current => ({ ...current, release_channels: event.target.value }))} />
                    </label>
                    <label className="text-footnote text-text2 col-span-full">Deploy commands
                      <textarea className={`${inputClass} mt-1 min-h-24 font-mono text-micro`} value={delivery.commands} placeholder={"preview=npm run deploy:preview\nproduction=npm run deploy"} onChange={event => setDelivery(current => ({ ...current, commands: event.target.value }))} />
                    </label>
                    <label className="text-footnote text-text2 col-span-full">Post-deploy smoke checks
                      <textarea className={`${inputClass} mt-1 min-h-20 font-mono text-micro`} value={delivery.smoke_commands} placeholder="production=npm run smoke:production" onChange={event => setDelivery(current => ({ ...current, smoke_commands: event.target.value }))} />
                    </label>
                    <label className="text-footnote text-text2 col-span-full">Rollback commands
                      <textarea className={`${inputClass} mt-1 min-h-20 font-mono text-micro`} value={delivery.rollback_commands} placeholder="production=npm run rollback" onChange={event => setDelivery(current => ({ ...current, rollback_commands: event.target.value }))} />
                    </label>
                    <label className="text-footnote text-text2 col-span-full">Expected release URL
                      <input className={`${inputClass} mt-1`} value={delivery.expected_url} placeholder="https://app.example.com" onChange={event => setDelivery(current => ({ ...current, expected_url: event.target.value }))} />
                    </label>
                  </div>
                  <button type="button" disabled={saving} onClick={() => void saveDelivery(surface)} className="mt-4 bg-text text-bg rounded-sm px-4 py-2 text-footnote font-medium cursor-pointer disabled:opacity-50">
                    Save release recipe
                  </button>
                </div>
              );
            })()}

            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <label className="text-footnote text-text2">Name
                <input className={`${inputClass} mt-1`} value={form.display_name} onChange={event => setForm(current => ({ ...current, display_name: event.target.value }))} />
              </label>
              <label className="text-footnote text-text2">Stable key
                <input className={`${inputClass} mt-1`} value={form.surface_key} onChange={event => setForm(current => ({ ...current, surface_key: event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") }))} />
              </label>
              <label className="text-footnote text-text2">Platform
                <select className={`${inputClass} mt-1`} value={form.platform} onChange={event => setForm(current => ({ ...current, platform: event.target.value as ProjectSurface["platform"] }))}>
                  <option value="web">Desktop web</option>
                  <option value="mobile_web">Mobile web</option>
                  <option value="ios">iPhone</option>
                  <option value="ipados">iPad</option>
                  <option value="macos">Mac</option>
                  <option value="backend">Backend</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="text-footnote text-text2">Repository remote
                <input className={`${inputClass} mt-1`} value={form.repository_remote} placeholder="git@github.com:org/repo.git" onChange={event => setForm(current => ({ ...current, repository_remote: event.target.value }))} />
              </label>
              <label className="text-footnote text-text2">Relative source root
                <input className={`${inputClass} mt-1`} value={form.source_root} placeholder="frontend" onChange={event => setForm(current => ({ ...current, source_root: event.target.value }))} />
              </label>
              <label className="text-footnote text-text2">Build target or scheme
                <input className={`${inputClass} mt-1`} value={form.build_target} placeholder="TradeOS-Mac" onChange={event => setForm(current => ({ ...current, build_target: event.target.value }))} />
              </label>
              <label className="text-footnote text-text2 col-span-full">Independent verification, one command per line
                <textarea className={`${inputClass} mt-1 min-h-24 font-mono text-micro`} value={form.verify_commands} onChange={event => setForm(current => ({ ...current, verify_commands: event.target.value }))} />
              </label>
              <label className="text-footnote text-text2">Release channels, one per line
                <textarea className={`${inputClass} mt-1 min-h-20`} value={form.release_channels} onChange={event => setForm(current => ({ ...current, release_channels: event.target.value }))} />
              </label>
              <label className="text-footnote text-text2">Protected paths, one per line
                <textarea className={`${inputClass} mt-1 min-h-20`} value={form.protected_paths} onChange={event => setForm(current => ({ ...current, protected_paths: event.target.value }))} />
              </label>
            </div>
            <button type="button" disabled={saving || isDemo} onClick={() => void addSurface()} className="mt-4 bg-text text-bg rounded-sm px-4 py-2 text-footnote font-medium cursor-pointer disabled:opacity-50">
              Add surface
            </button>
          </Section>

          <Section
            title="Local runner"
            description="Pair this account with the Mac that has your repositories, Codex, and Claude Code. Pairing grants job access, not cloud access to your local filesystem."
          >
            {devices.length > 0 && (
              <div className="mb-5">
                {devices.map(device => (
                  <div key={device.id} className="py-3 border-b border-border last:border-b-0 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-footnote font-medium text-text">{device.name}</p>
                      <p className="text-micro text-text3 mt-1">
                        {(device.capabilities.providers || []).join(" + ") || "No provider reported"}
                        {device.last_seen_at ? ` · seen ${new Date(device.last_seen_at).toLocaleString()}` : ""}
                      </p>
                    </div>
                    <button type="button" onClick={() => void revoke(device)} className="text-micro text-red cursor-pointer">Revoke</button>
                  </div>
                ))}
              </div>
            )}
            {pairing ? (
              <div className="bg-bg px-4 py-4">
                <p className="text-footnote text-text2 mb-2">Pair this Mac, then keep the runner listening in the background:</p>
                <code className="block font-mono text-footnote text-text break-all select-all">grova-runner pair --code {pairing.code}</code>
                <code className="block font-mono text-footnote text-text break-all select-all mt-2">grova-runner service-install</code>
                <p className="text-micro text-text3 mt-2">Expires {new Date(pairing.expires_at).toLocaleTimeString()}</p>
              </div>
            ) : (
              <button type="button" disabled={isDemo} onClick={() => void createPairingCode()} className="bg-text text-bg rounded-sm px-4 py-2 text-footnote font-medium cursor-pointer disabled:opacity-50">
                Pair this Mac
              </button>
            )}
          </Section>
        </div>

        <div className="flex flex-col gap-5">
          <Section
            title="Operating rules"
            description="Grova includes these rules in every Change Package. Put your architecture boundaries, protected workflows, test commands, and release constraints here."
          >
            <textarea
              value={context}
              onChange={event => setContext(event.target.value)}
              maxLength={20_000}
              className="w-full min-h-72 bg-bg border border-border rounded-sm px-4 py-3 text-footnote text-text leading-[1.6]"
              placeholder="Product architecture, invariants, protected areas, and release rules…"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-micro text-text3 tabular-nums">{context.length.toLocaleString()} / 20,000</span>
              <button type="button" disabled={saving} onClick={() => void saveContext()} className="bg-text text-bg rounded-sm px-4 py-2 text-footnote font-medium cursor-pointer disabled:opacity-50">
                Save rules
              </button>
            </div>
          </Section>

          <WidgetInstallSection
            mode="developer"
            source={active.source || ""}
            apiKey={active.api_key || ""}
            planTier={active.plan_tier}
            onCopy={message => show(message)}
          />

          <Section
            title="Collection key"
            description="This key routes public feedback into this project. It cannot read the dashboard or authorize code changes."
          >
            <div className="flex items-center gap-3 bg-bg px-3 py-3">
              <code className="font-mono text-micro text-text2 flex-1 break-all">{active.api_key || "No collection key"}</code>
              {active.api_key && (
                <button type="button" onClick={() => void navigator.clipboard.writeText(active.api_key || "").then(() => show("Collection key copied"))} className="text-footnote text-text3 hover:text-text cursor-pointer">
                  Copy
                </button>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
