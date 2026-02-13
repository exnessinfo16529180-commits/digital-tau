"use client"

import { Globe, Mail, MapPin, Instagram, Youtube } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="relative border-t border-cyan-500/10 bg-slate-950/80 backdrop-blur-2xl py-16 overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-white tracking-tighter">
              DIGITAL <span className="text-metallic">TAU</span>
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              {t("footerDesc")}
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-cyan-400 hover:border-cyan-500/50 transition-all">
                <Instagram size={20} />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-cyan-400 hover:border-cyan-500/50 transition-all">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black text-cyan-500 uppercase tracking-[0.3em]">
              {t("contacts")}
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:info@digital-tau-edu.kz" className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors">
                  <Mail size={16} className="text-cyan-500/50" />
                  info@digital-tau-edu.kz
                </a>
              </li>
              <li>
                <a href="https://digital.tau-edu.kz" className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors">
                  <Globe size={16} className="text-cyan-500/50" />
                  digital.tau-edu.kz
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black text-cyan-500 uppercase tracking-[0.3em]">
              Location
            </h4>
            <div className="flex items-start gap-3 text-sm text-slate-400">
              <MapPin size={16} className="text-cyan-500/50 mt-1 shrink-0" />
              <div>
                <p className="font-bold text-white">{t("universityName")}</p>
                <p>{t("tarazKazakhstan")}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
             <h4 className="text-xs font-black text-cyan-500 uppercase tracking-[0.3em]">
              Partners
            </h4>
            <div className="flex flex-wrap gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <img src="/images/cisco-logo.jpg" alt="Cisco" className="h-8 w-auto rounded" />
              <img src="/images/huawei-logo.png" alt="Huawei" className="h-8 w-auto rounded" />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            © 2025 DIGITAL TAU HUB. {t("copyright")}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-cyan-500 transition-colors">{t("privacy")}</a>
            <a href="#" className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-cyan-500 transition-colors">{t("terms")}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
