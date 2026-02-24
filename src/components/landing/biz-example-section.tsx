const insights = [
  "3 customers mentioned wait times \u2014 up from 1 last week.",
  "5 compliments this week. Most mentioned the staff by name.",
  "1 catering inquiry needs a follow-up reply.",
];

export function BizExampleSection() {
  return (
    <section className="py-[68px]">
      <div className="grid grid-cols-2 gap-[72px] items-start mb-7 max-md:grid-cols-1 max-md:gap-6">
        <h2 className="font-serif text-[clamp(1.75rem,3.2vw,2.6rem)] font-normal tracking-[-0.025em] leading-[1.1] text-text">
          Like replacing a suggestion box
          <br />
          <em className="text-text2">with an assistant.</em>
        </h2>
        <p className="text-[0.86rem] text-text2 leading-[1.85] font-light pt-1">
          A restaurant, salon, or retail shop that switches from a generic contact form to
          Grova starts hearing from customers in a completely different way.
        </p>
      </div>
      <div className="border border-border rounded overflow-hidden grid grid-cols-2 max-md:grid-cols-1">
        {/* Before */}
        <div className="p-[32px_30px] border-r border-border max-md:border-r-0 max-md:border-b max-md:border-b-border">
          <span className="block text-[0.52rem] tracking-[0.14em] uppercase mb-3.5 font-medium text-text3">
            Without Grova
          </span>
          <h3 className="font-serif text-[1.15rem] mb-3 font-normal text-text leading-[1.2]">
            A generic contact form
          </h3>
          <p className="text-[0.77rem] text-text2 leading-[1.8] font-light">
            Name, email, message, submit. Most customers don&apos;t bother. The ones who do
            leave vague messages — &ldquo;it was fine&rdquo; or &ldquo;fix it&rdquo; — that you don&apos;t know what
            to do with. Nothing tells you what&apos;s actually wrong.
          </p>
        </div>

        {/* After */}
        <div className="p-[32px_30px] bg-surface [html[data-theme=light]_&]:bg-bg2">
          <span className="block text-[0.52rem] tracking-[0.14em] uppercase mb-3.5 font-medium text-orange">
            With Grova
          </span>
          <h3 className="font-serif text-[1.15rem] mb-3 font-normal text-text leading-[1.2]">
            Real insight, every week
          </h3>
          <p className="text-[0.77rem] text-text2 leading-[1.8] font-light">
            Customers tap a button, pick a topic, and send a message in under 30 seconds.
            You get a plain-English weekly digest and AI-drafted replies waiting in your dashboard.
          </p>
          {/* Insight card */}
          <div className="mt-[18px] bg-bg border border-border2 rounded p-[16px_18px] [html[data-theme=light]_&]:bg-surface">
            <span className="block text-micro text-text3 tracking-[0.12em] uppercase mb-3">
              This week&apos;s digest
            </span>
            {insights.map((line, i) => (
              <div key={i} className="flex items-start gap-[9px] text-subheadline text-text2 leading-[1.6] mb-[9px] font-light last:mb-0">
                <span className="w-1.5 h-1.5 rounded-full bg-orange shrink-0 mt-1.5 opacity-70" />
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
