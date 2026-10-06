import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { OfferWall } from './components/OfferWall';
import { Estimator } from './components/Estimator';
import { Perks } from './components/Perks';
import { Faq } from './components/Faq';
import { Footer } from './components/Footer';
import { useTally } from './lib/useTally';

export default function App() {
  const tally = useTally();

  return (
    <>
      <Header points={tally.points} />
      <main>
        <Hero tally={tally} />
        <OfferWall tally={tally} />
        <Estimator />
        <Perks points={tally.points} />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
