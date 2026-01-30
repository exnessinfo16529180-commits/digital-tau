"use client"

import { useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import type { UiProject } from "@/lib/mappers/project.mapper"
import type { BackendProject } from "@/lib/api"
import { ProjectCard } from "@/components/project-card"

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
      (lang === "ru" && p.descriptionRu) ||
      (lang === "kz" && p.descriptionKz) ||
      p.descriptionEn ||
      "",

    category: mapCategory(p.category ?? undefined),

    techStack: Array.isArray(p.technologies) ? p.technologies : [],
    image: p.image ?? undefined,
    projectUrl: (p.projectUrl ?? p.project_url) ?? undefined,
    featured: Boolean(p.featured),

  }
}

/* ---------- component ---------- */

type Props = {
  items?: BackendProject[]
}

export function FeaturedProjects({ items = [] }: Props) {
  const i18n = useI18n()
  const t = i18n.t
  const lang = (i18n as any).lang ?? "ru"

  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const projects = useMemo<UiProject[]>(() => {
    return items.map((p) => mapProject(p, lang))
  }, [items, lang])

  const visible = projects.slice(0, 6)
  const total = visible.length

  if (total === 0) {
    return (
      <section className="py-20 text-center text-muted-foreground">
        {t("noProjects") ?? "No projects"}
      </section>
    )
  }

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    const step = 404
    scrollRef.current.scrollBy({
      left: dir === "left" ? -step : step,
      behavior: "smooth",
    })
    setCurrentIndex((i) =>
      dir === "left" ? Math.max(0, i - 1) : Math.min(total - 1, i + 1)
    )
  }

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text">
            {t("featuredProjects")}
          </h2>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
          >
            {visible.map((project) => (
              <div key={project.id} className="flex-none w-[350px]">
                <ProjectCard project={project} />
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <button onClick={() => scroll("left")} disabled={currentIndex === 0}>
              <ChevronLeft />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={currentIndex >= total - 1}
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
