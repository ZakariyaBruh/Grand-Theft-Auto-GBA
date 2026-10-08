import { Check, CircleHelp, Dices, ExternalLink, RefreshCw, Settings2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Reveal } from './Reveal';
import { Rule } from './Rule';
import { SplitWords } from './SplitWords';
import { POINTS_PER_OFFER } from '../lib/config';
import type { Tally, Status } from '../lib/useTally';

const statusText: Record<Status, string> = {
  loading: 'Checking your balance…',
  ok: `Each finished survey is worth ${POINTS_PER_OFFER} points once CPX Research confirms it.`,
  offline: 'Our servers have run out of storage',
};

type Survey = {
  id?: string | number;
  survey_id?: string | number;
  title?: string;
  loi?: number;
  entry_link?: string;
  link?: string;
};

export function OfferWall({ tally }: { tally: Tally }) {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveyState, setSurveyState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    setSurveyState('loading');
    fetch(`/api/surveys?uid=${encodeURIComponent(tally.uid)}`, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Survey request failed'); return response.json(); })
      .then(data => { setSurveys(data); setSurveyState('ready'); })
      .catch(error => { if (error.name !== 'AbortError') setSurveyState('error'); });
    return () => controller.abort();
  }, [tally.uid]);
  const [showQualifications, setShowQualifications] = useState(false);
  const [showIdEditor, setShowIdEditor] = useState(false);
  const [nextId, setNextId] = useState(tally.uid);
  const [idError, setIdError] = useState('');

  function randomizeId() {
    setNextId(crypto.randomUUID());
    setIdError('');
  }

  function saveId() {
    if (!tally.changeUid(nextId)) {
      setIdError('Enter a valid UUID, for example 123e4567-e89b-12d3-a456-426614174000.');
      return;
    }
    setIdError('');
    setShowIdEditor(false);
  }

  return (
    <section id="offers" className="max-w-5xl mx-auto px-5 pb-16">
      <Rule />
      <Reveal>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <SplitWords inView text="The Sovereign Offer Wall" className="text-3xl font-extrabold tracking-tight" />
            <p className="mt-2 text-muted max-w-xl">
              Real surveys from CPX Research, picked for where you are. Tap one to see what it involves.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowQualifications(value => !value)} className="btn inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm text-ink" aria-expanded={showQualifications}>
              <CircleHelp className="w-4 h-4" /> Survey qualifications
            </button>
            <button onClick={() => { setNextId(tally.uid); setShowIdEditor(true); }} className="btn inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm text-ink">
              <Settings2 className="w-4 h-4" /> Change CPX ID
            </button>
          </div>
        </div>
      </Reveal>
      {showQualifications && (
        <Reveal>
          <div className="glass mt-5 rounded-2xl p-5" aria-label="Common survey qualifications">
            <div className="flex items-start justify-between gap-4">
              <div><p className="font-semibold">Survey-specific qualifications</p><p className="mt-1 text-sm text-muted">Qualifications are set separately by each CPX survey server. Open a survey to see its screeners before you start.</p></div>
              <Check className="text-accent" aria-hidden="true" />
            </div>
            <ul className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-2">
              {['Age and country of residence', 'Household and employment details', 'Recent purchases or product usage', 'Devices, hobbies, or media habits'].map(item => <li key={item} className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-accent" aria-hidden="true" />{item}</li>)}
            </ul>
            <p className="mt-4 text-xs text-muted">Answer screeners honestly. Passing a screener is not guaranteed, and some surveys may ask a few additional questions before starting.</p>
          </div>
        </Reveal>
      )}
      <Reveal delay={0.1}>
        <div className="glass mt-6 rounded-3xl p-5" aria-live="polite">
          {surveyState === 'loading' && <p className="py-12 text-center text-muted">Finding surveys for this CPX ID…</p>}
          {surveyState === 'error' && <p className="py-12 text-center text-muted">Surveys could not be loaded. Try changing the CPX ID or refresh the page.</p>}
          {surveyState === 'ready' && surveys.length === 0 && <p className="py-12 text-center text-muted">No matching surveys are available for this CPX ID right now.</p>}
          {surveyState === 'ready' && surveys.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {surveys.map((survey, index) => {
                const surveyId = survey.id ?? survey.survey_id ?? index;
                const link = survey.entry_link ?? survey.link;
                return <article key={String(surveyId)} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{survey.title || `Survey ${index + 1}`}</p><p className="mt-1 text-sm text-muted">{survey.loi ? `${survey.loi} minute${survey.loi === 1 ? '' : 's'}` : 'Short survey'} · Qualification screeners apply</p></div><span className="rounded-full bg-accent/15 px-2.5 py-1 text-sm font-semibold text-accent">{POINTS_PER_OFFER} pts</span></div>
                  {link && <a href={link} target="_blank" rel="noreferrer" className="btn mt-4 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm text-ink">See qualifications <ExternalLink className="w-3.5 h-3.5" /></a>}
                </article>;
              })}
            </div>
          )}
        </div>
      </Reveal>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
        <span>{tally.errorMessage || statusText[tally.status]}</span>
        <button onClick={tally.refresh} className="btn active:scale-95 ml-auto inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-ink"><RefreshCw className="w-3.5 h-3.5" /> Did it count?</button>
      </div>
      {showIdEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5" role="dialog" aria-modal="true" aria-labelledby="cpx-id-title">
          <div className="glass w-full max-w-lg rounded-3xl p-6">
            <div className="flex items-start justify-between gap-4"><div><h2 id="cpx-id-title" className="text-xl font-bold">Change your CPX ID</h2><p className="mt-1 text-sm text-muted">This ID links surveys and points to the right account on this device.</p></div><button onClick={() => setShowIdEditor(false)} aria-label="Close" className="text-muted hover:text-ink"><X /></button></div>
            <label htmlFor="cpx-id" className="mt-6 block text-sm font-medium">CPX ID</label>
            <div className="mt-2 flex gap-2">
              <input id="cpx-id" value={nextId} onChange={event => { setNextId(event.target.value); setIdError(''); }} className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/5 px-3 py-2 font-mono text-sm outline-none focus:border-accent" autoFocus />
              <button type="button" onClick={randomizeId} className="btn inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink" title="Generate a new CPX ID" aria-label="Generate a new CPX ID">
                <Dices className="w-4 h-4" /> Randomize
              </button>
            </div>
            <p className="mt-2 text-xs text-muted">Generate a fresh ID when starting a new server instance.</p>
            {idError && <p className="mt-2 text-sm text-red-300" role="alert">{idError}</p>}
            <div className="mt-5 flex justify-end gap-2"><button onClick={() => setShowIdEditor(false)} className="btn rounded-full px-4 py-2 text-sm text-ink">Cancel</button><button onClick={saveId} className="btn rounded-full bg-accent px-4 py-2 text-sm text-black">Use this ID</button></div>
          </div>
        </div>
      )}
    </section>
  );
}
