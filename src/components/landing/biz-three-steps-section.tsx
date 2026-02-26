const steps = [
  {
    badge: "once",
    num: "01",
    title: "Set up your feedback channels",
    desc: "Add a widget to your website and grab a printable QR code for your register, receipts, or table cards. Give customers an easy, private way to tell you what they think. Five minutes and you\u2019re live.",
  },
  {
    badge: "automatic",
    num: "02",
    title: "AI handles the rest",
    desc: "Every submission is scored, categorized, and filtered. Spam, rants, and one-off gripes get quietly dropped. Real, actionable feedback gets flagged and grouped by theme.",
  },
  {
    badge: "your call",
    num: "03",
    title: "Act on what matters",
    desc: "A clean inbox ranked by priority. Or just wait for the weekly brief — a plain-English summary of what your customers are telling you, what\u2019s trending, and what to do about it.",
  },
];

export function BizThreeStepsSection() {
  return (
    <section className="py-[68px]">
      <div className="grid grid-cols-3 border border-border rounded overflow-hidden max-md:grid-cols-1 max-md:[&>*]:border-r-0 max-md:[&>*]:border-b max-md:[&>*]:border-b-border max-md:[&>*:last-child]:border-b-0">
        {steps.map((s) => (
          <div key={s.num} className="bg-bg p-[28px_22px] border-r border-border last:border-r-0 [html[data-theme=light]_&]:bg-surface">
            <span className="text-[0.54rem] text-accent tracking-[0.12em] uppercase block mb-3">
              {s.badge}
            </span>
            <div className="font-serif text-[2.4rem] text-text leading-none mb-4 font-normal opacity-15">
              {s.num}
            </div>
            <h3 className="font-serif text-[1.05rem] font-normal tracking-[-0.01em] mb-2.5 text-text leading-[1.2]">
              {s.title}
            </h3>
            <p className="text-[0.75rem] text-text2 leading-[1.8] font-light">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
