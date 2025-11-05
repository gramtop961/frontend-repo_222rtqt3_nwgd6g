import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Users, DoorOpen, Loader2 } from 'lucide-react';
import Spline from '@splinetool/react-spline';

export default function Room({ code }) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(false);
  const backend = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    let active = true;
    async function fetchRoom() {
      try {
        const res = await fetch(`${backend}/rooms/${code}`);
        if (!res.ok) throw new Error('Room not found');
        const data = await res.json();
        if (active) setRoom(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchRoom();
    return () => {
      active = false;
    };
  }, [backend, code]);

  const sceneUrl = useMemo(() => {
    if (!room) return null;
    // For demo, use the same Spline hero as a dynamic background.
    return 'https://prod.spline.design/7m4PRZ7kg6K1jPfF/scene.splinecode';
  }, [room]);

  const leave = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <section className="relative min-h-[100vh] w-full overflow-hidden bg-[#070a13]">
      <div className="absolute inset-0">
        {sceneUrl && (
          <Spline scene={sceneUrl} style={{ width: '100%', height: '100%' }} />
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#070a13]/30 via-[#070a13]/50 to-[#070a13]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Room {code}</h1>
            <p className="text-sm text-indigo-200/80">Scene: {room?.scene ?? 'loading...'}</p>
          </div>
          <button onClick={leave} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-indigo-200 transition hover:border-indigo-400/60 hover:text-white">
            <DoorOpen size={16} /> Leave
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur lg:col-span-2">
            <div className="flex h-[50vh] items-center justify-center rounded-xl border border-white/5 bg-black/20">
              {loading ? (
                <div className="flex items-center gap-2 text-indigo-200">
                  <Loader2 className="animate-spin" size={18} /> Connecting to 3D classroom...
                </div>
              ) : (
                <div className="text-center text-indigo-100">
                  <div className="text-lg">AR/VR video call is initializing</div>
                  <div className="mt-1 text-sm opacity-80">Voice via WebRTC • Avatars via Ready Player Me • WebXR coming soon</div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-100"><Users size={16} /> Participants</div>
                <span className="text-xs text-indigo-200/80">Live</span>
              </div>
              <div className="mt-3 space-y-2 text-sm text-indigo-200/90">
                <div className="flex items-center justify-between">
                  <span>You</span>
                  <span className="opacity-70">Connected</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="text-indigo-100">Controls</span>
                <button
                  onClick={() => setMuted((m) => !m)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                    muted
                      ? 'bg-white/5 text-indigo-200 border border-white/10'
                      : 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_0_18px_rgba(139,92,246,0.35)]'
                  }`}
                >
                  {muted ? <MicOff size={16} /> : <Mic size={16} />} {muted ? 'Unmute' : 'Mute'}
                </button>
              </div>
              <p className="mt-3 text-xs text-indigo-200/80">Tip: Use headphones for best spatial audio experience.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
