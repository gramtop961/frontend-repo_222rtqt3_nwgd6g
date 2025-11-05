import Hero from './components/Hero';
import Features from './components/Features';
import TechStack from './components/TechStack';
import CTAAndFooter from './components/CTAAndFooter';

export default function App() {
  return (
    <div className="min-h-screen w-full bg-[#070a13] font-[Inter] text-white">
      <Hero />
      <Features />
      <TechStack />
      <CTAAndFooter />
    </div>
  );
}
