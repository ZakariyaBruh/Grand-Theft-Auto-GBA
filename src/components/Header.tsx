import { motion, AnimatePresence } from 'motion/react';

export function Header({ points }: { points: number }) {
  return (
    <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
      <a href="#" className="text-lg font-extrabold tracking-tight">Liquid Void</a>
      <a href="#perks" className="font-mono text-sm text-muted hover:text-accent">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={points} className="inline-block" initial={{ y: -10, opacity: 0, color: '#e8ff47' }} animate={{ y: 0, opacity: 1, color: '#8c8c85' }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.3 }}>
            {points.toLocaleString()}
          </motion.span>
        </AnimatePresence>{' '}void pts
      </a>
    </motion.header>
  );
}
