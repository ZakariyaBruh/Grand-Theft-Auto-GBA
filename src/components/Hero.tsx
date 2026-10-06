import { DOLLARS_PER_OFFER, MINUTES_PER_OFFER } from '../lib/config';

const steps = [
  ['1', 'Pick an offer', 'Survey, quiz or app trial.'],
  ['2', 'Finish it', `About ${MINUTES_PER_OFFER} minutes.`],
  ['3', 'Tap “I did one”', 'Log it for points and perks.'],
];

export function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-5 pt-14 pb-12 md:pt-24 md:pb-16">
      <h1 className="font-serif text-4xl sm:text-6xl leading-[1.05] max-w-3xl">
        You do a survey. Zak gets about ${DOLLARS_PER_OFFER.toFixed(2)}.
      </h1>
      <p className="mt-5 text-lg text-muted max-w-xl">
        You get no money. You do get a points tally and a few small tools that make surveys less annoying.
      </p>
      <a
        href="#offers"
        className="mt-8 inline-block rounded-md bg-ink text-paper px-6 py-3 font-medium hover:bg-accent transition-colors"
      >
        See offers
      </a>

      <ol className="mt-14 grid sm:grid-cols-3 gap-4">
        {steps.map(([n, title, sub]) => (
          <li key={n} className="flex gap-3 border-t border-line pt-4">
            <span className="font-serif text-2xl text-accent leading-none">{n}</span>
            <div>
              <p className="font-medium">{title}</p>
              <p className="text-sm text-muted">{sub}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
