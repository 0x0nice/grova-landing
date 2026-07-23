const steps = [
  { num: "01", stage: "Capture", title: "A user reports what happened", owner: "automatic" },
  { num: "02", stage: "Enrich", title: "Context and console signals are attached", owner: "automatic" },
  { num: "03", stage: "Judge", title: "Grova scores impact and confidence", owner: "automatic" },
  { num: "04", stage: "Decide", title: "The next move is written for you", owner: "review" },
  { num: "05", stage: "Ship", title: "Move the brief into your build loop", owner: "you" },
];

export function PipelineSection() {
  return (
    <section className="py-[58px]" aria-labelledby="pipeline-title">
      <div className="grid grid-cols-[0.85fr_1.15fr] gap-16 items-end mb-8 max-md:grid-cols-1 max-md:gap-4">
        <h2 id="pipeline-title" className="font-serif text-[clamp(2rem,4vw,3.4rem)] leading-[1] text-text">
          A report only matters when it changes the next move.
        </h2>
        <p className="text-[0.88rem] text-text2 leading-[1.75] max-w-[620px] justify-self-end max-md:justify-self-start">
          Collection is only the first step. Grova adds the evidence, judgment, and next action
          that a normal feedback inbox leaves for you to figure out.
        </p>
      </div>

      <ol className="grid grid-cols-5 max-lg:grid-cols-3 max-md:grid-cols-1">
        {steps.map((step) => (
          <li
            key={step.num}
            className="relative flex h-full flex-col py-5 pr-5 max-md:grid max-md:grid-cols-[48px_82px_1fr] max-md:items-baseline max-md:gap-3"
          >
            <span className="text-[0.62rem] text-text3 tracking-[0.12em] block mb-7 max-md:mb-0">
              {step.num}
            </span>
            <span className="font-serif text-[1rem] text-text block mb-2 max-md:mb-0">{step.stage}</span>
            <span className="text-[0.76rem] text-text2 leading-[1.55] block pr-2">{step.title}</span>
            <span className="mt-auto block pt-4 text-[0.68rem] text-orange max-md:col-start-3 max-md:mt-1 max-md:pt-0">
              {step.owner}
            </span>
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-[1fr_1.15fr] gap-12 py-9 border-b border-border max-md:grid-cols-1 max-md:gap-7">
        <div>
          <span className="text-[0.72rem] text-orange block mb-2.5">
            Your operating rules
          </span>
          <p className="font-serif text-[1.35rem] leading-[1.25] text-text mb-3">
            Grova should think like your team does.
          </p>
          <p className="text-[0.82rem] text-text2 leading-[1.75]">
            Define what matters, what can wait, and how a useful build brief should be structured.
          </p>
        </div>
        <blockquote className="bg-surface px-6 py-5 self-center">
          <p className="text-[0.72rem] text-text3 mb-2">Example triage rule</p>
          <p className="font-serif text-[1.12rem] text-text2 leading-[1.55]">
            Surface checkout and mobile bugs immediately. Hold feature requests until the v2
            planning window.
          </p>
        </blockquote>
      </div>
    </section>
  );
}
