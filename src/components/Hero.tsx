import { DOLLARS_PER_OFFER } from '../lib/config';
import type { Tally } from '../lib/useTally';
import { Receipt } from './Receipt';

export function Hero({ tally }: { tally: Tally }) {
  return (
    <section className="max-w-5xl mx-auto px-5 pt-10 pb-20 md:pt-20 grid md:grid-cols-[1fr_auto] gap-14 items-start">
      <div>
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[0.95]">
          I’m Zak.<br />I need ${DOLLARS_PER_OFFER.toFixed(2)}.
        </h1>
        <p className="mt-6 text-xl text-ink/80 max-w-lg">
          Complete one survey and CPAGrip remits that sum to me. You receive nothing. I’ve reviewed this arrangement at length and I’m pretty comfortable with it.
        </p>

        <ol className="mt-10 space-y-3 max-w-md text-lg">
          <li className="grid grid-cols-[1.5rem_1fr]"><span className="font-mono text-accent">1</span><span>Select an offer below. Any offer. Don’t overthink it.</span></li>
          <li className="grid grid-cols-[1.5rem_1fr]"><span className="font-mono text-accent">2</span><span>Complete it. Roughly four minutes, one of which concerns your car insurance.</span></li>
          <li className="grid grid-cols-[1.5rem_1fr]"><span className="font-mono text-accent">3</span><span>Await fifteen seconds. Your Void Points materialise unprompted. I cannot fake them. I looked into it.</span></li>
        </ol>

        <a href="#offers" className="btn mt-10 inline-block rounded-full px-7 py-3 font-semibold">
          Fine, show me the surveys
        </a>
      </div>

      <div className="md:pt-4"><Receipt tally={tally} /></div>
    </section>
  );
}
