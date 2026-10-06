import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function Header({ points }: { points: number }) {
  const prev = useRef(points);
  const [gain, setGain] = useState(0);
  useEffect(() => {
    if (points > prev.current) {
      setGain(points - prev.current);
      const t = window.setTimeout(() => setGain(0), 1800);
      prev.current = points;
      return () => window.clearTimeout(t);
    }
    prev.current = points;
  }, [points]);

  return (
    <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
      <a href="#" className="text-lg font-extrabold tracking-tight">Liquid Void</a>
      <a href="#perks" className="relative font-mono text-sm text-muted hover:text-accent">
        <AnimatePresence>
          {gain > 0 && (
            <motion.span key={points} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: -22 }} exit={{ opacity: 0, y: -34 }} transition={{ duration: 0.6 }} className="absolute right-0 text-accent font-medium">
              +{gain}
            </motion.span>
          )}
        </AnimatePresence>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={points} className="inline-block" initial={{ y: -10, opacity: 0, color: '#e8ff47' }} animate={{ y: 0, opacity: 1, color: '#8c8c85' }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.3 }}>
            {points.toLocaleString()}
          </motion.span>
        </AnimatePresence>{' '}void pts
      </a>
    </motion.header>
  );
}
