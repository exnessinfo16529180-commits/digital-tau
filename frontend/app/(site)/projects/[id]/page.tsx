"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, ExternalLink, Maximize2, X, Sparkles, Cpu } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { getProject, type BackendProject } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"

function normalizeToArray(input?: string[] | string) {
  if (!input) return []
  if (Array.isArray(input)) return input.map((x) => String(x).trim()).filter(Boolean)
  const raw = String(input).trim()
  if (!raw) return []
  const s = raw.startsWith("{") && raw.endsWith("}") ? raw.slice(1, -1) : raw
  return s.split(",").map((x) => x.trim()).filter(Boolean)
}

function pickLang(p: BackendProject, lang: "ru" | "kz" | "en") {
  const title = (lang === "ru" ? p.titleRu : lang === "kz" ? p.titleKz : p.titleEn) || p.titleEn || "Untitled"
  const descriptionHtml = (lang === "ru" ? p.descriptionRu : lang === "kz" ? p.descriptionKz : p.descriptionEn) || p.descriptionEn || ""
  return { title, descriptionHtml }
}

export default function ProjectDetailPage() {
  const { t, language } = useI18n()
  const lang = (language as any) || "en"
  const router = useRouter()
  const params = useParams<{ id?: string | string[] }>()
  const routeId = Array.isArray(params?.id) ? params?.id?.[0] : params?.id

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [project, setProject] = useState<BackendProject | null>(null)
  const [index, setIndex] = useState(0)
  const [viewerOpen, setViewerOpen] = useState(false)

  useEffect(() => {
    if (!routeId) return
    getProject(routeId).then(p => {
      setProject(p)
      setLoading(false)
    }).catch(e => {
      setError(e.message)
      setLoading(false)
    })
  }, [routeId])

  const { title, descriptionHtml } = useMemo(() => pickLang(project || ({} as any), lang), [project, lang])
  const techs = useMemo(() => project ? normalizeToArray(project.technologies as any) : [], [project])
  const images = useMemo(() => {
    if (!project) return []
    return Array.from(new Set([String(project.image || "").trim(), ...normalizeToArray((project as any).images)])).filter(Boolean)
  }, [project])

  const next = () => setIndex(i => (i + 1) % images.length)
  const prev = () => setIndex(i => (i - 1 + images.length) % images.length)

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-cyan-500 uppercase tracking-widest animate-pulse">Initializing Data...</div>

  if (error || !project) return (
    <div className="min-h-screen flex items-center justify-center p-4">
       <div className="glass-cyan p-12 rounded-[2rem] text-center border border-red-500/30">
          <p className="text-red-400 font-black mb-6 uppercase tracking-widest">System Error: Project Not Found</p>
          <Link href="/projects" className="px-8 py-4 rounded-full bg-cyan-500 text-black font-black uppercase tracking-widest">Back to Hub</Link>
       </div>
    </div>
  )

  const current = images[index]

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4">
        <Link href="/projects" className="inline-flex items-center gap-2 mb-12 text-cyan-500 font-black uppercase tracking-widest text-sm hover:text-white transition-colors">
          <ChevronLeft size={20} />
          {t("projects")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Visuals */}
          <div className="space-y-6">
            <div className="relative group rounded-[2rem] overflow-hidden glass-cyan border border-cyan-500/20 aspect-video">
              <AnimatePresence mode="wait">
                <motion.img
                  key={current}
                  src={current}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 w-full h-full object-cover cursor-zoom-in"
                  onClick={() => setViewerOpen(true)}
                />
              </AnimatePresence>

              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

              {images.length > 1 && (
                <div className="absolute bottom-6 right-6 flex gap-2">
                  <button onClick={prev} className="p-3 rounded-full glass border border-white/10 text-white hover:bg-cyan-500 hover:text-black transition-all">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={next} className="p-3 rounded-full glass border border-white/10 text-white hover:bg-cyan-500 hover:text-black transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "w-24 h-24 rounded-2xl overflow-hidden border transition-all shrink-0",
                    index === i ? "border-cyan-500 scale-105" : "border-white/10 opacity-50 hover:opacity-100"
                  )}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Intel */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 text-cyan-500 font-black uppercase tracking-[0.3em] text-[10px] mb-4">
                <Sparkles size={12} />
                Project Intel
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 uppercase">
                {title}
              </h1>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-1 rounded-full bg-cyan-500 text-black font-black text-[10px] uppercase tracking-widest">
                  {project.category || "General"}
                </span>
                {project.featured && (
                  <span className="px-4 py-1 rounded-full border border-purple-500 text-purple-400 font-black text-[10px] uppercase tracking-widest">
                    Featured
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Cpu size={14} /> Technology Stack
               </h3>
               <div className="flex flex-wrap gap-2">
                 {techs.map(t => (
                   <span key={t} className="px-3 py-1 rounded-lg glass-cyan border border-cyan-500/20 text-cyan-400 text-xs font-bold">
                     {t}
                   </span>
                 ))}
               </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <div
                className="text-slate-400 text-lg leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            </div>

            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-black font-black text-lg hover:bg-cyan-500 transition-all uppercase tracking-widest group"
              >
                Launch Project
                <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
