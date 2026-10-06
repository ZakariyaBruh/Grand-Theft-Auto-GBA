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

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
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
    <div className="receipt rotate-[1.2deg] w-full max-w-xs p-6 text-[13px] leading-6 shadow-2xl">
      <p className="text-center font-medium tracking-widest">ZAK’S COFFEE FUND</p>
      <p className="text-center text-[11px]">— your visit —</p>
      <hr className="my-3 border-dashed border-black/40" />
      <Row k="Surveys finished" v={String(tally.offers)} />
      <Row k="Paid to Zak" v={`$${zak.toFixed(2)}`} />
      <Row k="Paid to you" v="$0.00" />
      <hr className="my-3 border-dashed border-black/40" />
      <Row k="Void points" v={tally.points.toLocaleString()} strong />
      <hr className="my-3 border-dashed border-black/40" />
      <p aria-live="polite" className="min-h-12">{line}</p>
      <p className="mt-3 text-center text-[11px]">NO REFUNDS. NO RETURNS. NO REGRETS (some regrets).</p>
    </div>
  );
}
