import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Reveal } from './Reveal';
import { Rule } from './Rule';
import type { Tally } from '../lib/useTally';

export function Footer({ tally }: { tally?: Tally }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!tally) return;
    try {
      await navigator.clipboard.writeText(tally.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-5">
      <Rule />
      <Reveal className="py-10 text-sm text-muted flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span>Liquid Void. Built by someone who could have been doing literally anything else.</span>
          {tally && (
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="text-muted/70">CPX ID:</span>
              <span className="text-ink bg-white/5 px-2 py-0.5 rounded border border-line" title={tally.uid}>
                {tally.uid}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy full CPX ID"
                className="hover:text-accent p-1 transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-accent" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          )}
        </div>
        <span className="font-mono text-xs text-muted/80">surveys by CPX Research</span>
      </Reveal>
    </div>
  );
}
