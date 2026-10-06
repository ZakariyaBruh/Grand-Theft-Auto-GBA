import { ExternalLink, Undo2 } from 'lucide-react';
import { WALL_URL, DOLLARS_PER_OFFER, POINTS_PER_OFFER } from '../lib/config';

interface Props {
  tally: { offers: number; add: () => void; undo: () => void };
}

export function OfferWall({ tally }: Props) {
  return (
    <section id="offers" className="border-t border-line bg-card">
      <div className="max-w-5xl mx-auto px-5 py-14">
        <h2 className="font-serif text-3xl">Offers</h2>
        <p className="mt-2 text-muted">
          Blank below? An ad blocker is probably hiding it.{' '}
          <a href={WALL_URL} target="_blank" rel="noreferrer" className="underline decoration-accent underline-offset-2 hover:text-ink">
            Open it in a new tab <ExternalLink className="inline w-3.5 h-3.5 -mt-0.5" />
          </a>
        </p>

        <iframe
          src={WALL_URL}
          title="Offer wall"
          className="mt-6 w-full h-[560px] rounded-lg border border-line bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />

        <div className="mt-5 flex flex-wrap items-center gap-4 rounded-lg border border-line bg-paper p-4">
          <button
            onClick={tally.add}
            className="rounded-md bg-accent text-white px-5 py-2.5 font-medium hover:brightness-110 active:translate-y-px cursor-pointer"
          >
            I finished one (+{POINTS_PER_OFFER} pts)
          </button>
          <p className="text-sm text-muted tabular-nums">
            {tally.offers} logged · about ${(tally.offers * DOLLARS_PER_OFFER).toFixed(2)} to Zak
          </p>
          {tally.offers > 0 && (
            <button onClick={tally.undo} className="ml-auto flex items-center gap-1 text-sm text-muted hover:text-ink cursor-pointer">
              <Undo2 className="w-3.5 h-3.5" /> Undo
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted">The tally is on the honor system and saved only in this browser.</p>
      </div>
    </section>
  );
}
