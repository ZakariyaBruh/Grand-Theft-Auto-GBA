import { useEffect, useRef, useState } from 'react';
import { Printer } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Reveal } from './Reveal';
import { Rule } from './Rule';
import { SplitWords } from './SplitWords';

interface Perk {
  id: string;
  title: string;
  blurb: string;
  cost: number;
}

const PERKS: Perk[] = [
  { id: 'checklist', title: 'A checklist so you stop getting spam', blurb: 'The only perk here that is actually good for you.', cost: 100 },
  { id: 'timer', title: 'A 25-minute timer', blurb: 'Surveys expand to fill the time you give them. This stops that.', cost: 300 },
  { id: 'certificate', title: 'A certificate', blurb: 'For the wall, the fridge, or the drawer of things you are not ready to throw out.', cost: 500 },
];

const CHECKLIST = [
  'Use a throwaway email, not the one your bank has.',
  'Skip any step that asks for a card number.',
  'Do not give a “free trial” your real phone number.',
  'Close the tab if it wants to install something you did not pick.',
  'If it says “screen out”, leave. You are not missing anything.',
  'Unsubscribe from the first promo email. They get worse.',
];

export function Perks({ points }: { points: number }) {
  const next = PERKS.find(p => points < p.cost);

  return (
    <section id="perks" className="max-w-5xl mx-auto px-5 pb-16">
      <Rule />
      <Reveal><SplitWords inView text="The Void Point Redemption Programme" className="text-3xl font-extrabold tracking-tight" />
      <p className="mt-2 text-muted max-w-xl">
        Void Points hold no monetary value and cannot be spent anywhere. They do, however, unlock these three things.
        {next ? ` ${(next.cost - points).toLocaleString()} more for the next one.` : ' You have all of them. Go outside.'}
      </p></Reveal>

      <div className="mt-8 relative h-1.5 rounded-full bg-white/10">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-accent"
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.min(points / 500, 1) * 100}%` }}
          animate={{ width: `${Math.min(points / 500, 1) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        {PERKS.map(p => (
          <span key={p.id} style={{ left: `${(p.cost / 500) * 100}%` }} className={`absolute -top-1 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-paper ${points >= p.cost ? 'bg-accent' : 'bg-muted'}`} />
        ))}
      </div>

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {PERKS.map((perk, i) => {
          const open = points >= perk.cost;
          return (
            <Reveal as="li" delay={i * 0.1} key={perk.id} className="py-6 grid sm:grid-cols-[6rem_1fr] gap-x-6 gap-y-3">
              <motion.span animate={{ scale: open ? [1, 1.25, 1] : 1 }} transition={{ duration: 0.5 }} className={`font-mono text-3xl origin-left ${open ? 'text-accent' : 'text-muted'}`}>{perk.cost}</motion.span>
              <div>
                <h3 className={`text-xl font-semibold ${open ? '' : 'text-ink/60'}`}>{perk.title}</h3>
                <p className="text-muted">{open ? perk.blurb : `${perk.blurb} (${perk.cost - points} points away)`}</p>
                <AnimatePresence>{open && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 max-w-md overflow-hidden">{perk.id === 'checklist' ? <Checklist /> : perk.id === 'timer' ? <Timer /> : <Cert />}</motion.div>}</AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </ul>
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
      <p className="font-mono text-5xl tabular-nums">{m}:{String(s).padStart(2, '0')}</p>
      <p className="text-sm text-muted h-5">{left <= 0 ? 'Time. Stand up. The survey will still be there, sadly.' : running ? 'Running' : ''}</p>
      <div className="mt-2 flex gap-2 text-sm">
        <button onClick={() => setRunning(r => !r)} disabled={left <= 0} className="btn rounded-full px-4 py-1 cursor-pointer disabled:opacity-40">
          {running ? 'Pause' : 'Start'}
        </button>
        <button onClick={() => { setRunning(false); setLeft(SESSION_SECONDS); }} className="btn rounded-full px-4 py-1">
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
        className="mt-1 w-full rounded-lg border border-line bg-black/40 px-3 py-1.5 text-sm"
      />
      <div id="certificate-print" className="mt-3 border border-white/30 rounded-lg p-4 text-center bg-black/40">
        <p className="text-[11px] uppercase tracking-widest text-muted">Certificate of zero return</p>
        <p className="text-2xl font-extrabold mt-1">{name || 'Anonymous Benefactor'}</p>
        <p className="text-xs text-muted mt-1">did surveys so Zak could eat. Received in return: this.</p>
        <p className="text-xs mt-2">{date}</p>
      </div>
      <button onClick={() => window.print()} className="mt-2 flex items-center gap-1.5 text-sm underline decoration-accent underline-offset-4 cursor-pointer">
        <Printer className="w-3.5 h-3.5" /> Print or save PDF
      </button>
    </div>
  );
}
