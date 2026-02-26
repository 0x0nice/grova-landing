const examples = [
  {
    icon: "🍽️",
    type: "Restaurant",
    offer: "\u201CThanks for sharing — here\u2019s 10% off your next visit.\u201D",
  },
  {
    icon: "🎧",
    type: "DJ / Events",
    offer: "\u201CAppreciate the feedback — mention this for $50 off your next booking.\u201D",
  },
  {
    icon: "🛍️",
    type: "Retail",
    offer: "\u201CThanks for helping us improve — here\u2019s free shipping on your next order.\u201D",
  },
];

export function BizBounceBackSection() {
  return (
    <section className="py-[68px]">
      {/* Heading */}
      <div className="grid grid-cols-2 gap-[72px] items-start mb-12 max-md:grid-cols-1 max-md:gap-6">
        <h2 className="font-serif text-[clamp(1.75rem,3.2vw,2.6rem)] font-normal tracking-[-0.025em] leading-[1.1] text-text">
          Turn feedback into
          <br />
          <em className="text-text2">repeat customers.</em>
        </h2>
        <p className="text-[0.86rem] text-text2 leading-[1.85] font-light pt-1">
          When a customer takes time to share honest feedback, reward them —
          automatically. Set up a Bounce-Back Offer and every submission gets a
          thank-you with a perk you choose. Your customers feel heard. You get
          real insights and a reason for them to come back.
        </p>
      </div>

      {/* Flow visual */}
      <div className="flex items-center justify-center gap-3 mb-10 p-5 border border-border rounded bg-surface max-md:flex-col [html[data-theme=light]_&]:bg-bg2">
        <span className="text-[0.72rem] text-text2 font-light text-center">Customer submits feedback</span>
        <span className="text-text3 max-md:rotate-90">→</span>
        <span className="text-[0.72rem] text-accent font-medium text-center">Grova delivers your thank-you + offer</span>
        <span className="text-text3 max-md:rotate-90">→</span>
        <span className="text-[0.72rem] text-text2 font-light text-center">Customer returns</span>
      </div>

      {/* Example cards */}
      <div className="grid grid-cols-3 border border-border rounded overflow-hidden max-md:grid-cols-1 max-md:[&>*]:border-r-0 max-md:[&>*]:border-b max-md:[&>*]:border-b-border max-md:[&>*:last-child]:border-b-0">
        {examples.map((e, i) => (
          <div key={i} className="bg-bg p-[30px_26px] border-r border-border last:border-r-0 [html[data-theme=light]_&]:bg-surface">
            <span className="text-[1.1rem] block mb-3.5">{e.icon}</span>
            <h3 className="font-serif text-[1rem] font-normal tracking-[-0.01em] mb-[9px] text-text">
              {e.type}
            </h3>
            <p className="text-[0.75rem] text-text2 leading-[1.8] font-light italic">{e.offer}</p>
          </div>
        ))}
      </div>

      {/* Small print */}
      <p className="mt-4 text-[0.62rem] text-text3 leading-[1.7] max-w-[600px]">
        You set the offer. Grova delivers it. Fully optional — works great
        without incentives too. Customers want to be heard; the perk is just a bonus.
      </p>
    </section>
  );
}
