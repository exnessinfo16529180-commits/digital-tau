"use client"

import { motion } from "framer-motion"
import { useI18n } from "@/lib/i18n"
import { Rocket, Target, Users, Zap } from "lucide-react"

const features = [
  {
    icon: Rocket,
    titleKey: "innovation",
    descKey: "innovationDesc",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    glowColor: "group-hover:shadow-cyan-500/20"
  },
  {
    icon: Target,
    titleKey: "impact",
    descKey: "impactDesc",
    color: "text-purple-400",
    borderColor: "border-purple-500/30",
    glowColor: "group-hover:shadow-purple-500/20"
  },
  {
    icon: Users,
    titleKey: "collaboration",
    descKey: "collaborationDesc",
    color: "text-gold-metallic",
    borderColor: "border-yellow-500/30",
    glowColor: "group-hover:shadow-yellow-500/20"
  },
  {
    icon: Zap,
    titleKey: "diversity",
    descKey: "diversityDesc",
    color: "text-burgundy-uni",
    borderColor: "border-red-900/30",
    glowColor: "group-hover:shadow-red-900/20"
  }
]

export function WhyDigitalTau() {
  const { t } = useI18n()

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            <span className="text-white">{t("whyDigitalTau").split(" ")[0]} </span>
            <span className="text-metallic">{t("whyDigitalTau").split(" ").slice(1).join(" ")}</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group relative p-8 rounded-2xl glass border ${item.borderColor}
                         transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${item.glowColor}`}
            >
              <div className={`mb-6 p-3 rounded-xl bg-white/5 inline-block ${item.color}`}>
                <item.icon size={32} />
              </div>

              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                {t(item.titleKey)}
              </h3>

              <p className="text-slate-400 leading-relaxed">
                {t(item.descKey)}
              </p>

              {/* Decorative line specified by user */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

              {/* Corner accent (lever look) */}
              <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 ${item.borderColor} rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
