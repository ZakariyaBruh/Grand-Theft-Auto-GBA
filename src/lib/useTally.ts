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

/** Points are credited server-side by the CPX Research postback; the browser only reads them. */
export function useTally() {
  const [uid, setUid] = useState(getUid);
  const [data, setData] = useState({ points: 0, offers: 0 });
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`/api/points?uid=${uid}`);
      if (!r.ok) {
        let msg = 'Our servers have run out of storage';
        try {
          const errData = await r.json();
          if (errData?.error) msg = errData.error;
        } catch {}
        setErrorMessage(msg);
        setStatus('offline');
        return;
      }
      setData(await r.json());
      setErrorMessage(null);
      setStatus('ok');
    } catch {
      setErrorMessage('Our servers have run out of storage');
      setStatus('offline');
    }
  }, [uid]);

  useEffect(() => {
    refresh();
    const t = window.setInterval(() => { if (!document.hidden) refresh(); }, 15000);
    return () => window.clearInterval(t);
  }, [refresh]);

  const changeUid = useCallback((nextUid: string) => {
    const normalized = nextUid.trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normalized)) {
      return false;
    }
    try {
      localStorage.setItem(UID_KEY, normalized);
    } catch {
      // The in-memory value still lets the current session continue.
    }
    setUid(normalized);
    setData({ points: 0, offers: 0 });
    setStatus('loading');
    return true;
  }, []);

  return { uid, ...data, status, errorMessage, refresh, changeUid };
}

export type Tally = ReturnType<typeof useTally>;
