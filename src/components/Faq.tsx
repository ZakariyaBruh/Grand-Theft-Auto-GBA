import { Reveal } from './Reveal';

const items: [string, string][] = [
  ['What do I get?', 'Nothing. Absolutely zero. Nada. You spend roughly 3 to 5 minutes answering arbitrary questions about auto insurance or shampoo preference, and Zak receives roughly $1.42. It is the purest form of economic altruism ever devised by human civilisation. (You also get Void Points. See above. Don’t get excited.)'],
  ['Is this a scam?', 'How could it be a scam when we are 100% transparent that you receive no goods, services, cryptocurrency, equity or emotional closure? Scams make false promises of wealth. We guarantee genuine, unadulterated emptiness.'],
  ['What actually happens to my survey answers?', 'They are absorbed into the CPAGrip advertising matrix. Somewhere in a suburban corporate park, a junior brand strategist will discover that someone in your postcode might consider switching broadband providers in Q3. Meanwhile, Zak buys a cold brew.'],
  ['Can I get a refund on my time?', 'Time is a strictly non-refundable entropic vector governed by the second law of thermodynamics. Once those 4 minutes of testing Solitaire are gone, they are permanently etched into the tapestry of the cosmos. No chargebacks.'],
  ['Why doesn’t Zak just get a regular 9-to-5?', 'Why sit through 8 consecutive Zoom calls about synergistic Q4 roadmaps when I can build a bespoke obsidian portal that democratises the process of you giving me pocket change?'],
  ['Will this make me wealthy?', 'It will make Zak marginally less broke (an estimated $0.80 to $2.10 per verified conversion). For you, wealth remains a metaphysical state of mind and a warm feeling in your chest. Or heartburn. Hard to say.'],
  ['Can I complete multiple offers in one sitting?', 'Not only can you, our proprietary benevolence protocols (a slider) warmly recommend it. Complete as many as your patience and data plan permit. Zak’s grocery budget is infinite in capacity.'],
  ['Is my personal data safe?', 'We don’t want your personal data. This site stores a random ID and a points total, which is about as thrilling as it sounds. CPAGrip and their advertising sponsors, however, will treat your email address with the intense enthusiasm typical of global ad networks.'],
  ['I got screened out. Where’s my money?', 'There is no money. There was never going to be money. Nobody gets paid for a screen-out, Zak included. Try another one.'],
];

export function Faq() {
  return (
    <section id="faq" className="max-w-5xl mx-auto px-5 py-16 border-t border-line">
      <Reveal><h2 className="text-3xl font-extrabold tracking-tight">Frequently Avoided Questions</h2>
      <p className="mt-2 text-muted max-w-xl">
        Most landing pages bury their motives under legal disclaimers. We prefer candour in high definition. No clicking required.
      </p></Reveal>
      <dl className="mt-10 grid md:grid-cols-2 gap-x-14 gap-y-9">
        {items.map(([q, a], i) => (
          <Reveal key={q} delay={(i % 2) * 0.08} className="grid grid-cols-[2rem_1fr]">
            <span className="font-mono text-sm text-accent pt-1">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <dt className="font-semibold text-lg leading-snug">{q}</dt>
              <dd className="mt-1.5 text-ink/70">{a}</dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
