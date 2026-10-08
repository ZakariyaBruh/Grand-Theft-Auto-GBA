import { useState } from 'react';
import { Globe, Loader2, Power, X } from 'lucide-react';
import { Reveal } from './Reveal';
import { Rule } from './Rule';
import { SplitWords } from './SplitWords';

/** A cloud Chromium on Hyperbeam's US servers, started by a button. */
export function CloudBrowser({ uid }: { uid: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function activate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/hyperbeam?uid=${encodeURIComponent(uid)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setUrl(data.embed_url);
    } catch (err: any) {
      setError(err.message || 'Could not start the browser.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="browser" className="max-w-5xl mx-auto px-5 pb-16">
      <Rule />
      <Reveal>
        <SplitWords inView text="The Cloud Browser" className="text-3xl font-extrabold tracking-tight" />
        <p className="mt-2 text-muted max-w-xl">
          A real Chromium running on a US server, streamed into this page. Press the button and it starts in a few seconds.
        </p>
      </Reveal>

      <div className="mt-6">
        {!url ? (
          <div className="glass rounded-3xl p-8 text-center">
            <button
              onClick={activate}
              disabled={loading}
              className="btn active:scale-95 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-black"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
              {loading ? 'Starting browser…' : 'Activate browser (US server)'}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
              <Globe className="w-3.5 h-3.5" /> Runs for up to 15 minutes, or 2 minutes after you stop using it.
            </p>
            {error && <p className="mt-4 text-sm text-red-300" role="alert">{error}</p>}
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-line bg-black">
            <div className="flex items-center justify-between px-4 py-2 text-xs text-muted bg-white/5">
              <span className="font-mono">Cloud browser · US server</span>
              <button onClick={() => setUrl(null)} className="inline-flex items-center gap-1 hover:text-ink">
                <X className="w-3.5 h-3.5" /> Close
              </button>
            </div>
            <iframe
              src={url}
              title="Cloud browser"
              className="block h-[560px] w-full"
              allow="autoplay; clipboard-read; clipboard-write; fullscreen"
            />
          </div>
        )}
      </div>
    </section>
  );
}
