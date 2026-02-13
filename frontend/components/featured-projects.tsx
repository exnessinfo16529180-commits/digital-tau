"use client"

import { useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { stripHtml } from "@/lib/utils"
import type { UiProject } from "@/lib/mappers/project.mapper"
import type { BackendProject } from "@/lib/api"
import { ProjectCard } from "@/components/project-card"
import { motion } from "framer-motion"

/* ---------- helpers ---------- */

function mapCategory(cat?: string): UiProject["category"] {
  if (cat === "aiml") return "AI/ML"
  if (cat === "iot") return "IoT"
  if (cat === "web") return "Web"
  if (cat === "mobile") return "Mobile"
  return "VR/AR"
}

function mapProject(p: BackendProject, lang: "ru" | "kz" | "en"): UiProject {
  return {
    id: String(p.id),
    title:
      (lang === "ru" && p.titleRu) ||
      (lang === "kz" && p.titleKz) ||
      p.titleEn ||
      "Untitled project",

    description:
      stripHtml(
        (lang === "ru" && p.descriptionRu) ||
          (lang === "kz" && p.descriptionKz) ||
          p.descriptionEn ||
          ""
      ),

    category: mapCategory(p.category ?? undefined),

    techStack: Array.isArray(p.technologies) ? p.technologies : [],
    image: p.image ?? undefined,
    projectUrl: (p.projectUrl ?? p.project_url) ?? undefined,
    featured: Boolean(p.featured),

  }
}

function isValidProjectId(id: string) {
  const s = String(id ?? "").trim()
  return !!s && s !== "undefined" && s !== "null" && /^\d+$/.test(s)
}

/* ---------- component ---------- */

type Props = {
  items?: BackendProject[]
}

export function FeaturedProjects({ items = [] }: Props) {
  const i18n = useI18n()
  const t = i18n.t
  const lang = i18n.language

  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const projects = useMemo<UiProject[]>(() => {
    const activeItems = (items && items.length > 0) ? items : [
      {
        id: "1",
        titleEn: "Smart University Campus",
        titleRu: "Умный кампус университета",
        descriptionEn: "IoT-based system for campus management.",
        descriptionRu: "Система на базе IoT для управления кампусом.",
        technologies: ["React", "Node.js", "Python"],
        category: "iot",
        featured: true,
        image: "https://images.unsplash.com/photo-1558441306-8e440971baa4?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "2",
        titleEn: "AI Research Assistant",
        titleRu: "ИИ-помощник для исследований",
        descriptionEn: "Neural network for scientific paper analysis.",
        descriptionRu: "Нейронная сеть для анализа научных работ.",
        technologies: ["PyTorch", "Next.js"],
        category: "aiml",
        featured: true,
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "3",
        titleEn: "VR History Museum",
        titleRu: "VR Музей истории",
        descriptionEn: "Immersive VR experience.",
        descriptionRu: "Иммерсивный VR-опыт.",
        technologies: ["Unity", "C#"],
        category: "vr",
        featured: true,
        image: "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&q=80&w=800"
      }
    ]
    return activeItems.map((p) => mapProject(p, lang)).filter((p) => isValidProjectId(p.id))
  }, [items, lang])

  const visible = projects.slice(0, 12)
  const total = visible.length

  if (total === 0) {
    return (
      <section className="py-24 text-center">
        <p className="text-slate-500 font-bold uppercase tracking-widest">{t("noProjects") ?? "No projects"}</p>
      </section>
    )
  }

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    const step = 400
    scrollRef.current.scrollBy({
      left: dir === "left" ? -step : step,
      behavior: "smooth",
    })
    setCurrentIndex((i) =>
      dir === "left" ? Math.max(0, i - 1) : Math.min(total - 1, i + 1)
    )
  }

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-black uppercase tracking-[0.3em] text-xs mb-4">
              <Sparkles size={14} />
              {t("featuredProjects").split(" ")[0]}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              <span className="text-white">RESEARCH </span>
              <span className="text-metallic">SPOTLIGHT</span>
            </h2>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => scroll("left")}
              disabled={currentIndex === 0}
              className="p-4 rounded-full border border-white/10 hover:border-cyan-500 hover:text-cyan-400 transition-all disabled:opacity-20"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={currentIndex >= total - 1}
              className="p-4 rounded-full border border-white/10 hover:border-cyan-500 hover:text-cyan-400 transition-all disabled:opacity-20"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide pb-8 snap-x"
        >
          {visible.map((project) => (
            <div key={project.id} className="flex-none w-[320px] md:w-[400px] snap-start">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
