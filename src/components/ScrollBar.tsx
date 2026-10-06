import { motion, useScroll, useSpring } from 'motion/react';

export function ScrollBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  return <motion.div style={{ scaleX }} className="fixed top-0 inset-x-0 h-0.5 bg-accent origin-left z-50" />;
}
