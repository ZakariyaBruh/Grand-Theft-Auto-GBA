import { ExternalLink, RefreshCw } from 'lucide-react';
import { wallUrl, DOLLARS_PER_OFFER, POINTS_PER_OFFER } from '../lib/config';
import type { Status } from '../lib/useTally';

interface Props {
  tally: { uid: string; offers: number; status: Status; refresh: () => void };
}

const statusText: Record<Status, string> = {
  loading: 'Checking the void…',
  ok: 'Points are credited automatically when CPAGrip confirms an offer.',
  offline: 'Points server is offline, so your balance may be stale. The void is resting.',
};

export function OfferWall({ tally }: Props) {
  const url = wallUrl(tally.uid);
  return (
    <section id="offers" className="border-t border-line">
      <div className="max-w-5xl mx-auto px-5 py-14">
        <h2 className="font-serif text-3xl">Offers (please clap)</h2>
        <p className="mt-2 text-muted">
          Blank below? Your ad blocker is protecting you from helping Zak.{' '}
          <a href={url} target="_blank" rel="noreferrer" className="underline decoration-accent underline-offset-2 hover:text-ink">
            Open in a new tab <ExternalLink className="inline w-3.5 h-3.5 -mt-0.5" />
          </a>
        </p>

        <iframe
          src={url}
          title="Offer wall"
          className="glass mt-6 w-full h-[560px] rounded-2xl"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />

        <div className="glass mt-5 flex flex-wrap items-center gap-4 rounded-2xl p-4">
          <p className="tabular-nums">
            <span className="font-medium">{tally.offers}</span> verified · about ${(tally.offers * DOLLARS_PER_OFFER).toFixed(2)} to Zak · +{POINTS_PER_OFFER} pts each
          </p>
          <button onClick={tally.refresh} className="glass-btn ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Check now
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">{statusText[tally.status]}</p>
      </div>
    </section>
  );
}
