import { ExternalLink, RefreshCw } from 'lucide-react';
import { Reveal } from './Reveal';
import { Rule } from './Rule';
import { SplitWords } from './SplitWords';
import { wallUrl, POINTS_PER_OFFER } from '../lib/config';
import type { Tally, Status } from '../lib/useTally';

const statusText: Record<Status, string> = {
  loading: 'Checking your balance…',
  ok: `Each finished survey is worth ${POINTS_PER_OFFER} points once CPAGrip confirms it.`,
  offline: 'Our servers have run out of storage',
};

export function OfferWall({ tally }: { tally: Tally }) {
  const url = wallUrl(tally.uid);
  return (
    <section id="offers" className="max-w-5xl mx-auto px-5 pb-16">
      <Rule />
      <Reveal><SplitWords inView text="The Sovereign Offer Wall" className="text-3xl font-extrabold tracking-tight" />
      <p className="mt-2 text-muted max-w-xl">
        Surveys, quizzes and trials, curated by nobody. Tap an offer and it opens in a new tab.
      </p>
      <a href={url} target="_blank" rel="noreferrer" className="btn active:scale-95 mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-ink">
        <ExternalLink className="w-3.5 h-3.5" /> Wall not responding? Open it in its own tab
      </a></Reveal>
      {/* No filter / backdrop-filter / animated transform on the iframe or its ancestors: Safari and iOS stop
          delivering clicks and touches into iframes under those, which made the offers impossible to open. */}
      <iframe
        src={url}
        title="Offer wall"
        className="glass-frame mt-6 w-full h-[640px] rounded-3xl"
      />
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
        <span>{tally.errorMessage || statusText[tally.status]}</span>
        <button onClick={tally.refresh} className="btn active:scale-95 ml-auto inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-ink">
          <RefreshCw className="w-3.5 h-3.5" /> Did it count?
        </button>
      </div>
    </section>
  );
}
