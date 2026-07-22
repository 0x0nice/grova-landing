const steps = [
  { num: "01", stage: "Invite", title: "Customers get a private, low-friction channel", owner: "automatic" },
  { num: "02", stage: "Read", title: "Each response is scored for urgency and theme", owner: "automatic" },
  { num: "03", stage: "Connect", title: "Repeated signals become visible patterns", owner: "automatic" },
  { num: "04", stage: "Brief", title: "The important changes arrive in plain English", owner: "automatic" },
  { num: "05", stage: "Act", title: "You choose what the business does next", owner: "you" },
];

export function BizPipelineSection() {
  return (
    <section className="py-[58px]" id="pipeline" aria-labelledby="biz-pipeline-title">
      <div className="grid grid-cols-[0.85fr_1.15fr] gap-16 items-end mb-8 max-md:grid-cols-1 max-md:gap-4">
        <h2 id="biz-pipeline-title" className="font-serif text-[clamp(2rem,4vw,3.4rem)] leading-[1] text-text">
          Listening becomes useful when the loop closes.
        </h2>
        <p className="text-[0.88rem] text-text2 leading-[1.75] max-w-[620px] justify-self-end max-md:justify-self-start">
          Grova collects the response, connects it to related feedback, and turns it into a
          decision without asking you to become an analyst.
        </p>
      </div>
      <ol className="grid grid-cols-5 border-y border-border max-lg:grid-cols-3 max-md:grid-cols-1">
        {steps.map((step) => (
          <li key={step.num} className="py-5 pr-5 border-r border-border last:border-r-0 max-md:border-r-0 max-md:border-b max-md:last:border-b-0 max-md:grid max-md:grid-cols-[48px_82px_1fr] max-md:items-baseline max-md:gap-3">
            <span className="text-[0.62rem] text-text3 tracking-[0.12em] block mb-7 max-md:mb-0">{step.num}</span>
            <span className="font-serif text-[1rem] text-text block mb-2 max-md:mb-0">{step.stage}</span>
            <span className="text-[0.76rem] text-text2 leading-[1.55] block pr-2">{step.title}</span>
            <span className="text-[0.68rem] text-accent block mt-4 max-md:col-start-3 max-md:mt-1">{step.owner}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
