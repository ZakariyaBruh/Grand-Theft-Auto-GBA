import { Reveal } from './Reveal';
import { Rule } from './Rule';

export function Footer() {
  return (
    <div className="max-w-5xl mx-auto px-5">
    <Rule />
    <Reveal className="py-10 text-sm text-muted flex flex-wrap justify-between gap-2">
      <span>Liquid Void. Built by someone who could have been doing literally anything else.</span>
      <span className="font-mono">surveys by CPX Research</span>
    </Reveal>
    </div>
  );
}
