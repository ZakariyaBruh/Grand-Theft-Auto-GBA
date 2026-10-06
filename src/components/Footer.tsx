import { WALL_ID } from '../lib/config';

import { Reveal } from './Reveal';

export function Footer() {
  return (
    <Reveal className="max-w-5xl mx-auto px-5 py-10 border-t border-line text-sm text-muted flex flex-wrap justify-between gap-2">
      <span>Liquid Void. Built by someone who could have been doing literally anything else.</span>
      <span className="font-mono">wall {WALL_ID}</span>
    </Reveal>
  );
}
