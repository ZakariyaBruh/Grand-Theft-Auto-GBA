export function Header({ points }: { points: number }) {
  return (
    <header className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
      <a href="#" className="text-lg font-extrabold tracking-tight">Liquid Void</a>
      <a href="#perks" className="font-mono text-sm text-muted hover:text-accent">
        {points.toLocaleString()} void pts
      </a>
    </header>
  );
}
