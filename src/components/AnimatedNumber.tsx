import { animate } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

/** Counts from the previous value to the new one. */
export function AnimatedNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const controls = animate(from.current, value, {
      duration: 0.5,
      ease: 'easeOut',
      onUpdate: v => { from.current = v; setShown(v); },
    });
    return () => controls.stop();
  }, [value]);

  return <>{format(shown)}</>;
}
