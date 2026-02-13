"use client"

import Link from "next/link"
import { ArrowRight, Cpu, Sparkles, Globe, BrainCircuit } from "lucide-react"
import { motion } from "framer-motion"
import { useI18n } from "@/lib/i18n"
import { SphereCanvas } from "./sphere-canvas"

export function HeroSection() {
  const { t } = useI18n()

  const ribbonText1 = t("futureExcellence")
  const ribbonText2 = t("digitalTransformation")

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      <div className="container mx-auto px-4 z-10 flex flex-col lg:flex-row items-center gap-12">
        {/* Left Side: Text Content */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter leading-none">
              <span className="block text-white opacity-90">DIGITAL</span>
              <span className="block text-metallic text-glitch py-2">TAU</span>
            </h1>

            <p className="text-xl md:text-2xl text-cyan-400 font-medium mb-2 tracking-wide uppercase">
              {t("innovationShowcase")}
            </p>

            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-xl">
              {t("whereIdeasMeet")}
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                href="/projects"
                className="group relative px-8 py-4 rounded-full bg-cyan-600 text-white font-bold text-lg
                           overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-2">
                  {t("exploreProjects")}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <button className="px-8 py-4 rounded-full border border-cyan-500/30 text-cyan-400 font-bold text-lg
                                 hover:bg-cyan-500/10 transition-colors glass">
                {t("learnMore")}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Side: 3D Element */}
        <div className="flex-1 w-full h-[400px] md:h-[600px] relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="w-full h-full"
          >
            <SphereCanvas />
          </motion.div>

          {/* Decorative floating labels/levers */}
          <div className="absolute top-1/4 right-0 glass-cyan p-3 rounded-lg animate-float hidden md:block">
            <Cpu className="text-cyan-400 mb-1" size={20} />
            <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest">Core AI</div>
          </div>

          <div className="absolute bottom-1/4 left-0 glass-cyan p-3 rounded-lg animate-float [animation-delay:1.5s] hidden md:block">
            <Globe className="text-purple-400 mb-1" size={20} />
            <div className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">Network</div>
          </div>
        </div>
      </div>

      {/* Dual Running Ribbons (Marquees) */}
      <div className="w-full mt-20 relative space-y-4 pb-10">
        <div className="bg-cyan-950/20 border-y border-cyan-500/10 py-3 overflow-hidden whitespace-nowrap">
          <div className="inline-block animate-marquee-l">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="inline-flex items-center mx-4 text-cyan-500/60 font-bold uppercase tracking-widest text-sm">
                <Sparkles size={14} className="mr-2" />
                {ribbonText1}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-purple-950/20 border-y border-purple-500/10 py-3 overflow-hidden whitespace-nowrap">
          <div className="inline-block animate-marquee-r">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="inline-flex items-center mx-4 text-purple-500/60 font-bold uppercase tracking-widest text-sm">
                <BrainCircuit size={14} className="mr-2" />
                {ribbonText2}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  )
}
