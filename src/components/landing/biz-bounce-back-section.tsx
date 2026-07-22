const examples = [
  { type: "Restaurant", offer: "Thanks for sharing. Here’s 10% off your next visit." },
  { type: "Events", offer: "We appreciate the note. Mention this for $50 off your next booking." },
  { type: "Retail", offer: "Thanks for helping us improve. Here’s free shipping next time." },
];

export function BizBounceBackSection() {
  return (
    <section className="py-[68px]" aria-labelledby="bounce-title">
      <div className="grid grid-cols-2 gap-[72px] items-start mb-12 max-md:grid-cols-1 max-md:gap-6">
        <h2 id="bounce-title" className="font-serif text-[clamp(1.75rem,3.2vw,2.6rem)] font-normal tracking-[-0.02em] leading-[1.1] text-text">
          Turn a response into
          <br />
          <span className="text-text2">a reason to return.</span>
        </h2>
        <p className="text-[0.98rem] text-text2 leading-[1.85] font-light pt-1">
          An optional bounce-back offer thanks customers for taking the time. You choose the perk;
          Grova includes it in the acknowledgment after a completed submission.
        </p>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-5 items-center py-6 border-y border-border mb-10 max-md:grid-cols-1 max-md:text-center">
        <span className="text-[0.8rem] text-text2">Customer shares a response</span>
        <span className="text-text3 max-md:rotate-90">→</span>
        <span className="text-[0.8rem] text-accent">Grova sends your thank-you</span>
        <span className="text-text3 max-md:rotate-90">→</span>
        <span className="text-[0.8rem] text-text2">The relationship continues</span>
      </div>

      <div className="border-t border-border">
        {examples.map((example) => (
          <div key={example.type} className="grid grid-cols-[150px_1fr] gap-8 py-5 border-b border-border max-md:grid-cols-1 max-md:gap-2">
            <h3 className="font-serif text-[1.05rem] text-text">{example.type}</h3>
            <p className="font-serif text-[1rem] text-text2 leading-[1.55]">{example.offer}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[0.7rem] text-text3 leading-[1.7] max-w-[600px]">
        Offers are optional. The private feedback channel works without an incentive.
      </p>
    </section>
  );
}
