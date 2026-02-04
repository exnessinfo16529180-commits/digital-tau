"use client"

import { useEffect, useMemo, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { getTechnologies } from "@/lib/api"
import { ArrowRight } from "lucide-react"
import { JSX } from "react/jsx-runtime"

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "")

function hashToColorHex(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  }
  const hue = hash % 360
  const sat = 70
  const light = 55

  // hsl -> rgb -> hex
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
  return String(name || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9/_-]+/g, "")
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
    python: (
      <svg viewBox="0 0 24 24" fill={color} className="w-12 h-12">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Zm-1.5 3h3a1.5 1.5 0 0 1 1.5 1.5V9h-6V6.5A1.5 1.5 0 0 1 10.5 5Zm3 14h-3a1.5 1.5 0 0 1-1.5-1.5V15h6v2.5a1.5 1.5 0 0 1-1.5 1.5Z"/>
      </svg>
    ),
    nodejs: (
      <svg viewBox="0 0 24 24" fill={color} className="w-12 h-12">
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2Zm0 18.5L4 17V8l8 4v8.5Zm8-3.5-8 3.5V12l8-4v9Z"/>
      </svg>
    ),
    tensorflow: (
      <svg viewBox="0 0 24 24" fill={color} className="w-12 h-12">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8Zm-2-10h4v6h-4v-6Zm0-4h4v2h-4V6Z"/>
      </svg>
    ),
    arduino: (
      <svg viewBox="0 0 24 24" fill={color} className="w-12 h-12">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 14H8v-2h2v2Zm0-4H8V8h2v4Zm6 4h-2v-2h2v2Zm0-4h-2V8h2v4Z"/>
      </svg>
    ),
    unity: (
      <svg viewBox="0 0 24 24" fill={color} className="w-12 h-12">
        <path d="M12 2L2 7l1.5 11L12 22l8.5-4L22 7 12 2Zm0 4 6 3-6 3-6-3 6-3Zm-5 7v4l5 2.5V15l-5-2Zm10 0-5 2v4.5l5-2.5v-4Z"/>
      </svg>
    ),
    mongodb: (
      <svg viewBox="0 0 24 24" fill={color} className="w-12 h-12">
        <path d="M12 2C8 2 5 5 5 9c0 3 2 6 5 7v6h4v-6c3-1 5-4 5-7 0-4-3-7-7-7Zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5Z"/>
      </svg>
    ),
    postgresql: (
      <svg viewBox="0 0 24 24" fill={color} className="w-12 h-12">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8Zm-1-13h2v6h-2V7Zm0 8h2v2h-2v-2Z"/>
      </svg>
    ),
  }

  return iconMap[name] || (
    <div 
      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default function TechnologiesPage() {
  const { t } = useI18n()

  const [items, setItems] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        setError("")
        const list = await getTechnologies()
        if (!alive) return
        setItems(Array.isArray(list) ? list : [])
      } catch (e: any) {
        if (!alive) return
        setItems([])
        setError(e?.message || t("failedToLoadProjects"))
      } finally {
        if (!alive) return
        setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [t])

  const techUi = useMemo(() => {
    const arr = Array.isArray(items) ? items : []
    return arr
      .map((name) => String(name || "").trim())
      .filter(Boolean)
      .map((name) => {
        const key = normalizeTechKey(name)
        // чуть более дружелюбные алиасы
        const iconKey =
          key === "node" ? "nodejs" :
          key === "postgres" ? "postgresql" :
          key === "tf" ? "tensorflow" :
          key
        const color = hashToColorHex(name)
        return { name, iconKey, color }
      })
  }, [items])

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            {t("technologies")}
          </h1>
          <div className="w-24 h-1 gradient-bg mx-auto rounded-full mb-4" />
          <p className="text-muted-foreground text-lg">
            {t("cuttingEdgeTech")}
          </p>
        </div>

        {/* Technology Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
          {loading ? (
            <div className="col-span-full text-center text-muted-foreground py-8">
              {t("loading")}
            </div>
          ) : error ? (
            <div className="col-span-full text-center text-red-400 py-8">
              {error}
              <div className="text-sm text-muted-foreground mt-2">
                {t("checkApi")}
                {API_BASE ? ` (${API_BASE})` : ""}
              </div>
            </div>
          ) : techUi.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-8">
              Empty
            </div>
          ) : (
            techUi.map((tech) => (
            <div
              key={tech.name}
              className="group glass border border-white/10 rounded-2xl p-6 text-center
                         hover:border-white/20 hover:-translate-y-1 transition-all duration-300
                         hover:shadow-lg hover:shadow-rose-900/20"
            >
              <div className="flex justify-center mb-4">
                <TechIcon name={tech.iconKey} color={tech.color} />
              </div>
              <h3 className="font-semibold text-white group-hover:gradient-text transition-all duration-300">
                {tech.name}
              </h3>
            </div>
          ))
          )}
        </div>

        {/* Bottom Text */}
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            {t("andManyMore")}
          </p>
          <button className="inline-flex items-center gap-2 px-8 py-4 rounded-full gradient-bg text-white font-semibold
                           transition-all duration-300 hover:scale-105 glow-hover group">
            {t("exploreAllTech")}
            <ArrowRight
              size={20}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    </div>
  )
}
