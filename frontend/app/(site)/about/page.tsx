"use client"

import { useI18n } from "@/lib/i18n"
import { motion } from "framer-motion"
import { Sparkles, University, ShieldCheck, Cpu } from "lucide-react"

export default function AboutPage() {
  const { t } = useI18n()

  const milestones = [
    { icon: University, textKey: "foundedYear" },
    { icon: Cpu, textKey: "researchProjects" },
    { icon: ShieldCheck, textKey: "activeStudents" },
    { icon: Sparkles, textKey: "globalPartnerships" },
  ]

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-cyan border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-[0.3em] mb-8"
          >
            <ShieldCheck size={14} />
            Academic Excellence
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8">
            <span className="text-white">ABOUT </span>
            <span className="text-metallic uppercase">Digital TAU</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed font-medium">
            {t("aboutDesc")}
          </p>
        </div>

        {/* University Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-video rounded-3xl overflow-hidden border border-cyan-500/20 glass p-1">
              <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center relative overflow-hidden">
                <img src="/images/tau-logo.jpg" alt="University" className="w-32 h-32 opacity-50 grayscale hover:grayscale-0 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent" />
              </div>
            </div>
            {/* Lever decoration */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-3xl pointer-events-none" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6 uppercase tracking-tight">
              {t("universityName")}
            </h2>
            <p className="text-cyan-500 font-bold mb-6 tracking-widest uppercase text-sm">
              {t("tarazKazakhstan")}
            </p>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              {t("universityDesc")}
            </p>
          </motion.div>
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {milestones.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass border border-white/5 rounded-2xl p-8 text-center hover:border-cyan-500/30 transition-all group"
            >
              <item.icon size={32} className="mx-auto mb-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <div className="text-white font-black text-lg tracking-tight uppercase">
                {t(item.textKey)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
