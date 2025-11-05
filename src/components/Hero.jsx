import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Video, KeyRound } from 'lucide-react';
import Spline from '@splinetool/react-spline';

export default function Hero() {
  const [showJoin, setShowJoin] = useState(false);
  const [code, setCode] = useState('');
  const backend = import.meta.env.VITE_BACKEND_URL;

  const goToRoom = (roomCode) => {
    const target = `/room/${roomCode}`;
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleCreate = async () => {
    try {
      const res = await fetch(`${backend}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scene: 'classroom' })
      });
      if (!res.ok) throw new Error('Failed to create room');
      const data = await res.json();
      goToRoom(data.code);
    } catch (e) {
      console.error(e);
      alert('Could not create room. Please try again.');
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    try {
      const res = await fetch(`${backend}/rooms/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() })
      });
      if (!res.ok) throw new Error('Room not found');
      const data = await res.json();
      setCode('');
      setShowJoin(false);
      goToRoom(data.code);
    } catch (e) {
      console.error(e);
      alert('Room not found. Check your code and try again.');
    }
  };

  return (
    <section className="relative h-[90vh] w-full overflow-hidden bg-gradient-to-b from-[#0b0f1a] via-[#0a0d18] to-[#0b0f1a]">
      {/* Spline 3D scene as full background */}
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/7m4PRZ7kg6K1jPfF/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Soft gradient and grid overlays for readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0f1a]/40 to-[#0b0f1a]" />
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.25),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.22),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.20),transparent_30%)]" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-6 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs backdrop-blur">
            <Rocket size={14} className="text-indigo-300" />
            <span className="text-indigo-200">Built Free for Testing</span>
          </div>

          <h1 className="text-3xl font-semibold leading-tight sm:text-5xl md:text-6xl">
            Bring your avatar to life in a 3D classroom.
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-indigo-200 sm:text-base">
            Join rooms, talk, and express yourself — as your avatar.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <GlowButton onClick={handleCreate}>
              <Video size={16} />
              Create Room
            </GlowButton>
            <GlowButton variant="outline" onClick={() => setShowJoin(true)}>
              <KeyRound size={16} />
              Join with Code
            </GlowButton>
          </div>
        </motion.div>

        {/* Floating hints */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-xs text-indigo-200/80"
        >
          AR/VR ready • WebRTC voice + text • Multi-user rooms
        </motion.div>
      </div>

      {/* Join dialog */}
      {showJoin && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0f1a]/90 p-6 text-white shadow-2xl backdrop-blur">
            <h3 className="mb-2 text-xl font-semibold">Join with Code</h3>
            <p className="mb-4 text-sm text-indigo-200/90">Enter a room code to jump into your 3D classroom.</p>
            <form onSubmit={handleJoin} className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. ABC123"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 outline-none placeholder:text-indigo-200/60 focus:border-indigo-400"
              />
              <button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 font-medium shadow-[0_0_24px_rgba(99,102,241,0.45)] transition hover:from-indigo-400 hover:to-violet-400"
              >
                Join
              </button>
            </form>
            <button onClick={() => setShowJoin(false)} className="mt-3 text-xs text-indigo-200 hover:text-white">Cancel</button>
          </div>
        </div>
      )}
    </section>
  );
}

function GlowButton({ children, onClick, variant = 'solid' }) {
  const base = 'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition focus:outline-none';
  if (variant === 'outline') {
    return (
      <button
        onClick={onClick}
        className={`${base} border border-indigo-400/40 bg-white/5 text-indigo-200 hover:border-indigo-400/70 hover:text-white`}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`${base} bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_0_30px_rgba(139,92,246,0.45)] hover:from-indigo-400 hover:to-violet-400`}
    >
      {children}
    </button>
  );
}
