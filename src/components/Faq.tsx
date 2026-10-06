const items: [string, string, string][] = [
  ['What do I get?', 'Points and a few perks.', 'No cash, goods or crypto. The perks are a session timer, a privacy checklist and a printable certificate.'],
  ['Is it a scam?', 'No. Nothing is promised to you.', 'Scams promise payouts. This one says up front that you get none. The offers themselves belong to CPA Grip.'],
  ['Where do my answers go?', 'To the survey sponsor.', 'This site has no database and stores nothing except your points count, in your own browser. Sponsors will use your answers and email as they see fit.'],
  ['How much does Zak get?', 'Roughly $0.80 to $2.10 per finished offer.', 'Only offers that actually complete count, and payouts vary by offer and country.'],
  ['Can I do several?', 'Yes, as many as you like.', 'Some offers disqualify you partway through. That is normal and nobody gets paid for those.'],
  ['Why not get a normal job?', 'This is a side project.', 'It costs nothing to run and I wanted to build something small.'],
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-line">
      <div className="max-w-3xl mx-auto px-5 py-14">
        <h2 className="font-serif text-3xl">Questions</h2>
        <div className="mt-6 divide-y divide-line border-y border-line">
          {items.map(([q, short, long]) => (
            <details key={q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4">
                <span className="font-medium">{q}</span>
                <span className="text-sm text-muted text-right">{short}</span>
              </summary>
              <p className="mt-3 text-muted max-w-xl">{long}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
