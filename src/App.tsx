import { useState } from 'react';
import { MotionConfig } from 'motion/react';
import { ScrollBar } from './components/ScrollBar';
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
  const [devStatus, setDevStatus] = useState<string | null>(null);

  const simulateSurvey = async () => {
    setDevStatus('Simulating...');
    const txid = Math.random().toString(36).substring(2);
    const url = `/api/postback?secret=dev-secret&uid=${tally.uid}&txid=${txid}&payout=1.42`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        setDevStatus('Success! +100 points.');
        tally.refresh();
        setTimeout(() => setDevStatus(null), 3000);
      } else {
        const txt = await res.text();
        setDevStatus('Failed: ' + txt);
        setTimeout(() => setDevStatus(null), 5000);
      }
    } catch (e: any) {
      setDevStatus('Error: ' + (e?.message || e));
      setTimeout(() => setDevStatus(null), 5000);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <ScrollBar />
      <Header points={tally.points} />
      <main>
        <Hero tally={tally} />
        <OfferWall tally={tally} />
        <Estimator />
        <Perks points={tally.points} uid={tally.uid} />
        <Faq />
      </main>
      <Footer />

      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#0a0a0c]/90 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-md max-w-xs text-xs flex flex-col gap-2">
          <div className="font-bold text-[#e8ff47]">Dev Simulator</div>
          <p className="text-stone-400 text-[11px] leading-snug">
            Since Upstash Redis is in-memory by default, use this button to simulate CPAGrip postback webhooks locally.
          </p>
          <button
            onClick={simulateSurvey}
            className="w-full bg-[#e8ff47] text-black font-semibold px-3 py-2 rounded-lg hover:bg-white active:scale-95 transition-all cursor-pointer text-center"
          >
            Simulate 1 Survey (+100 pts)
          </button>
          {devStatus && (
            <div className="text-[11px] font-mono text-center mt-1 p-1 bg-white/5 rounded text-white border border-white/5">
              {devStatus}
            </div>
          )}
        </div>
      )}
    </MotionConfig>
  );
}
