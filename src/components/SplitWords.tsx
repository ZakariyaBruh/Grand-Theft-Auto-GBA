import { motion } from 'motion/react';

interface Props {
  text: string;
  as?: 'h1' | 'h2';
  className?: string;
  delay?: number;
  /** Wait for the heading to scroll into view instead of animating on load. */
  inView?: boolean;
}

/** Headline where each word slides up out of a mask. "\n" starts a new line. */
export function SplitWords({ text, as = 'h2', className, delay = 0, inView }: Props) {
  const Tag = motion[as];
  const trigger = inView
    ? { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '0px 0px -15% 0px' } }
    : { initial: 'hidden', animate: 'show' };

  return (
    <Tag
      className={className}
      aria-label={text.replace('\n', ' ')}
      variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: delay } } }}
      {...trigger}
    >
      {text.split('\n').map((line, li) => (
        <span key={li} className="block" aria-hidden>
          {line.split(' ').map((w, wi) => (
            <span key={wi} className="inline-block overflow-hidden align-bottom pb-[0.14em] -mb-[0.14em] mr-[0.25em]">
              <motion.span
                className="inline-block"
                variants={{ hidden: { y: '115%', rotate: 4 }, show: { y: 0, rotate: 0 } }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
