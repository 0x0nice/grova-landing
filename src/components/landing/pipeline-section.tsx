const steps = [
  { num: "01", icon: "💬", title: "User submits feedback", tag: "auto" as const },
  { num: "02", icon: "🧠", title: "AI triages & scores it", tag: "auto" as const },
  { num: "03", icon: "📋", title: "Cursor-ready prompt written", tag: "auto" as const },
  { num: "04", icon: "📥", title: "Lands in your inbox", tag: "you" as const },
  { num: "05", icon: "⚡", title: "Drop into Cursor", tag: "you" as const },
];

function Tag({ type }: { type: "auto" | "you" }) {
  const cls =
    type === "auto"
      ? "text-orange border-orange/30 bg-orange/[0.07]"
      : "text-accent border-accent/30 bg-accent/[0.07]";
  return (
    <span className={`text-[0.52rem] tracking-[0.09em] uppercase px-1.5 py-[2px] rounded-pill inline-block border ${cls}`}>
      {type}
    </span>
  );
}

export function PipelineSection() {
  return (
    <section className="py-[52px]">
      <span className="block text-caption text-text3 tracking-[0.16em] uppercase mb-5">
        The pipeline
      </span>
      <div className="grid grid-cols-5 border border-border rounded overflow-hidden max-lg:grid-cols-3 max-lg:[&>*:nth-child(3)]:border-r-0 max-lg:[&>*:nth-child(-n+3)]:border-b max-lg:[&>*:nth-child(-n+3)]:border-b-border">
        {steps.map((s) => (
          <div key={s.num} className="p-[18px_14px] border-r border-border last:border-r-0">
            <span className="text-[0.54rem] text-text3 tracking-[0.1em] block mb-2">{s.num}</span>
            <span className="text-[0.9rem] block mb-[7px]">{s.icon}</span>
            <span className="text-footnote text-text font-medium block leading-[1.4] mb-[9px]">{s.title}</span>
            <Tag type={s.tag} />
          </div>
        ))}
      </div>

      {/* Upgrade note */}
      <div className="mt-3 flex items-center gap-2.5 p-[12px_16px] border border-border rounded bg-surface max-md:flex-col max-md:items-start">
        <span className="text-[0.85rem] shrink-0">🔌</span>
        <span className="text-footnote text-text2 leading-[1.5] flex-1">
          Builder plan: skip the inbox entirely — feedback lands directly in a Cursor panel.
          One click sends the prompt to Composer.
        </span>
        <span className="text-[0.52rem] tracking-[0.09em] uppercase px-1.5 py-[2px] rounded-pill border text-orange border-orange/35 bg-orange/[0.07] whitespace-nowrap shrink-0">
          coming soon
        </span>
      </div>

      {/* Custom rules banner */}
      <div className="mt-3 grid grid-cols-2 gap-8 p-7 border border-border rounded bg-surface items-center max-md:grid-cols-1 max-md:gap-5">
        <div>
          <span className="inline-block text-[0.54rem] text-orange tracking-[0.12em] uppercase mb-2.5">
            Paid plans
          </span>
          <span className="block font-serif text-title text-text tracking-[-0.02em] leading-[1.15] mb-2.5">
            You know your project best.
          </span>
          <span className="block text-[0.74rem] text-text2 leading-[1.8] font-light">
            Tell Grova what great feedback means for your product. Set your own triage rules,
            define your priorities, and customise how your Cursor prompts are structured.
            Your standards, your workflow.
          </span>
        </div>
        <div className="bg-bg border border-border2 rounded p-[16px_18px] dark:bg-bg light:bg-bg2">
          <span className="block text-[0.54rem] text-orange tracking-[0.1em] uppercase mb-2">
            Your triage rule
          </span>
          <span className="block text-subheadline text-text2 leading-[1.7] italic">
            &ldquo;Only surface bugs that affect the checkout flow or mobile users.
            Ignore feature requests until v2.&rdquo;
          </span>
        </div>
      </div>
    </section>
  );
}
