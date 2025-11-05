import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Mail, Github } from 'lucide-react';

export default function CTAAndFooter() {
  return (
    <section className="w-full bg-[#0b0f1a]">
      <div className="mx-auto max-w-7xl px-6 py-16 text-white">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-sky-500/10 p-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h3 className="text-2xl font-semibold sm:text-3xl">Start your 3D classroom now</h3>
              <p className="mt-2 text-sm text-indigo-100/90">Join free — no downloads needed</p>
              <div className="mt-3 inline-flex items-center gap-2 text-xs text-indigo-200">
                <BadgeCheck size={14} className="text-indigo-300" /> Built Free for Testing
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_30px_rgba(139,92,246,0.45)] transition hover:from-indigo-400 hover:to-violet-400"
              >
                Get Started
                <ArrowRight size={16} />
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/40 bg-white/5 px-5 py-2.5 text-sm font-medium text-indigo-200 transition hover:border-indigo-400/70 hover:text-white"
              >
                Join Beta
              </a>
            </div>
          </motion.div>
        </div>

        <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-indigo-200/90 md:flex-row">
          <div className="text-sm">© {new Date().getFullYear()} AvatarMeet — Metaverse for Students</div>
          <div className="flex items-center gap-5 text-sm">
            <a href="#" className="hover:text-white">GitHub</a>
            <a href="#" className="hover:text-white">Docs</a>
            <a href="#" className="hover:text-white">Join Beta</a>
          </div>
        </footer>
      </div>
    </section>
  );
}
