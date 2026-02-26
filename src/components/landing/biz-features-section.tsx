const features = [
  {
    icon: "🎯",
    title: "Noise filtered automatically",
    desc: "Grova ships knowing what good feedback looks like. Spam, vague complaints, and unhelpful rants get filtered on day one — no setup required.",
  },
  {
    icon: "📊",
    title: "Patterns, not just complaints",
    desc: "Individual feedback is useful. Patterns are powerful. Grova groups related submissions and surfaces trends — \u201Cmultiple customers mentioned parking this month\u201D — so you can spot real issues early.",
  },
  {
    icon: "💡",
    title: "Smart Actions",
    desc: "When Grova spots something that needs attention, it doesn\u2019t just flag it — it suggests what to do. Practical, specific next steps based on what your customers are actually saying.",
  },
  {
    icon: "📬",
    title: "Weekly intelligence brief",
    desc: "Every week, a summary lands in your inbox: what\u2019s improving, what\u2019s slipping, what customers are asking for, and where to focus. Like having a customer experience analyst on staff — for $19/month.",
  },
  {
    icon: "🔁",
    title: "Bounce-Back Offers",
    desc: "Automatically reward customers for their honesty with a perk you choose. Turn every piece of feedback into a reason to come back.",
  },
  {
    icon: "📱",
    title: "QR codes, built in",
    desc: "Every project gets a printable QR code that links straight to your feedback form. Put it on receipts, table cards, checkout counters, invoices — wherever your customers are.",
  },
  {
    icon: "🧩",
    title: "Works on any website",
    desc: "Squarespace, Wix, WordPress, custom — doesn\u2019t matter. One small script tag and you\u2019re live. No developer needed.",
  },
  {
    icon: "🔒",
    title: "A private channel",
    desc: "Your widget and QR code give customers a way to share honest feedback directly with you — not the public internet. The things people won\u2019t say out loud, Grova catches.",
  },
  {
    icon: "⏱️",
    title: "30 seconds, start to finish",
    desc: "No app to download. No account to create. Customers tap your QR code or click the widget, share a thought, and they\u2019re done. The easier you make it, the more you hear.",
  },
];

export function BizFeaturesSection() {
  return (
    <section className="py-[68px]">
      <div className="grid grid-cols-2 gap-[72px] items-start mb-12 max-md:grid-cols-1 max-md:gap-6">
        <h2 className="font-serif text-[clamp(1.75rem,3.2vw,2.6rem)] font-normal tracking-[-0.025em] leading-[1.1] text-text">
          Everything you need.
          <br />
          <em className="text-text2">Nothing you don&apos;t.</em>
        </h2>
        <p className="text-[0.86rem] text-text2 leading-[1.85] font-light pt-1">
          Built for business owners who&apos;d rather run their business than stare
          at analytics dashboards. No jargon, no complexity, no enterprise
          nonsense.
        </p>
      </div>
      <div className="grid grid-cols-3 border border-border rounded overflow-hidden max-md:grid-cols-1 max-md:[&>*]:border-r-0 max-md:[&>*]:border-b max-md:[&>*]:border-b-border max-md:[&>*:last-child]:border-b-0">
        {features.map((f, i) => (
          <div
            key={i}
            className={`bg-bg p-[30px_26px] border-r border-border border-b border-b-border [html[data-theme=light]_&]:bg-surface
              ${(i + 1) % 3 === 0 ? "border-r-0" : ""}
              ${i >= 6 ? "border-b-0" : ""}
            `}
          >
            <span className="text-[1.05rem] block mb-3.5">{f.icon}</span>
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
