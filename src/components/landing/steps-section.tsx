const steps = [
  {
    badge: "Set up once",
    num: "01",
    title: "Place the capture point",
    desc: "Add one script tag, then set the plain-English rule Grova should use to distinguish a useful signal from noise.",
  },
  {
    badge: "Runs continuously",
    num: "02",
    title: "Let evidence accumulate",
    desc: "Every submission is enriched, scored, and grouped with related signals. Weak reports stay quiet; material ones rise.",
  },
  {
    badge: "You keep control",
    num: "03",
    title: "Make the call",
    desc: "Review the ranked brief, resolve or dismiss it, and move approved work into the editor or issue tracker you already use.",
  },
];

export function StepsSection() {
  return (
    <section className="py-[72px]" aria-labelledby="steps-title">
      <div className="grid grid-cols-2 gap-[72px] items-start mb-12 max-md:grid-cols-1 max-md:gap-6">
        <h2 id="steps-title" className="font-serif text-[clamp(1.75rem,3.2vw,2.6rem)] font-normal tracking-[-0.02em] leading-[1.1] text-text">
          Kill the noise.
          <br />
          <span className="text-text2">Protect the build loop.</span>
        </h2>
        <p className="text-[0.98rem] text-text2 leading-[1.85] font-light pt-1">
          A feedback tool earns its place when it reduces decisions, not when it creates another
          queue to maintain. Grova is built around that constraint.
        </p>
      </div>

      <ol className="border-t border-border">
        {steps.map((step) => (
          <li
            key={step.num}
            className="grid grid-cols-[72px_220px_1fr] gap-8 py-7 border-b border-border items-start max-md:grid-cols-[46px_1fr] max-md:gap-x-4 max-md:gap-y-2"
          >
            <span className="font-serif text-[1.8rem] text-text3 leading-none">{step.num}</span>
            <div>
              <span className="text-[0.68rem] text-orange block mb-2">
                {step.badge}
              </span>
              <h3 className="font-serif text-[1.12rem] text-text leading-[1.2]">{step.title}</h3>
            </div>
            <p className="text-[0.86rem] text-text2 leading-[1.75] max-md:col-start-2">{step.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
