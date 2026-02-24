const features = [
  {
    icon: "🎯",
    title: "Smart triage, out of the box",
    desc: "Grova ships with a battle-tested definition of good feedback. Spam, vague complaints, and noise get filtered automatically — no setup required. It just works.",
  },
  {
    icon: "🧠",
    title: "Teach Grova your standards",
    desc: "You know your product better than anyone. On paid plans, define exactly what great feedback means for your project — your rules, your priorities, your Cursor prompt format. Grova thinks like you do.",
  },
  {
    icon: "⚡",
    title: "Cursor & Claude Code ready",
    desc: "Approved fix briefs are formatted as ready-to-use prompts. Paste into Cursor or Claude Code and implement in minutes.",
  },
  {
    icon: "🧩",
    title: "Two lines to install",
    desc: "Paste a script tag. Your feedback button is live on any site — React, Next.js, plain HTML, anything. No framework lock-in.",
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-[68px]">
      <div className="grid grid-cols-2 gap-[72px] items-start mb-12 max-md:grid-cols-1 max-md:gap-6">
        <h2 className="font-serif text-[clamp(1.75rem,3.2vw,2.6rem)] font-normal tracking-[-0.025em] leading-[1.1] text-text">
          Everything you need.
          <br />
          <em className="text-text2">Nothing you don&apos;t.</em>
        </h2>
        <p className="text-[0.86rem] text-text2 leading-[1.85] font-light pt-1">
          Built for solo developers and indie founders. No enterprise bloat, no seat-based
          pricing, no setup complexity. A tool that respects your time.
        </p>
      </div>
      <div className="grid grid-cols-2 border border-border rounded overflow-hidden max-md:grid-cols-1 max-md:[&>*]:border-r-0 max-md:[&>*]:border-b max-md:[&>*]:border-b-border max-md:[&>*:last-child]:border-b-0">
        {features.map((f, i) => (
          <div
            key={i}
            className={`bg-bg p-[30px_26px] border-r border-border border-b [html[data-theme=light]_&]:bg-surface
              ${i % 2 === 1 ? "border-r-0" : ""}
              ${i >= 2 ? "border-b-0" : ""}
            `}
          >
            <span className="text-[1.05rem] block mb-3.5">{f.icon}</span>
            <h3 className="font-serif text-[1rem] font-normal tracking-[-0.01em] mb-[9px] text-text">
              {f.title}
            </h3>
            <p className="text-[0.75rem] text-text2 leading-[1.8] font-light">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
