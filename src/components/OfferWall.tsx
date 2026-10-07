import { RefreshCw } from 'lucide-react';
import { Reveal } from './Reveal';
import { Rule } from './Rule';
import { SplitWords } from './SplitWords';
import { CPX_APP_ID, wallUrl, POINTS_PER_OFFER } from '../lib/config';
import type { Tally, Status } from '../lib/useTally';

const statusText: Record<Status, string> = {
  loading: 'Checking your balance…',
  ok: `Each finished survey is worth ${POINTS_PER_OFFER} points once CPX Research confirms it.`,
  offline: 'Can’t reach the points server, so your balance might be out of date.',
};

export function OfferWall({ tally }: { tally: Tally }) {
  const configured = CPX_APP_ID !== '';
  const url = wallUrl(tally.uid);
  return (
    <section id="offers" className="max-w-5xl mx-auto px-5 pb-16">
      <Rule />
      <Reveal><SplitWords inView text="The Sovereign Offer Wall" className="text-3xl font-extrabold tracking-tight" />
      <p className="mt-2 text-muted max-w-xl">
        Surveys, quizzes and trials, curated by nobody. Prefer a bigger window?{' '}
        <a href={configured ? url : undefined} target="_blank" rel="noreferrer" className="text-ink underline decoration-accent underline-offset-4 hover:text-accent">
          Open it in its own tab.
        </a>
      </p></Reveal>

      <Reveal delay={0.1}>
        {configured ? (
          <iframe
            src={url}
            title="Offer wall"
            className="glass mt-6 w-full h-[640px] rounded-3xl"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-top-navigation-by-user-activation"
          />
        ) : (
          <div className="glass mt-6 grid h-64 place-items-center rounded-3xl p-8 text-center text-muted">
            <p>
              The survey wall isn’t switched on yet. Set <code className="text-ink">VITE_CPX_APP_ID</code> to your CPX Research app ID and redeploy.
            </p>
          </div>
        )}
      </Reveal>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
        <span>{statusText[tally.status]}</span>
        <button onClick={tally.refresh} className="btn active:scale-95 ml-auto inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-ink">
          <RefreshCw className="w-3.5 h-3.5" /> Did it count?
        </button>
      </div>
    </section>
  );
}
