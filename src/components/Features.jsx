import { motion } from 'framer-motion';
import { Users, KeyRound, Mic, MessagesSquare, Rocket, Globe2, Sparkles } from 'lucide-react';

const features = [
  {
    icon: KeyRound,
    title: 'Room Code Access',
    desc: 'Jump in with a simple room code. No signup required for guests.'
  },
  {
    icon: Users,
    title: 'Multi-user Classrooms',
    desc: 'Collaborate with classmates and instructors in shared spaces.'
  },
  {
    icon: Mic,
    title: 'Real-time Voice Chat',
    desc: 'Crystal clear voice powered by WebRTC, optimized for groups.'
  },
  {
    icon: MessagesSquare,
    title: 'Text Chat',
    desc: 'Keep side conversations flowing with built-in room chat.'
  },
  {
    icon: Sparkles,
    title: '3D Avatars',
    desc: 'Live lip sync and expressive gestures bring your persona to life.'
  },
  {
    icon: Globe2,
    title: 'Immersive Backgrounds',
    desc: 'Switch scenes: Classroom, Space Lab, Nature — fully 3D and dynamic.'
  }
];

export default function Features() {
  return (
    <section className="relative w-full bg-[#0b0f1a] py-20">
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(600px_200px_at_10%_20%,rgba(99,102,241,0.15),transparent),radial-gradient(600px_200px_at_90%_10%,rgba(139,92,246,0.12),transparent)]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-2xl font-semibold text-white sm:text-4xl"
        >
          Built for immersive learning
        </motion.h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-indigo-200/90 sm:text-base">
          Expressive avatars, spatial presence, and realtime collaboration – all in your browser.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur hover:border-indigo-400/40"
            >
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 blur-2xl" />
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-300">
                <f.icon size={18} />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-indigo-200/90">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          <HighlightCard title="AR/VR Ready (WebXR)" desc="Step into rooms using AR on mobile or VR headsets with WebXR support." />
          <HighlightCard title="WebRTC Core" desc="Low-latency media for voice and future video streams, designed for classrooms." />
          <HighlightCard title="Scene Presets" desc="Pick from Classroom, Space Lab, or Nature backdrops — or bring your own." />
        </div>
      </div>
    </section>
  );
}

function HighlightCard({ title, desc }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f1424] to-[#0b0f1a] p-6 text-white">
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(400px_120px_at_0%_0%,rgba(99,102,241,0.35),transparent),radial-gradient(400px_120px_at_100%_100%,rgba(139,92,246,0.35),transparent)]" />
      <div className="relative">
        <h4 className="text-base font-semibold">{title}</h4>
        <p className="mt-2 text-sm text-indigo-200/90">{desc}</p>
      </div>
    </div>
  );
}
