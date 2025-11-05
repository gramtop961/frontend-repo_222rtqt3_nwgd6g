import { motion } from 'framer-motion';
import { Boxes, Github, Server, Layers, Database, Globe } from 'lucide-react';

const stack = [
  { icon: Boxes, label: 'React + Three.js frontend' },
  { icon: Server, label: 'Node.js + WebRTC backend' },
  { icon: Layers, label: 'Ready Player Me avatars' },
  { icon: Database, label: 'Firebase / Supabase database' },
  { icon: Globe, label: 'Hosted free on Vercel' }
];

export default function TechStack() {
  return (
    <section className="relative w-full bg-[#080c16] py-18 py-20">
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(700px_160px_at_50%_10%,rgba(14,165,233,0.12),transparent),radial-gradient(600px_160px_at_50%_100%,rgba(139,92,246,0.12),transparent)]" />
      <div className="relative mx-auto max-w-7xl px-6 text-white">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-2xl font-semibold sm:text-4xl"
        >
          Tech that powers AvatarMeet
        </motion.h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-indigo-200/90 sm:text-base">
          A modern stack focused on realtime performance and immersive 3D experiences.
        </p>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
          {stack.map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur"
            >
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-300">
                <s.icon size={18} />
              </div>
              <span className="text-sm text-indigo-100">{s.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/40 bg-white/5 px-4 py-2 text-sm text-indigo-200 transition hover:border-indigo-400/70 hover:text-white"
          >
            <Github size={16} />
            GitHub
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm text-white shadow-[0_0_24px_rgba(99,102,241,0.45)] transition hover:from-indigo-400 hover:to-violet-400"
          >
            Docs
          </a>
        </div>
      </div>
    </section>
  );
}
