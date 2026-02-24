const steps = [
  {
    badge: "once",
    num: "01",
    title: "Drop in the widget",
    desc: "One script tag on any site. Your users get a feedback button. Set plain-English triage rules for what good feedback looks like.",
  },
  {
    badge: "automatic",
    num: "02",
    title: "AI triages everything",
    desc: "Every submission is scored 1\u201310, categorised, and filtered. Spam and noise gets dropped. Real issues get a structured fix brief written up.",
  },
  {
    badge: "your call",
    num: "03",
    title: "Approve. Then build.",
    desc: "A clean inbox ranked by priority. Approve an item and the fix brief is ready to paste into Cursor or Claude Code. Done in minutes.",
  },
];

export function StepsSection() {
  return (
    <section className="py-[68px]">
      <div className="grid grid-cols-2 gap-[72px] items-start mb-12 max-md:grid-cols-1 max-md:gap-6">
        <h2 className="font-serif text-[clamp(1.75rem,3.2vw,2.6rem)] font-normal tracking-[-0.025em] leading-[1.1] text-text">
          Kill the noise.
          <br />
          <em className="text-text2">Ship what matters.</em>
        </h2>
        <p className="text-[0.86rem] text-text2 leading-[1.85] font-light pt-1">
          Most feedback is junk. Vague complaints, duplicate requests, one-off edge cases.
          Grova filters automatically so only real, actionable issues reach you — pre-scored
          and ready to act on.
        </p>
      </div>
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
