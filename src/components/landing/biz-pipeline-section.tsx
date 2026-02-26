const steps = [
  {
    num: "01",
    icon: "💬",
    title: "Customers share feedback",
    desc: "Through a widget on your website, a QR code at your register, or a simple link you share. Easy for them, automatic for you.",
    tag: "auto" as const,
  },
  {
    num: "02",
    icon: "🧠",
    title: "AI reads and scores it",
    desc: "Every submission is analyzed for urgency, theme, and sentiment. Spam and noise get dropped automatically.",
    tag: "auto" as const,
  },
  {
    num: "03",
    icon: "📊",
    title: "Patterns get surfaced",
    desc: "Grova spots trends across submissions — \"3 people mentioned slow service on Fridays\" — so you see what matters.",
    tag: "auto" as const,
  },
  {
    num: "04",
    icon: "📥",
    title: "A brief lands in your inbox",
    desc: "A clear, plain-English summary of what needs attention, what\u2019s improving, and what customers are saying. Weekly or as issues arise.",
    tag: "auto" as const,
  },
  {
    num: "05",
    icon: "✅",
    title: "You decide what to act on",
    desc: "No pressure. Review the brief, handle what makes sense, ignore what doesn\u2019t. You stay in control.",
    tag: "you" as const,
  },
];

function Tag({ type }: { type: "auto" | "you" }) {
  const cls =
    type === "auto"
      ? "text-accent border-accent/30 bg-accent/[0.07]"
      : "text-orange border-orange/30 bg-orange/[0.07]";
  return (
    <span className={`text-[0.52rem] tracking-[0.09em] uppercase px-1.5 py-[2px] rounded-pill inline-block border ${cls}`}>
      {type}
    </span>
  );
}

export function BizPipelineSection() {
  return (
    <section className="py-[52px]" id="pipeline">
      <span className="block text-caption text-text3 tracking-[0.16em] uppercase mb-5">
        How it works
      </span>
      <div className="grid grid-cols-5 border border-border rounded overflow-hidden max-lg:grid-cols-3 max-lg:[&>*:nth-child(3)]:border-r-0 max-lg:[&>*:nth-child(-n+3)]:border-b max-lg:[&>*:nth-child(-n+3)]:border-b-border max-md:grid-cols-1 max-md:[&>*]:border-r-0 max-md:[&>*]:border-b max-md:[&>*]:border-b-border max-md:[&>*:last-child]:border-b-0">
        {steps.map((s) => (
          <div key={s.num} className="p-[18px_14px] border-r border-border last:border-r-0">
            <span className="text-[0.54rem] text-text3 tracking-[0.1em] block mb-2">{s.num}</span>
            <span className="text-[0.9rem] block mb-[7px]">{s.icon}</span>
            <span className="text-footnote text-text font-medium block leading-[1.4] mb-1.5">{s.title}</span>
            <p className="text-[0.66rem] text-text2 leading-[1.7] font-light mb-[9px]">{s.desc}</p>
            <Tag type={s.tag} />
          </div>
        ))}
      </div>
    </section>
  );
}
