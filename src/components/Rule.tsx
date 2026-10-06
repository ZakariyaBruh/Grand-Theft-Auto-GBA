import { motion } from 'motion/react';

/** Section divider that draws itself from left to right. */
export function Rule() {
  return (
    <motion.div
      className="h-px bg-white/15 -mx-5 mb-16 origin-left"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }}
    />
  );
}
