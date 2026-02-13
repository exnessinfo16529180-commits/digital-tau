"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Sparkles, Filter } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { cn, stripHtml } from "@/lib/utils"
import { getCategories, getProjects, type BackendCategory, type BackendProject } from "@/lib/api"
import { ProjectCard } from "@/components/project-card"
import { extractCategoryCodes, formatCategoryLabel, mapCategory, normalizeCategoryCode } from "@/lib/mappers/project.mapper"
import type { UiProject } from "@/lib/mappers/project.mapper"
import { motion, AnimatePresence } from "framer-motion"

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "")

function normalizeImage(img?: string) {
  if (!img) return ""
  if (img.startsWith("http://") || img.startsWith("https://")) return img
  if (img.startsWith("/")) return `${API_BASE}${img}`
  return `${API_BASE}/${img}`
}

type UiProjectWithCodes = UiProject & { categoryCodes: string[] }

function pickLangText(p: BackendProject, lang: "ru" | "kz" | "en") {
  const title = (lang === "ru" ? p.titleRu : lang === "kz" ? p.titleKz : p.titleEn) || p.titleEn || "Untitled project"
  const descriptionRaw = (lang === "ru" ? p.descriptionRu : lang === "kz" ? p.descriptionKz : p.descriptionEn) || p.descriptionEn || ""
  return { title, description: stripHtml(descriptionRaw) }
}

function toUiProject(p: BackendProject, lang: "ru" | "kz" | "en"): UiProjectWithCodes {
  const { title, description } = pickLangText(p, lang)
  const techStack = Array.isArray(p.technologies) ? p.technologies : []
  const projectUrl = (p.projectUrl ?? (p as any).project_url ?? "") as string
  const categoryCodes = extractCategoryCodes(p)
  const primaryCategory = p.category ?? categoryCodes[0] ?? undefined

  return {
    id: String(p.id),
    title,
    description,
    category: mapCategory(primaryCategory),
    categoryCodes,
    techStack,
    image: normalizeImage(p.image ?? undefined),
    projectUrl,
    featured: Boolean(p.featured),
  }
}

function isValidProjectId(id: string) {
  const s = String(id ?? "").trim()
  return !!s && s !== "undefined" && s !== "null" && /^\d+$/.test(s)
}

export default function ProjectsPage() {
  const { t, language } = useI18n()
  const lang = (language as "ru" | "kz" | "en") || "en"

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all")
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<BackendProject[]>([])
  const [categoryItems, setCategoryItems] = useState<BackendCategory[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getProjects(), getCategories().catch(() => [])])
      .then(([projects, categories]) => {
        const data = Array.isArray(projects) && projects.length > 0 ? projects : mockProjects
        setItems(data)
        setCategoryItems(Array.isArray(categories) ? categories : [])
        setLoading(false)
      })
      .catch(e => {
        setItems(mockProjects)
        setLoading(false)
      })
  }, [t])

  const mockProjects: BackendProject[] = [
    {
      id: "1",
      titleEn: "Smart University Campus",
      titleRu: "Умный кампус университета",
      descriptionEn: "IoT-based system for campus management and student tracking.",
      descriptionRu: "Система на базе IoT для управления кампусом и отслеживания студентов.",
      technologies: ["React", "Node.js", "MQTT", "Python"],
      category: "IOT",
      featured: true,
      image: "https://images.unsplash.com/photo-1558441306-8e440971baa4?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "2",
      titleEn: "AI Research Assistant",
      titleRu: "ИИ-помощник для исследований",
      descriptionEn: "Neural network for scientific paper analysis and summarization.",
      descriptionRu: "Нейронная сеть для анализа и аннотирования научных работ.",
      technologies: ["PyTorch", "FastAPI", "Next.js"],
      category: "AI",
      featured: true,
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "3",
      titleEn: "VR History Museum",
      titleRu: "VR Музей истории",
      descriptionEn: "Immersive VR experience for exploring ancient architecture.",
      descriptionRu: "Иммерсивный VR-опыт для изучения древней архитектуры.",
      technologies: ["Unity", "C#", "Oculus SDK"],
      category: "VR",
      featured: true,
      image: "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&q=80&w=800"
    }
  ]

  const uiProjects = useMemo(() => {
    return items.map(p => toUiProject(p, lang)).filter(p => isValidProjectId(p.id))
  }, [items, lang])

  const categories = useMemo(() => {
    const byCode = new Map<string, BackendCategory>()
    for (const c of categoryItems) byCode.set(normalizeCategoryCode(c?.code) || "", c)
    const usedCodes = new Set<string>()
    for (const p of uiProjects) p.categoryCodes.forEach(c => usedCodes.add(c))

    return Array.from(usedCodes).map(code => {
      const meta = byCode.get(code)
      let label = formatCategoryLabel(code)
      if (meta) label = (lang === "ru" ? meta.nameRu : lang === "kz" ? meta.nameKz : meta.nameEn) || meta.code || code
      return { code, label }
    }).sort((a, b) => a.label.localeCompare(b.label))
  }, [uiProjects, categoryItems, lang])

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return uiProjects.filter(p => {
      const matchesCat = selectedCategory === "all" || p.categoryCodes.includes(selectedCategory)
      const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.techStack.some(t => t.toLowerCase().includes(q))
      return matchesCat && matchesSearch
    })
  }, [uiProjects, searchQuery, selectedCategory])

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 text-cyan-500 font-black uppercase tracking-[0.3em] text-xs mb-6">
            <Sparkles size={14} />
            Explorer
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 uppercase">
             <span className="text-metallic">{t("projects")}</span> CATALOG
          </h1>
        </div>

        <div className="max-w-5xl mx-auto mb-20 space-y-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-cyan-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-500/50" size={24} />
            <input
              type="text"
              placeholder={t("searchProjects")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-6 rounded-[2rem] glass-cyan border border-cyan-500/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-all text-lg font-bold"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
             <button
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                selectedCategory === "all" ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/30" : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
              )}
            >
              {t("all")}
            </button>
            {categories.map(c => (
              <button
                key={c.code}
                onClick={() => setSelectedCategory(c.code)}
                className={cn(
                  "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                  selectedCategory === c.code ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/30" : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-96 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 glass-cyan border border-red-500/30 rounded-3xl">
            <p className="text-red-400 font-black uppercase tracking-widest">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((p) => (
                <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <ProjectCard project={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-40">
             <div className="inline-block p-10 rounded-full bg-white/5 border border-white/10 mb-6">
                <Filter size={48} className="text-slate-700" />
             </div>
             <p className="text-slate-500 font-black uppercase tracking-widest">{t("noProjectsFound")}</p>
          </div>
        )}
      </div>
    </div>
  )
}
