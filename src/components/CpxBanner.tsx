import { useEffect } from 'react';
import { Reveal } from './Reveal';
import type { Tally } from '../lib/useTally';

const LIB = 'https://cdn.cpx-research.com/assets/js/script_tag_v2.0.js';
const DIV_ID = 'cpx-banner';

declare global {
  interface Window { config?: unknown }
}

/**
 * CPX Research "Single Sidebar" widget (design 3): one survey as a wide strip.
 * Themed through CPX's style_config as black liquid glass; the glass blur itself is plain CSS in index.css.
 */
export function CpxBanner({ tally }: { tally: Tally }) {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let cfg: { appId: string; secureHash: string };
      try {
        const r = await fetch(`/api/cpx-config?uid=${encodeURIComponent(tally.uid)}`);
        if (!r.ok) return;
        cfg = await r.json();
      } catch { return; }
      if (cancelled) return;

      const oldScript = document.getElementById('cpx-lib');
      if (oldScript) oldScript.remove();
      const div = document.getElementById(DIV_ID);
      if (div) div.innerHTML = '';

      const script3 = { div_id: DIV_ID, theme_style: 3, display_mode: 2 };
      window.config = {
        general_config: {
          app_id: Number(cfg.appId),
          ext_user_id: tally.uid,
          secure_hash: cfg.secureHash,
          email: '',
          username: '',
          subid_1: '',
          subid_2: '',
        },
        style_config: {
          text_color: '#ecece6',
          survey_box: {
            topbar_background_color: 'rgba(10,10,12,0.72)',
            box_background_color: 'rgba(10,10,12,0.72)',
            rounded_borders: true,
            stars_filled: '#e8ff47',
          },
        },
        script_config: [script3],
        debug: false,
        useIFrame: true,
        iFramePosition: 1,
        functions: {},
      };
      const s = document.createElement('script');
      s.id = 'cpx-lib';
      s.src = LIB;
      s.async = true;
      document.body.appendChild(s);
    })();
    return () => { cancelled = true; };
  }, [tally.uid]);

  return (
    <section aria-label="Featured survey" className="max-w-5xl mx-auto px-5 pb-12">
      <Reveal>
        <div id={DIV_ID} className="cpx-glass w-full min-h-[150px]" style={{ height: 150 }} />
      </Reveal>
    </section>
  );
}
