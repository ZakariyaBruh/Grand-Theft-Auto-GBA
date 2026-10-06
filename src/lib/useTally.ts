import { useCallback, useEffect, useState } from 'react';

const UID_KEY = 'liquid-void:uid';

function getUid(): string {
  try {
    let id = localStorage.getItem(UID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(UID_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export type Status = 'loading' | 'ok' | 'offline';

/** Points are credited server-side by the CPAGrip postback; the browser only reads them. */
export function useTally() {
  const [uid] = useState(getUid);
  const [data, setData] = useState({ points: 0, offers: 0 });
  const [status, setStatus] = useState<Status>('loading');

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`/api/points?uid=${uid}`);
      if (!r.ok) throw new Error(String(r.status));
      setData(await r.json());
      setStatus('ok');
    } catch {
      setStatus('offline');
    }
  }, [uid]);

  useEffect(() => {
    refresh();
    const t = window.setInterval(() => { if (!document.hidden) refresh(); }, 15000);
    return () => window.clearInterval(t);
  }, [refresh]);

  return { uid, ...data, status, refresh };
}

export type Tally = ReturnType<typeof useTally>;
