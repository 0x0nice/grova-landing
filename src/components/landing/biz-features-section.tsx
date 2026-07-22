const features = [
  ["Signal", "Noise filtered automatically", "Weak or abusive responses stay out of the operating queue."],
  ["Patterns", "Themes across responses", "Related feedback is grouped so repeat issues become visible early."],
  ["Action", "Specific next steps", "High-value signals can produce a reply, escalation, or follow-up."],
  ["Channels", "Widget, QR, and direct link", "Collect online, on location, or from a message you already send."],
  ["Recovery", "Optional bounce-back offers", "Thank customers with a perk you control after they respond."],
  ["Privacy", "A direct channel", "Customers can tell you privately before frustration becomes a public review."],
] as const;

export function BizFeaturesSection() {
  return (
    <section className="py-[68px]" aria-labelledby="biz-features-title">
      <div className="grid grid-cols-2 gap-[72px] items-start mb-12 max-md:grid-cols-1 max-md:gap-6">
        <h2 id="biz-features-title" className="font-serif text-[clamp(1.75rem,3.2vw,2.6rem)] font-normal tracking-[-0.02em] leading-[1.1] text-text">
          Enough structure.
          <br />
          <span className="text-text2">No analyst required.</span>
        </h2>
        <p className="text-[0.94rem] text-text2 leading-[1.85] font-light pt-1">
          Built for operators who need a reliable listening system, not another dashboard that
          demands attention every morning.
        </p>
      </div>
      <dl className="grid grid-cols-2 border-y border-border max-md:grid-cols-1">
        {features.map(([label, title, description], index) => (
          <div key={label} className={`py-7 ${index % 2 === 0 ? "pr-10 border-r border-border" : "pl-10"} ${index < features.length - 2 ? "border-b border-border" : ""} max-md:px-0 max-md:border-r-0 max-md:border-b max-md:last:border-b-0`}>
            <dt>
              <span className="text-[0.7rem] text-accent block mb-3">{label}</span>
              <span className="font-serif text-[1.15rem] text-text block mb-2">{title}</span>
            </dt>
            <dd className="text-[0.8rem] text-text2 leading-[1.75]">{description}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
