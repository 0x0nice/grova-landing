const steps = [
  {
    num: "01",
    icon: "💬",
    title: "Customer sends a message",
    desc: "They tap the button on your website, pick a topic \u2014 complaint, compliment, question \u2014 and send in under 30 seconds. No forms. No friction. No CAPTCHA.",
  },
  {
    num: "02",
    icon: "🧠",
    title: "Grova reads it for you",
    desc: "Every message is automatically summarised and categorised. We spot patterns, flag what needs attention, and draft a reply you can send to the customer instantly.",
  },
  {
    num: "03",
    icon: "📬",
    title: "You see what matters",
    desc: "Check in once a week. Plain-English summaries tell you what customers are saying, what\u2019s trending, and what to act on first. No dashboard expertise required.",
  },
];

export function BizHowSection() {
  return (
    <section className="py-[52px]">
      <span className="block text-caption text-text3 tracking-[0.16em] uppercase mb-5">
        How it works
      </span>
      <div className="grid grid-cols-3 border border-border rounded overflow-hidden max-md:grid-cols-1 max-md:[&>*]:border-r-0 max-md:[&>*]:border-b max-md:[&>*]:border-b-border max-md:[&>*:last-child]:border-b-0">
        {steps.map((s) => (
          <div key={s.num} className="bg-bg p-[30px_24px] border-r border-border last:border-r-0 [html[data-theme=light]_&]:bg-surface">
            <div className="font-serif text-[2.2rem] text-orange leading-none mb-3.5 font-normal opacity-30">
              {s.num}
            </div>
            <span className="text-[1.1rem] block mb-3">{s.icon}</span>
            <h3 className="font-serif text-[1rem] font-normal tracking-[-0.01em] mb-[9px] text-text leading-[1.2]">
              {s.title}
            </h3>
            <p className="text-[0.74rem] text-text2 leading-[1.8] font-light">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
