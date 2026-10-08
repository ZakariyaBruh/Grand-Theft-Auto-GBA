import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, CircleHelp, Copy, Dices, RefreshCw, Settings2, Star, X } from 'lucide-react';
import { POINTS_PER_OFFER } from '../lib/config';
import { Reveal } from './Reveal';
import { Rule } from './Rule';
import { SplitWords } from './SplitWords';
import { Qualifier } from './Qualifier';
import type { Tally, Status } from '../lib/useTally';

interface Survey {
  id: string;
  minutes: number;
  zakUsd: number;
  rating: number;
  ratings: number;
  category: string;
  conversion: number;
  top: boolean;
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

/** CPX labels nearly everything "General", so name surveys by what we can actually tell: how long they take. */
function surveyName(s: Survey): string {
  const cat = s.category && s.category.toLowerCase() !== 'general' ? s.category : '';
  const base =
    s.minutes <= 1 ? 'One-minute survey' :
    s.minutes <= 3 ? 'Short survey' :
    s.minutes <= 6 ? 'Coffee-break survey' :
    s.minutes <= 12 ? 'Proper survey' : 'The long one';
  return `${cat ? `${cat}: ` : ''}${base} #${s.id.slice(-4)}`;
}

function odds(conv: number): string {
  if (conv >= 70) return 'good odds';
  if (conv >= 45) return 'fair odds';
  if (conv > 0) return 'long odds';
  return 'odds unknown';
}

export function OfferWall({ tally }: { tally: Tally }) {
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [sort, setSort] = useState<Sort>('pay');
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQualifier, setShowQualifier] = useState(false);
  const [showIdEditor, setShowIdEditor] = useState(false);

