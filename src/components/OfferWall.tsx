import { RefreshCw } from 'lucide-react';
import { wallUrl, POINTS_PER_OFFER } from '../lib/config';
import type { Tally, Status } from '../lib/useTally';

const statusText: Record<Status, string> = {
  loading: 'Checking your balance…',
  ok: `Each finished survey is worth ${POINTS_PER_OFFER} points once CPAGrip confirms it.`,
  offline: 'Can’t reach the points server, so your balance might be out of date.',
};

export function OfferWall({ tally }: { tally: Tally }) {
  const url = wallUrl(tally.uid);
  return (
    <section id="offers" className="max-w-5xl mx-auto px-5 py-16 border-t border-line">
      <h2 className="text-3xl font-extrabold tracking-tight">The Sovereign Offer Wall (it’s an iframe)</h2>
      <p className="mt-2 text-muted max-w-xl">
        If this appears blank, your ad blocker is performing admirably and ruining my afternoon.{' '}
        <a href={url} target="_blank" rel="noreferrer" className="text-ink underline decoration-accent underline-offset-4 hover:text-accent">
          Open it in its own tab.
        </a>
      </p>

      <iframe
        src={url}
        title="Offer wall"
        className="glass mt-6 w-full h-[560px] rounded-3xl"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
        <span>{statusText[tally.status]}</span>
        <button onClick={tally.refresh} className="btn ml-auto inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-ink">
          <RefreshCw className="w-3.5 h-3.5" /> Did it count?
        </button>
      </div>
    </section>
  );
}
