import { useEffect, useMemo, useState } from 'react';
import { Check, CircleAlert } from 'lucide-react';

const KEY = 'liquid-void:qualifier';

const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'Another country'];
// CPX has the most surveys for these; elsewhere the list is usually short.
const WELL_COVERED = new Set(['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany']);

interface Requirement {
  id: string;
  label: string;
  why: string;
}

const CHECKS: Requirement[] = [
  { id: 'adult', label: 'I am 18 or older', why: 'Almost every survey screens out under-18s in the first question.' },
  { id: 'vpn', label: 'I am not on a VPN, proxy or hotspot with a shared address', why: 'CPX matches surveys to your real location. A VPN gets you an empty list or instant screen-outs.' },
  { id: 'honest', label: 'I will answer screeners truthfully and the same way each time', why: 'CPX cross-checks answers between surveys. Inconsistent answers get you screened out or flagged.' },
  { id: 'time', label: 'I have the full time listed, with no interruptions', why: 'Surveys time out. Leaving one open and coming back usually counts as a fail.' },
  { id: 'device', label: 'I am on one device and browser, with cookies on', why: 'Switching device or clearing cookies mid-survey makes CPX lose track of you.' },
];

interface State {
  country: string;
  ticked: string[];
}

function load(): State {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? '');
    if (s && typeof s.country === 'string' && Array.isArray(s.ticked)) return s;
  } catch { /* nothing saved */ }
  return { country: '', ticked: [] };
}

/** A self-check of the screener basics, so people can see in advance whether they are likely to qualify. */
export function Qualifier() {
  const [state, setState] = useState<State>(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
  }, [state]);

  const verdict = useMemo(() => {
    const countryOk = state.country !== '' && WELL_COVERED.has(state.country);
    const missing = CHECKS.filter(c => !state.ticked.includes(c.id));
    const answered = state.country !== '' && missing.length < CHECKS.length;
    const score = CHECKS.length - missing.length + (countryOk ? 1 : 0);
    const total = CHECKS.length + 1;
    return { countryOk, missing, answered, score, total };
  }, [state]);

  const toggle = (id: string) =>
    setState(s => ({ ...s, ticked: s.ticked.includes(id) ? s.ticked.filter(x => x !== id) : [...s.ticked, id] }));

  const good = verdict.answered && verdict.score === verdict.total;
  const tone = good ? 'text-accent' : 'text-ink';

  return (
    <div className="glass mt-5 rounded-2xl p-5" aria-label="Do I qualify?">
      <p className="font-semibold">Do I qualify?</p>
      <p className="mt-1 text-sm text-muted">
        CPX doesn’t publish each survey’s exact screener, so nobody can know for sure before starting. These are the checks that decide most screen-outs. Tick what is true for you.
      </p>

      <label className="mt-4 block text-sm">
        <span className="text-muted">Where do you live?</span>
        <select
          value={state.country}
          onChange={e => setState(s => ({ ...s, country: e.target.value }))}
          className="mt-1 block w-full max-w-xs rounded-xl border border-white/20 bg-black px-3 py-2 text-ink outline-none focus:border-accent"
        >
          <option value="">Choose…</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>

      <ul className="mt-4 space-y-2 text-sm">
        {CHECKS.map(c => (
          <li key={c.id}>
            <label className="flex cursor-pointer gap-2">
              <input type="checkbox" checked={state.ticked.includes(c.id)} onChange={() => toggle(c.id)} className="mt-1 accent-[#e8ff47]" />
              <span className={state.ticked.includes(c.id) ? 'text-ink' : 'text-muted'}>{c.label}</span>
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-xl border border-line bg-white/5 p-4 text-sm" aria-live="polite">
        {!verdict.answered ? (
          <p className="text-muted">Pick your country and tick the boxes that apply to see how you look.</p>
        ) : (
          <>
            <p className={`flex items-center gap-2 font-semibold ${tone}`}>
              {good ? <Check className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}
              {good ? 'You look well set up. Expect a decent list and normal screen-out rates.' : `You meet ${verdict.score} of ${verdict.total} basics. Fix the rest for better odds.`}
            </p>
            <ul className="mt-3 space-y-1.5 text-muted">
              {!verdict.countryOk && (
                <li>Surveys are thinnest outside the US, Canada, UK, Australia and Germany, so expect a short or empty list. Nothing to fix, it’s just supply.</li>
              )}
              {verdict.missing.map(c => <li key={c.id}>{c.why}</li>)}
            </ul>
          </>
        )}
        <p className="mt-3 text-xs text-muted">Each survey below also shows CPX’s own completion rate for it, under “Your chances”. That is the best per-survey signal available.</p>
      </div>
    </div>
  );
}
