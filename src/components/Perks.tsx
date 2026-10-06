import { useEffect, useRef, useState } from 'react';
import { Lock, Printer } from 'lucide-react';

interface Perk {
  id: string;
  title: string;
  blurb: string;
  cost: number;
}

const PERKS: Perk[] = [
  { id: 'checklist', title: 'Privacy checklist', blurb: 'Six habits that keep survey spam out of your real inbox. The only perk with actual value.', cost: 100 },
  { id: 'timer', title: 'Session timer', blurb: 'Cap a session at 25 minutes so Zak’s coffee fund doesn’t eat your evening.', cost: 300 },
  { id: 'certificate', title: 'Certificate', blurb: 'A printable certificate proving you did this on purpose. Frame it or don’t.', cost: 500 },
];

const CHECKLIST = [
  'Use a throwaway email address, not your main one.',
  'Skip any step that asks for a card number.',
  'Never give your full phone number to a “free trial”.',
  'Close the tab if the offer asks you to install something you didn’t pick.',
  'Read the disqualification line: if it says “screen out”, move on fast.',
  'Unsubscribe from the first promo email you get.',
];

export function Perks({ points }: { points: number }) {
  const next = PERKS.find(p => points < p.cost);

  return (
    <section id="perks" className="border-t border-line">
      <div className="max-w-5xl mx-auto px-5 py-14">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-3xl">Perks</h2>
          <p className="text-muted tabular-nums">
            {points.toLocaleString()} void pts
            {next && <> · {(next.cost - points).toLocaleString()} to unlock “{next.title}”</>}
          </p>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {PERKS.map(perk => {
            const open = points >= perk.cost;
            return (
              <article key={perk.id} className={`rounded-lg border p-5 ${open ? 'glass border-white/25' : 'border-line border-dashed'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{perk.title}</h3>
                  {!open && (
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Lock className="w-3 h-3" /> {perk.cost}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">{perk.blurb}</p>
                {open && <div className="mt-4">{perk.id === 'checklist' ? <Checklist /> : perk.id === 'timer' ? <Timer /> : <Cert />}</div>}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Checklist() {
  const [done, setDone] = useState<boolean[]>(() => CHECKLIST.map(() => false));
  return (
    <ul className="space-y-2 text-sm">
      {CHECKLIST.map((item, i) => (
        <li key={item}>
          <label className="flex gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={done[i]}
              onChange={() => setDone(d => d.map((v, j) => (j === i ? !v : v)))}
              className="mt-1 accent-accent"
            />
            <span className={done[i] ? 'line-through text-muted' : ''}>{item}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

const SESSION_SECONDS = 25 * 60;

function Timer() {
  const [left, setLeft] = useState(SESSION_SECONDS);
  const [running, setRunning] = useState(false);
  const id = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!running) return;
    id.current = window.setInterval(() => setLeft(s => s - 1), 1000);
    return () => window.clearInterval(id.current);
  }, [running]);

  useEffect(() => {
    if (left <= 0) setRunning(false);
  }, [left]);

  const m = Math.floor(Math.max(left, 0) / 60);
  const s = Math.max(left, 0) % 60;

  return (
    <div>
      <p className="font-serif text-4xl tabular-nums">{m}:{String(s).padStart(2, '0')}</p>
      <p className="text-sm text-muted h-5">{left <= 0 ? 'Time. Stand up and stretch.' : running ? 'Running' : ''}</p>
      <div className="mt-2 flex gap-2 text-sm">
        <button onClick={() => setRunning(r => !r)} disabled={left <= 0} className="glass-btn rounded px-3 py-1 cursor-pointer disabled:opacity-40">
          {running ? 'Pause' : 'Start'}
        </button>
        <button onClick={() => { setRunning(false); setLeft(SESSION_SECONDS); }} className="glass-btn rounded px-3 py-1 cursor-pointer">
          Reset
        </button>
      </div>
    </div>
  );
}

function Cert() {
  const [name, setName] = useState('');
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div>
      <label className="text-sm text-muted" htmlFor="cert-name">Your name</label>
      <input
        id="cert-name"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Anonymous Benefactor"
        className="mt-1 w-full rounded border border-line bg-black/40 px-3 py-1.5 text-sm"
      />
      <div id="certificate-print" className="mt-3 border border-white/30 p-4 text-center bg-black/40">
        <p className="text-[11px] uppercase tracking-wide text-muted">Certificate of zero return</p>
        <p className="font-serif text-xl mt-1">{name || 'Anonymous Benefactor'}</p>
        <p className="text-xs text-muted mt-1">did surveys so Zak could eat. Received in return: $0.00 and a PDF.</p>
        <p className="text-xs mt-2">{date}</p>
      </div>
      <button onClick={() => window.print()} className="mt-2 flex items-center gap-1.5 text-sm underline underline-offset-2 cursor-pointer">
        <Printer className="w-3.5 h-3.5" /> Print or save PDF
      </button>
    </div>
  );
}
