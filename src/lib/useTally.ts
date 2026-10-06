import { useCallback, useEffect, useState } from 'react';
import { POINTS_PER_OFFER } from './config';

const KEY = 'liquid-void:offers';

function read(): number {
  try {
    const n = parseInt(localStorage.getItem(KEY) ?? '0', 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function useTally() {
  const [offers, setOffers] = useState(read);

  useEffect(() => {
    try { localStorage.setItem(KEY, String(offers)); } catch { /* storage blocked */ }
  }, [offers]);

  const add = useCallback(() => setOffers(n => n + 1), []);
  const undo = useCallback(() => setOffers(n => Math.max(0, n - 1)), []);

  return { offers, points: offers * POINTS_PER_OFFER, add, undo };
}
