import { MotionConfig } from 'motion/react';
import { ScrollBar } from './components/ScrollBar';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CpxBanner } from './components/CpxBanner';
import { OfferWall } from './components/OfferWall';
import { Estimator } from './components/Estimator';
import { Perks } from './components/Perks';
import { Faq } from './components/Faq';
import { Footer } from './components/Footer';
import { useTally } from './lib/useTally';

export default function App() {
  const tally = useTally();

  return (
    <MotionConfig reducedMotion="user">
      <ScrollBar />
      <Header points={tally.points} />
      <main>
        <Hero tally={tally} />
        <CpxBanner tally={tally} />
        <OfferWall tally={tally} />
        <Estimator />
        <Perks points={tally.points} />
        <Faq />
      </main>
      <Footer />
    </MotionConfig>
  );
}
