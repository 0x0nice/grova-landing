const features = [
  {
    icon: "🎯",
    title: "Guided, not blank",
    desc: "Customers pick from topics you set \u2014 complaint, compliment, question, catering inquiry. No more \u201Cother\u201D or vague messages. You get structured, useful feedback every time.",
  },
  {
    icon: "📊",
    title: "Plain-English weekly digest",
    desc: "\u201C4 customers mentioned wait times this week, up from 1 last week.\u201D No charts to decode. No jargon to untangle. Just what your customers are actually saying.",
  },
  {
    icon: "💡",
    title: "Suggested replies, ready to send",
    desc: "For every customer message, Grova drafts a clear, professional reply. Copy it. Send it. Done in seconds. Feels personal, takes no effort.",
  },
];

export function BizFeaturesSection() {
  return (
    <section className="py-[68px]">
      <div className="grid grid-cols-2 gap-[72px] items-start mb-12 max-md:grid-cols-1 max-md:gap-6">
        <h2 className="font-serif text-[clamp(1.75rem,3.2vw,2.6rem)] font-normal tracking-[-0.025em] leading-[1.1] text-text">
          Feedback that tells you something.
          <br />
          <em className="text-text2">Not just noise.</em>
        </h2>
        <p className="text-[0.86rem] text-text2 leading-[1.85] font-light pt-1">
          Most contact forms produce vague messages that go nowhere. Grova gives your customers
          a better way to communicate — and turns their messages into something you can actually act on.
        </p>
      </div>
      <div className="grid grid-cols-3 border border-border rounded overflow-hidden max-md:grid-cols-1 max-md:[&>*]:border-r-0 max-md:[&>*]:border-b max-md:[&>*]:border-b-border max-md:[&>*:last-child]:border-b-0">
        {features.map((f, i) => (
          <div key={i} className="bg-bg p-[30px_26px] border-r border-border last:border-r-0 [html[data-theme=light]_&]:bg-surface">
            <span className="text-[1.1rem] block mb-3.5">{f.icon}</span>
            <h3 className="font-serif text-[1rem] font-normal tracking-[-0.01em] mb-[9px] text-text">
              {f.title}
            </h3>
            <p className="text-[0.75rem] text-text2 leading-[1.8] font-light">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