  const handleCopyId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(tally.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [tally.uid]);

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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <SplitWords inView text="The Sovereign Offer Wall" className="text-3xl font-extrabold tracking-tight" />
            <p className="mt-2 text-muted max-w-xl">
              Real surveys, picked for where you are. Tap one to see what it involves before you start.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowQualifier(v => !v)} aria-expanded={showQualifier} className="btn inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm text-ink">
              <CircleHelp className="h-4 w-4" /> Do I qualify?
            </button>
            <button onClick={() => setShowIdEditor(true)} className="btn inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm text-ink">
              <Settings2 className="h-4 w-4" /> Change CPX ID
            </button>
          </div>
        </div>
      </Reveal>
      {showQualifier && <Qualifier />}

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
          <Notice
            title="No surveys for you right now"
            action={<button onClick={fetchSurveys} className="btn rounded-full px-4 py-1.5 text-ink">Check again</button>}
          >
            Surveys are matched to the person and the country, and none fit at the moment. They come and go through the day.
            {load.why && (
              <span className="mt-3 block font-mono text-xs">
                CPX saw {load.why.ip || 'no IP address'}{load.why.cpx ? ` and said: ${load.why.cpx}` : ' and returned an empty list'}.
              </span>
            )}
            {load.why && (
              <a
                className="mt-3 inline-block text-sm text-ink underline decoration-accent underline-offset-4 hover:text-accent"
                href={`mailto:hello@cpx-research.com?subject=${encodeURIComponent('No surveys for one of my test users')}&body=${encodeURIComponent(
                  `Hi CPX,\n\nMy test user (ext_user_id ${tally.uid}) gets no surveys. The last IP you saw was ${load.why.ip || 'unknown'} and the reply was "${load.why.cpx || 'empty list'}".\n\nThe profile may have been set from a VPN session earlier. Could you check and reset it?\n\nMy app ID: \n`,
                )}`}
              >
                Email CPX support about this ID
              </a>
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
                    <button
                      type="button"
                      aria-expanded={open === s.id}
                      onClick={() => setOpen(o => (o === s.id ? null : s.id))}
                      className="group grid w-full cursor-pointer grid-cols-[4.5rem_1fr_auto] items-center gap-x-5 gap-y-1 py-4 text-left transition-colors hover:bg-white/[0.03] sm:grid-cols-[6rem_1fr_9rem_auto]"
                    >
                      <span className="font-mono text-3xl tabular-nums leading-none">
                        {s.minutes}
                        <span className="ml-1 text-xs text-muted">min</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{surveyName(s)}{s.top ? ' · top pick' : ''}</span>
                        <span className="flex items-center gap-1 text-sm text-muted">
                          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                          {s.rating > 0 ? s.rating.toFixed(1) : 'new'}
                          {s.ratings > 0 && <span>({s.ratings})</span>}
                          <span className="ml-2">· {odds(s.conversion)}</span>
                        </span>
                      </span>
                      <span className="hidden text-right sm:block">
                        <span className="block font-mono text-accent">${s.zakUsd.toFixed(2)}</span>
                        <span className="block text-xs text-muted">to Zak</span>
                      </span>
                      <ChevronDown className={`h-5 w-5 text-muted transition-transform ${open === s.id ? 'rotate-180 text-accent' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {open === s.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <Details s={s} />
                        </motion.div>
                      )}
                    </AnimatePresence>
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

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
        <div className="flex flex-wrap items-center gap-2">
          <span>{tally.errorMessage || statusText[tally.status]}</span>
          <span className="hidden sm:inline text-line">•</span>
          <span className="font-mono text-xs text-muted flex items-center gap-1.5">
            CPX ID:
            <span className="text-ink bg-white/5 px-2 py-0.5 rounded border border-line" title={tally.uid}>
              {tally.uid.slice(0, 8)}…{tally.uid.slice(-4)}
            </span>
            <button
              type="button"
              onClick={handleCopyId}
              title="Copy full CPX ID"
              className="p-1 hover:text-accent transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button onClick={tally.refresh} className="btn active:scale-95 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-ink">
            <RefreshCw className="h-3.5 w-3.5" /> Did it count?
          </button>
        </div>
      </div>
      {showIdEditor && <IdDialog tally={tally} onClose={() => setShowIdEditor(false)} />}
    </section>
  );
}

function IdDialog({ tally, onClose }: { tally: Tally; onClose: () => void }) {
  const [next, setNext] = useState(tally.uid);
  const [error, setError] = useState('');

  function save() {
    if (!tally.changeUid(next)) {
      setError('Enter a valid ID, for example 123e4567-e89b-12d3-a456-426614174000.');
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5" role="dialog" aria-modal="true" aria-labelledby="cpx-id-title">
      <div className="glass w-full max-w-lg rounded-3xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="cpx-id-title" className="text-xl font-bold">Change your CPX ID</h2>
            <p className="mt-1 text-sm text-muted">This ID ties your surveys and points together on this device. A new ID starts with a fresh survey profile and a 0 balance.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-ink"><X /></button>
        </div>
        <label htmlFor="cpx-id" className="mt-6 block text-sm font-medium">CPX ID</label>
        <div className="mt-2 flex gap-2">
          <input
            id="cpx-id"
            value={next}
            onChange={e => { setNext(e.target.value); setError(''); }}
            className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/5 px-3 py-2 font-mono text-sm outline-none focus:border-accent"
            autoFocus
          />
          <button type="button" onClick={() => { setNext(crypto.randomUUID()); setError(''); }} className="btn inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink" title="Generate a new CPX ID">
            <Dices className="h-4 w-4" /> Randomize
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-300" role="alert">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn rounded-full px-4 py-2 text-sm text-ink">Cancel</button>
          <button onClick={save} className="btn rounded-full bg-accent px-4 py-2 text-sm text-black">Use this ID</button>
        </div>
      </div>
    </div>
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

function Details({ s }: { s: Survey }) {
  return (
    <div className="glass mb-4 rounded-2xl p-5 text-sm">
      <p className="font-semibold">What to expect</p>
      <ol className="mt-2 space-y-1.5 text-ink/80">
        <li><span className="mr-2 font-mono text-accent">1</span>A few questions about you (things like age, location and household). This is how CPX decides whether you fit.</li>
        <li><span className="mr-2 font-mono text-accent">2</span>If you fit, the survey itself takes about {s.minutes} minute{s.minutes === 1 ? '' : 's'}.</li>
        <li><span className="mr-2 font-mono text-accent">3</span>If you don’t fit you get screened out. Nobody is paid for that, so just pick another one.</li>
      </ol>

      <dl className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
        <div>
          <dt className="text-muted">What you need</dt>
          <dd>{s.webcam ? 'A working webcam.' : 'No webcam or downloads.'} CPX doesn’t publish this survey’s exact requirements. The opening questions decide.</dd>
        </div>
        <div>
          <dt className="text-muted">Your chances</dt>
          <dd>
            {s.conversion > 0
              ? `CPX reports about ${s.conversion}% of people who start this one get through to a paid completion.`
              : 'CPX has no completion rate for this one yet.'}
          </dd>
        </div>
        <div>
          <dt className="text-muted">What people think</dt>
          <dd>{s.rating > 0 ? `${s.rating.toFixed(1)} out of 5 from ${s.ratings} rating${s.ratings === 1 ? '' : 's'}.` : 'Too new to be rated.'}</dd>
        </div>
        <div>
          <dt className="text-muted">What it’s worth</dt>
          <dd>About ${s.zakUsd.toFixed(2)} to Zak, and {POINTS_PER_OFFER} Void Points to you once CPX confirms it.</dd>
        </div>
      </dl>

      <a href={s.href} target="_blank" rel="noreferrer" className="btn mt-5 inline-block rounded-full bg-accent px-6 py-2.5 font-semibold text-black">
        Start survey
      </a>
      <span className="ml-3 text-muted">Opens in a new tab. Come back here after.</span>
    </div>
  );
}
