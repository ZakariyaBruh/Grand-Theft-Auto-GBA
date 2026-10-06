const items: [string, string][] = [
  ['What do I get?', 'Void Points. They can’t be spent, sold or explained. They do unlock a timer.'],
  ['Is this a scam?', 'Scams promise you something.'],
  ['Where do my answers go?', 'To the survey company, who will email you about it until one of you dies. This site keeps a random ID and a number.'],
  ['How much does Zak make?', 'About $1.42 a survey. Some pay $0.80, some $2.10. A good day is a sandwich.'],
  ['I got screened out.', 'Everyone does. Nobody gets paid for those, me included. Try another one.'],
  ['Why doesn’t Zak get a job?', 'He looked. They want five years of experience in something that’s four years old.'],
];

export function Faq() {
  return (
    <section id="faq" className="max-w-5xl mx-auto px-5 py-16 border-t border-line">
      <h2 className="text-3xl font-extrabold tracking-tight">Questions you were going to ask</h2>
      <dl className="mt-8 grid md:grid-cols-2 gap-x-14 gap-y-8">
        {items.map(([q, a]) => (
          <div key={q}>
            <dt className="font-semibold text-lg">{q}</dt>
            <dd className="mt-1 text-ink/70">{a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
