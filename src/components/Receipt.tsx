import { motion } from 'motion/react';
import { AnimatedNumber } from './AnimatedNumber';
import { useEffect, useRef, useState } from 'react';
import { DOLLARS_PER_OFFER } from '../lib/config';
import type { Tally } from '../lib/useTally';

const THANKS = [
  'Zak says thanks. Zak is eating.',
  'That was a real person’s lunch.',
  'Somewhere, a marketer learned your zip code.',
  'Noted. Zak will not forget this. Zak forgets everything, but not this.',
  'You did that on purpose. Respect.',
  'Zak just looked at his balance and nodded.',
];

function Row({ k, v, strong }: { k: string; v: React.ReactNode; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? 'font-medium' : ''}`}>
      <span>{k}</span>
      <span className="tabular-nums">{v}</span>
    </div>
  );
}

export function Receipt({ tally }: { tally: Tally }) {
  const prev = useRef(tally.offers);
  const [line, setLine] = useState('Nothing yet. Zak is patient.');

  useEffect(() => {
    if (tally.offers > prev.current) setLine(THANKS[Math.floor(Math.random() * THANKS.length)]);
    prev.current = tally.offers;
  }, [tally.offers]);

  const zak = tally.offers * DOLLARS_PER_OFFER;

  return (
    <motion.div
      initial={{ clipPath: 'inset(0 0 100% 0)', y: -40, rotate: 1.2 }}
      animate={{ clipPath: 'inset(0 0 0% 0)', y: 0, rotate: 1.2 }}
      transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ rotate: 0, scale: 1.02 }}
      className="receipt w-full max-w-xs p-6 text-[13px] leading-6 shadow-2xl"
    >
      <p className="text-center font-medium tracking-widest">ZAK’S COFFEE FUND</p>
      <p className="text-center text-[11px]">— your visit —</p>
      <hr className="my-3 border-dashed border-black/40" />
      <Row k="Surveys finished" v={<AnimatedNumber value={tally.offers} format={n => String(Math.round(n))} />} />
      <Row k="Paid to Zak" v={<AnimatedNumber value={zak} format={n => `$${n.toFixed(2)}`} />} />
      <Row k="Paid to you" v="$0.00" />
      <hr className="my-3 border-dashed border-black/40" />
      <Row k="Void points" v={<AnimatedNumber value={tally.points} format={n => Math.round(n).toLocaleString()} />} strong />
      <hr className="my-3 border-dashed border-black/40" />
      <motion.p key={line} aria-live="polite" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="min-h-12">{line}</motion.p>
      <p className="mt-3 text-center text-[11px]">NO REFUNDS. NO RETURNS. NO REGRETS (some regrets).</p>
    </motion.div>
  );
}
