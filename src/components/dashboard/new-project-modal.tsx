"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { useProjectStore } from "@/stores/project-store";

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewProjectModal({ open, onClose }: NewProjectModalProps) {
  const [name, setName] = useState("");
  const [mode, setMode] = useState("developer");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { session, isDemo } = useAuth();
  const createProject = useProjectStore((s) => s.createProject);
  const router = useRouter();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setLoading(true);

    try {
      const project = await createProject(
        { name: name.trim(), mode, source: source.trim() },
        session?.access_token || ""
      );
      setName("");
      setMode("developer");
      setSource("");
      onClose();
      const defaultView =
        project.mode === "developer" ? "inbox" : "overview";
      const params = isDemo ? "?demo" : "";
      router.push(`/dashboard/${defaultView}${params}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create project."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Project">
      <form onSubmit={handleCreate} className="flex flex-col gap-4">
        <Input
          id="np-name"
          label="Name"
          placeholder="My Project"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Select
          id="np-mode"
          label="Mode"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="developer">Developer</option>
          <option value="business">Business</option>
        </Select>

        <Input
          id="np-source"
          label="Source"
          placeholder="myapp.com"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />

        {error && (
          <p
            role="alert"
            className="font-mono text-footnote text-red leading-[1.6]"
          >
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2">
          <Button
            type="button"
            variant="restore"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" variant="approve" loading={loading}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
