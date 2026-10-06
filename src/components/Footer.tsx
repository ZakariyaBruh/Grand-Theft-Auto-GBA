import { WALL_ID } from '../lib/config';

export function Footer() {
  return (
    <footer className="border-t border-line py-8 text-sm text-muted">
      <div className="max-w-5xl mx-auto px-5 flex flex-wrap justify-between gap-2">
        <span>Liquid Void · all proceeds go to Zak</span>
        <span>Offer wall {WALL_ID}</span>
      </div>
    </footer>
  );
}
