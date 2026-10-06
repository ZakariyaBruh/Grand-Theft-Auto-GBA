import { useState } from 'react';
import { DOLLARS_PER_OFFER, MINUTES_PER_OFFER } from '../lib/config';

const equivalency = (n: number) => {
  if (n <= 1) return 'A single shot of cheap Robusta espresso, so Zak may maintain alertness.';
  if (n <= 3) return 'An artisan pour-over utilising single-origin Ethiopian beans. Fancy. He’ll drink it in the car.';
  if (n <= 6) return 'A double guacamole Chipotle burrito bowl, fully loaded. Extra is extra.';
  if (n <= 10) return 'Zak buys a premium SaaS subscription and cancels it 30 seconds later to feel powerful.';
  if (n <= 16) return 'Three miles of high-tensile fluorocarbon fishing line. He does not fish. He has the line.';
  if (n <= 23) return 'Zak’s share of a Spotify family plan, for the first time in his adult life.';
  return 'Half of Zak’s broadband bill, directly enabling faster CSS compilation for future projects.';
};

const rank = (n: number) => {
  if (n <= 4) return 'Casual Altruist';
  if (n <= 10) return 'Sovereign Underwriter';
  if (n <= 18) return 'Demographic Survey Martyr';
  if (n <= 25) return 'Ascended Patron of the Void';
  return 'Economic Cosmic Hero';
};

export function Estimator() {
  const [n, setN] = useState(5);

  return (
    <section id="estimator" className="max-w-5xl mx-auto px-5 py-16 border-t border-line">
      <h2 className="text-3xl font-extrabold tracking-tight">The Time Sacrifice Estimator</h2>
      <p className="mt-2 text-muted max-w-xl">
        Declare how many surveys you are prepared to suffer. Observe your return remain rigidly at zero while Zak ascends the economic ladder. (One rung.)
      </p>

      <div className="mt-8 flex items-baseline justify-between gap-4">
        <label htmlFor="n" className="font-mono text-sm text-muted">Surveys I intend to suffer</label>
        <span className="font-mono text-4xl text-accent tabular-nums">{n}</span>
      </div>
      <input
        id="n"
        type="range"
        min={1}
        max={30}
        value={n}
        onChange={e => setN(Number(e.target.value))}
        className="mt-3 w-full accent-[#e8ff47] cursor-pointer"
      />
      <div className="mt-1 flex justify-between font-mono text-xs text-muted">
        <span>1 (a minor coffee spill)</span><span>30 (cosmic martyr)</span>
      </div>

      <div className="mt-8 grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line border-y border-line">
        <Stat label="Your guaranteed yield" value="$0.00" note="Cash-back rate: strictly 0.00%." />
        <Stat label="Mortal span forfeited" value={`~${Math.round(n * MINUTES_PER_OFFER)} min`} note="Non-refundable. Entropy doesn’t do returns." />
        <Stat label="Bounty gifted to Zak" value={`$${(n * DOLLARS_PER_OFFER).toFixed(2)}`} note="He will not be able to look you in the eye." accent />
      </div>

      <p className="mt-6 text-lg">
        <span className="font-mono text-xs text-muted uppercase tracking-widest mr-3">{rank(n)}</span>
        {equivalency(n)}
      </p>
    </section>
  );
}

function Stat({ label, value, note, accent }: { label: string; value: string; note: string; accent?: boolean }) {
  return (
    <div className="py-5 sm:px-6 first:sm:pl-0 last:sm:pr-0">
      <p className="font-mono text-xs text-muted uppercase tracking-wider">{label}</p>
      <p className={`mt-2 font-mono text-4xl tabular-nums ${accent ? 'text-accent' : ''}`}>{value}</p>
      <p className="mt-2 text-sm text-muted">{note}</p>
    </div>
  );
}
