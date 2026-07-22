const steps = [
  {
    badge: "Set up once",
    num: "01",
    title: "Open the right channels",
    desc: "Place the widget online and a printable QR code where customers already are. No app or customer account is required.",
  },
  {
    badge: "Runs continuously",
    num: "02",
    title: "Let Grova connect the signal",
    desc: "Responses are categorized, filtered, and grouped so repeated concerns rise above one-off noise.",
  },
  {
    badge: "You keep control",
    num: "03",
    title: "Act with context",
    desc: "Review the ranked inbox and trends, then reply, resolve, or create a follow-up without losing the original evidence.",
  },
];

export function BizThreeStepsSection() {
  return (
    <section className="py-[68px]" aria-label="Three-step setup">
      <ol className="border-t border-border">
        {steps.map((step) => (
          <li key={step.num} className="grid grid-cols-[72px_220px_1fr] gap-8 py-7 border-b border-border items-start max-md:grid-cols-[46px_1fr] max-md:gap-x-4 max-md:gap-y-2">
            <span className="font-serif text-[1.8rem] text-text3 leading-none">{step.num}</span>
            <div>
              <span className="text-[0.68rem] text-accent block mb-2">{step.badge}</span>
              <h3 className="font-serif text-[1.12rem] text-text leading-[1.2]">{step.title}</h3>
            </div>
            <p className="text-[0.86rem] text-text2 leading-[1.75] max-md:col-start-2">{step.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
