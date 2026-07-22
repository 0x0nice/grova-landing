const features = [
  {
    label: "Signal",
    title: "Useful by default",
    desc: "Opinionated triage catches spam, vague complaints, and low-evidence reports before they become your problem.",
  },
  {
    label: "Control",
    title: "Adjustable to your product",
    desc: "Define the surfaces, customers, and failure modes that should change how Grova ranks incoming work.",
  },
  {
    label: "Output",
    title: "Written for implementation",
    desc: "Approved decisions preserve the report, environment, likely cause, and recommended next move in one build-ready brief.",
  },
  {
    label: "Install",
    title: "A small footprint",
    desc: "One framework-agnostic script works across React, Next.js, and plain HTML without taking over your product surface.",
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-[72px]" aria-labelledby="features-title">
      <div className="mb-12 max-w-[760px]">
        <h2 id="features-title" className="font-serif text-[clamp(2rem,4.5vw,3.8rem)] font-normal tracking-[-0.025em] leading-[1] text-text mb-5">
          Four constraints keep the system useful.
        </h2>
        <p className="text-[0.92rem] text-text2 leading-[1.8] max-w-[620px]">
          Designed for small product teams that need leverage: no seat maze, no taxonomy project,
          and no month-long rollout before the first useful decision.
        </p>
      </div>

      <dl className="grid grid-cols-2 border-y border-border max-md:grid-cols-1">
        {features.map((feature, index) => (
          <div
            key={feature.label}
            className={`py-7 ${index % 2 === 0 ? "pr-10 border-r border-border" : "pl-10"} ${index < 2 ? "border-b border-border" : ""} max-md:px-0 max-md:border-r-0 max-md:border-b max-md:last:border-b-0`}
          >
            <dt>
              <span className="text-[0.7rem] text-orange block mb-3">
                {feature.label}
              </span>
              <span className="font-serif text-[1.15rem] text-text block mb-2">{feature.title}</span>
            </dt>
            <dd className="text-[0.8rem] text-text2 leading-[1.75]">{feature.desc}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
