import { useEffect, useMemo, useState } from 'react';
import Hero from './components/Hero';
import Features from './components/Features';
import TechStack from './components/TechStack';
import CTAAndFooter from './components/CTAAndFooter';
import Room from './components/Room';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const roomCode = useMemo(() => {
    const match = path.match(/^\/room\/([A-Za-z0-9_-]+)$/);
    return match ? match[1] : null;
  }, [path]);

  if (roomCode) {
    return (
      <div className="min-h-screen w-full bg-[#070a13] font-[Inter] text-white">
        <Room code={roomCode.toUpperCase()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#070a13] font-[Inter] text-white">
      <Hero />
      <Features />
      <TechStack />
      <CTAAndFooter />
    </div>
  );
}
