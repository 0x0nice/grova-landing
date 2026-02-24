"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { EmailTemplate } from "@/lib/templates";
import { renderTemplate } from "@/lib/templates";

interface ActionPreviewModalProps {
  open: boolean;
  onClose: () => void;
  template: EmailTemplate;
  variables: Record<string, string>;
}

export function ActionPreviewModal({
  open,
  onClose,
  template,
  variables,
}: ActionPreviewModalProps) {
  const [subject, setSubject] = useState(() =>
    renderTemplate(template.subject, variables)
  );
  const [body, setBody] = useState(() =>
    renderTemplate(template.body, variables)
  );
  const { show } = useToast();

  function handleCopy() {
    const text = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(text).then(() => {
      show("Copied to clipboard");
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={template.name} maxWidth="560px">
      <div className="flex flex-col gap-4">
        <div>
          <label className="block font-mono text-micro text-text3 uppercase tracking-[0.12em] mb-1.5">
            Subject
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-bg2 border border-border rounded px-3 py-2
                       font-mono text-footnote text-text
                       focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div>
          <label className="block font-mono text-micro text-text3 uppercase tracking-[0.12em] mb-1.5">
            Body
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="w-full bg-bg2 border border-border rounded px-3 py-2
                       font-mono text-footnote text-text leading-[1.7]
                       focus:outline-none focus:border-accent transition-colors resize-y"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="restore" onClick={onClose}>
            Close
          </Button>
          <Button variant="copy" onClick={handleCopy}>
            Copy to clipboard
          </Button>
        </div>
      </div>
    </Modal>
  );
}
