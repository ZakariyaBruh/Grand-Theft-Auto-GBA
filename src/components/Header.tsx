export function Header({ points }: { points: number }) {
  return (
    <header className="sticky top-0 z-30 glass border-x-0 border-t-0 rounded-none">
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        <a href="#" className="font-serif text-xl font-semibold">Liquid Void</a>
        <nav className="flex items-center gap-5 text-sm">
          <a href="#offers" className="hidden sm:block text-muted hover:text-ink">Offers</a>
          <a href="#perks" className="hidden sm:block text-muted hover:text-ink">Perks</a>
          <a href="#faq" className="hidden sm:block text-muted hover:text-ink">FAQ</a>
          <a href="#perks" className="glass-btn rounded-full px-3 py-1 tabular-nums">
            {points.toLocaleString()} void pts
          </a>
        </nav>
      </div>
    </header>
  );
}
