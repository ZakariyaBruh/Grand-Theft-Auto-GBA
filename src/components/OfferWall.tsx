import { RefreshCw } from 'lucide-react';
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
        Surveys, quizzes and trials, curated by nobody. Prefer a bigger window?{' '}
        <a href={url} target="_blank" rel="noreferrer" className="text-ink underline decoration-accent underline-offset-4 hover:text-accent">
          Open it in its own tab.
        </a>
      </p></Reveal>      <Reveal delay={0.1}><iframe
        src={url}
        title="Offer wall"
        className="glass mt-6 w-full h-[640px] rounded-3xl"
      /></Reveal>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
        <span>{tally.errorMessage || statusText[tally.status]}</span>
        <button onClick={tally.refresh} className="btn active:scale-95 ml-auto inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-ink">
          <RefreshCw className="w-3.5 h-3.5" /> Did it count?
        </button>
      </div>
    </section>
  );
}
