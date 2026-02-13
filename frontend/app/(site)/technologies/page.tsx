"use client"

import { useEffect, useMemo, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { getTechnologies } from "@/lib/api"
import { ArrowRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { JSX } from "react/jsx-runtime"

function hashToColorHex(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  }
  const hue = hash % 360
  const sat = 70
  const light = 55
  const s = sat / 100
  const l = light / 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (hue < 60) [r, g, b] = [c, x, 0]
  else if (hue < 120) [r, g, b] = [x, c, 0]
  else if (hue < 180) [r, g, b] = [0, c, x]
  else if (hue < 240) [r, g, b] = [0, x, c]
  else if (hue < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function normalizeTechKey(name: string) {
  return String(name || "").toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9/_-]+/g, "")
}

function TechIcon({ name, color }: { name: string; color: string }) {
  const iconMap: Record<string, JSX.Element> = {
    react: (
      <svg viewBox="0 0 24 24" fill={color} className="w-12 h-12">
        <path d="M12 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0-9c-4.968 0-9 2.462-9 5.5s4.032 5.5 9 5.5 9-2.462 9-5.5-4.032-5.5-9-5.5Zm0 10c-4.136 0-7.5-2.015-7.5-4.5S7.864 5.5 12 5.5s7.5 2.015 7.5 4.5-3.364 4.5-7.5 4.5Z"/>
        <ellipse cx="12" cy="12" rx="9" ry="5.5" stroke={color} fill="none" strokeWidth="1.5"/>
        <ellipse cx="12" cy="12" rx="9" ry="5.5" stroke={color} fill="none" strokeWidth="1.5" transform="rotate(60 12 12)"/>
        <ellipse cx="12" cy="12" rx="9" ry="5.5" stroke={color} fill="none" strokeWidth="1.5" transform="rotate(120 12 12)"/>
      </svg>
    ),
    // ... other icons can be added here if needed, but the char fallback is good too
  }
  return iconMap[name] || (
    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black" style={{ backgroundColor: `${color}20`, color }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default function TechnologiesPage() {
  const { t } = useI18n()
  const [items, setItems] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTechnologies().then(res => {
      const data = Array.isArray(res) && res.length > 0 ? res : ["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "Three.js", "Python", "Docker", "PostgreSQL", "Unity"]
      setItems(data)
      setLoading(false)
    }).catch(() => {
      setItems(["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "Three.js", "Python", "Docker", "PostgreSQL", "Unity"])
      setLoading(false)
    })
  }, [])

  const techUi = useMemo(() => {
    return items.map(name => {
      const key = normalizeTechKey(name)
      const color = hashToColorHex(name)
      return { name, iconKey: key, color }
    })
  }, [items])

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-cyan border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-[0.3em] mb-6"
          >
            <Sparkles size={14} />
            Stack of the Future
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
            <span className="text-white">OUR </span>
            <span className="text-metallic">TECHNOLOGIES</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            {t("cuttingEdgeTech")}
          </p>
        </div>

        {/* Technology Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-6xl mx-auto mb-20">
          {loading ? (
            <div className="col-span-full text-center py-20 text-cyan-500/50 animate-pulse font-black uppercase tracking-widest">
              Initializing systems...
            </div>
          ) : (
            techUi.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group glass border border-cyan-500/10 rounded-2xl p-8 text-center hover:border-cyan-400/50 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-cyan-500/20 rounded-tr-2xl group-hover:border-cyan-500/50 transition-colors" />
                <div className="flex justify-center mb-6 transform group-hover:scale-110 transition-transform">
                  <TechIcon name={tech.iconKey} color={tech.color} />
                </div>
                <h3 className="font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                  {tech.name}
                </h3>
              </motion.div>
            ))
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center relative py-20">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-cyan-500/50 to-transparent" />
           <p className="text-slate-400 text-xl font-bold mb-10 max-w-2xl mx-auto">
             {t("andManyMore")}
           </p>
           <a href="/projects" className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-cyan-600 text-black font-black text-lg hover:bg-cyan-400 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-cyan-500/20">
             {t("exploreProjects")}
             <ArrowRight size={22} />
           </a>
        </div>
      </div>
    </div>
  )
}
