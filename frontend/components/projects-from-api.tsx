"use client"

import { useEffect, useMemo, useState } from "react"
import { useI18n } from "@/lib/i18n"
import type { BackendProject } from "@/lib/api"
import { getProjects } from "@/lib/api"
import { ProjectCard } from "@/components/project-card"
import type { UiProject } from "@/lib/mappers/project.mapper"

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  ).replace(/\/+$/, "")

function normalizeImage(apiBase: string, img?: string) {
  if (!img) return ""
  if (img.startsWith("http://") || img.startsWith("https://")) return img
  if (img.startsWith("/")) return `${apiBase}${img}`
  return `${apiBase}/${img}`
}

function mapCategory(cat?: string | null): UiProject["category"] {
  const c = (cat || "").toLowerCase()
  if (c === "aiml" || c === "ai/ml" || c === "ai") return "AI/ML"
  if (c === "iot") return "IoT"
  if (c === "web") return "Web"
  if (c === "mobile") return "Mobile"
  if (c === "vrar" || c === "vr/ar") return "VR/AR"
  return "Web"
}

function techToArray(tech?: string[] | string): string[] {
  if (!tech) return []
  if (Array.isArray(tech)) return tech
  // если пришло строкой "A, B, C"
  return String(tech)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

function pickTextByLang(p: BackendProject, lang: "ru" | "kz" | "en") {
  const title =
    (lang === "ru" ? p.titleRu : lang === "kz" ? p.titleKz : p.titleEn) ||
    p.titleEn ||
    p.titleRu ||
    p.titleKz ||
    "Untitled project"

  const description =
    (lang === "ru"
      ? p.descriptionRu
      : lang === "kz"
      ? p.descriptionKz
      : p.descriptionEn) ||
    p.descriptionEn ||
    p.descriptionRu ||
    p.descriptionKz ||
    ""

  return { title, description }
}

export function ProjectsFromApi({ onlyFeatured = false }: { onlyFeatured?: boolean }) {
  const { t, language } = useI18n()
  const lang: "ru" | "kz" | "en" = (language as "ru" | "kz" | "en") || "en"

  const [items, setItems] = useState<BackendProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const data = await getProjects()
        if (alive) setItems(Array.isArray(data) ? data : [])
      } catch {
        if (alive) setItems([])
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  // ВАЖНО: useMemo должен зависеть от lang,
  // чтобы при переключении языка пересчитывать title/description.
  const uiList: UiProject[] = useMemo(() => {
    const arr = Array.isArray(items) ? items : []
    const filtered = onlyFeatured ? arr.filter((x) => !!x.featured) : arr

    return filtered
      .filter((p) => p && p.id !== undefined && p.id !== null && /^\d+$/.test(String(p.id)))
      .map((p) => {
      const { title, description } = pickTextByLang(p, lang)

      const projectUrl = (p.projectUrl ?? (p as any).project_url ?? "") as string
      const image = normalizeImage(API_BASE, p.image ?? undefined)

      return {
        id: String(p.id),
        title,
        description,
        category: mapCategory(p.category ?? undefined),
        techStack: techToArray(p.technologies),
        image,
        projectUrl,
        featured: Boolean(p.featured),
      }
      })
  }, [items, onlyFeatured, lang])

  if (loading) return <div className="text-center text-muted-foreground py-10">{t("loading")}</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {uiList.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
