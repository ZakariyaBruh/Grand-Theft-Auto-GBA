import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { RefreshCw, Star } from 'lucide-react';
import { POINTS_PER_OFFER } from '../lib/config';
import { Reveal } from './Reveal';
import { Rule } from './Rule';
import { SplitWords } from './SplitWords';
import type { Tally, Status } from '../lib/useTally';

interface Survey {
  id: string;
  minutes: number;
  zakUsd: number;
  rating: number;
  ratings: number;
  category: string;
  webcam: boolean;
  href: string;
}

type Why = { ip: string; cpx: string };
type Load = { state: 'loading' } | { state: 'off' } | { state: 'error' } | { state: 'ready'; surveys: Survey[]; why?: Why };
type Sort = 'pay' | 'quick';

const statusText: Record<Status, string> = {
  loading: 'Checking your balance…',
  ok: `Each finished survey is worth ${POINTS_PER_OFFER} points once CPX Research confirms it.`,
  offline: 'Can’t reach the points server, so your balance might be out of date.',
};

const PAGE = 8;

export function OfferWall({ tally }: { tally: Tally }) {
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [sort, setSort] = useState<Sort>('pay');
  const [shown, setShown] = useState(PAGE);

  const fetchSurveys = useCallback(async () => {
    setLoad({ state: 'loading' });
    try {
      const r = await fetch(`/api/surveys?uid=${encodeURIComponent(tally.uid)}`);
      if (r.status === 503) return setLoad({ state: 'off' });
      if (!r.ok) return setLoad({ state: 'error' });
      const d = (await r.json()) as { surveys: Survey[]; why?: Why };
      setLoad({ state: 'ready', surveys: d.surveys, why: d.why });
    } catch {
      setLoad({ state: 'error' });
    }
  }, [tally.uid]);

  useEffect(() => { fetchSurveys(); }, [fetchSurveys]);

  const list = useMemo(() => {
    if (load.state !== 'ready') return [];
    const rate = (s: Survey) => s.zakUsd / s.minutes;
    return [...load.surveys].sort((a, b) => (sort === 'pay' ? rate(b) - rate(a) : a.minutes - b.minutes || rate(b) - rate(a)));
  }, [load, sort]);

  return (
    <section id="offers" className="max-w-5xl mx-auto px-5 pb-16">
      <Rule />
      <Reveal>
        <SplitWords inView text="The Sovereign Offer Wall" className="text-3xl font-extrabold tracking-tight" />
        <p className="mt-2 text-muted max-w-xl">
          Real surveys, picked for where you are. Each one opens in its own tab. Finish it, then come back.
        </p>
      </Reveal>

      {load.state === 'ready' && list.length > 0 && (
        <div className="mt-6 flex items-center gap-2 text-sm">
          <span className="text-muted mr-1">Sort</span>
          {([['pay', 'Best for Zak'], ['quick', 'Quickest']] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => { setSort(k); setShown(PAGE); }}
              className={`btn rounded-full px-3.5 py-1.5 ${sort === k ? 'bg-accent text-black border-accent' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4">
        {load.state === 'loading' && <Skeleton />}

        {load.state === 'off' && (
          <Notice title="Surveys aren’t switched on yet">
            Set <code className="text-ink">CPX_APP_ID</code> and <code className="text-ink">CPX_SECURE_HASH</code> in Vercel, then redeploy.
          </Notice>
        )}

        {load.state === 'error' && (
          <Notice title="Couldn’t load surveys" action={<button onClick={fetchSurveys} className="btn rounded-full px-4 py-1.5 text-ink">Try again</button>}>
            CPX Research didn’t answer. This is usually temporary.
          </Notice>
        )}

        {load.state === 'ready' && list.length === 0 && (
          <Notice title="No surveys for you right now" action={<button onClick={fetchSurveys} className="btn rounded-full px-4 py-1.5 text-ink">Check again</button>}>
            Surveys are matched to the person and the country, and none fit at the moment. They come and go through the day.
            {load.why && (
              <span className="mt-3 block font-mono text-xs">
                CPX saw {load.why.ip || 'no IP address'}{load.why.cpx ? ` and said: ${load.why.cpx}` : ' and returned an empty list'}.
              </span>
            )}
          </Notice>
        )}

        {load.state === 'ready' && list.length > 0 && (
          <>
            <ul className="divide-y divide-line border-y border-line">
              <AnimatePresence initial>
                {list.slice(0, shown).map((s, i) => (
                  <motion.li
                    key={s.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: Math.min(i, 8) * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group grid grid-cols-[4.5rem_1fr_auto] items-center gap-x-5 gap-y-1 py-4 transition-colors hover:bg-white/[0.03] sm:grid-cols-[6rem_1fr_9rem_auto]"
                    >
                      <span className="font-mono text-3xl tabular-nums leading-none">
                        {s.minutes}
                        <span className="ml-1 text-xs text-muted">min</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{s.category || 'General survey'}{s.webcam ? ' · webcam' : ''}</span>
                        <span className="flex items-center gap-1 text-sm text-muted">
                          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                          {s.rating > 0 ? s.rating.toFixed(1) : 'new'}
                          {s.ratings > 0 && <span>({s.ratings})</span>}
                        </span>
                      </span>
                      <span className="hidden text-right sm:block">
                        <span className="block font-mono text-accent">${s.zakUsd.toFixed(2)}</span>
                        <span className="block text-xs text-muted">to Zak</span>
                      </span>
                      <span className="btn rounded-full px-4 py-1.5 text-sm group-hover:bg-accent group-hover:text-black group-hover:border-accent">
                        Start
                      </span>
                    </a>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted">
              <span>{Math.min(shown, list.length)} of {list.length} surveys</span>
              {shown < list.length && (
                <button onClick={() => setShown(n => n + PAGE)} className="btn rounded-full px-4 py-1.5 text-ink">Show more</button>
              )}
              <button onClick={fetchSurveys} className="btn ml-auto inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-ink">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh list
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
        <span>{statusText[tally.status]}</span>
        <button onClick={tally.refresh} className="btn active:scale-95 ml-auto inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-ink">
          <RefreshCw className="h-3.5 w-3.5" /> Did it count?
        </button>
      </div>
    </section>
  );
}

function Notice({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="glass rounded-3xl p-8 text-center">
      <p className="text-lg font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-muted">{children}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function Skeleton() {
  return (
    <ul aria-label="Loading surveys" className="divide-y divide-line border-y border-line">
      {Array.from({ length: 4 }, (_, i) => (
        <li key={i} className="flex items-center gap-5 py-5">
          <motion.div className="h-8 w-16 rounded bg-white/10" animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.12 }} />
          <motion.div className="h-4 flex-1 rounded bg-white/10" animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.12 }} />
        </li>
      ))}
    </ul>
  );
}
