"use client"

import { motion } from "framer-motion"
import { useI18n } from "@/lib/i18n"
import { Mail, ArrowUpRight } from "lucide-react"

export function CollaborationSection() {
  const { t } = useI18n()

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="border-moving-glow p-[2px] rounded-3xl overflow-hidden">
          <div className="bg-slate-950/80 backdrop-blur-3xl rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            {/* Background decorative glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold mb-8 uppercase tracking-widest">
                <Mail size={16} />
                {t("contacts")}
              </div>

              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                {t("readyToCollaborate")}
              </h2>

              <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
                {t("contactUsDesc")}
              </p>

              <a
                href="mailto:info@digital-tau.kz"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-black font-black text-xl
                           hover:bg-cyan-400 transition-colors group"
              >
                Contact Us
                <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
