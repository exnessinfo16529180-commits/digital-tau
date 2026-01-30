// frontend/lib/mappers/project.mapper.ts

import type { BackendProject } from "@/lib/api"
import { stripHtml } from "@/lib/utils"

export type UiCategory = "AI/ML" | "IoT" | "Web" | "Mobile" | "VR/AR"

export type UiProject = {
  id: string
  title: string
  description: string
  category: UiCategory
  techStack: string[]
  image?: string
  projectUrl?: string
  featured: boolean
}

// backend category (aiml/iot/web/mobile/vrar) -> UI category (AI/ML/IoT/...)
export function mapCategory(input?: string | null): UiCategory {
  const v = String(input ?? "").toLowerCase().trim()

  if (v === "aiml" || v === "ai" || v === "ml" || v === "ai/ml") return "AI/ML"
  if (v === "iot") return "IoT"
  if (v === "web") return "Web"
  if (v === "mobile") return "Mobile"
  if (v === "vrar" || v === "vr/ar" || v === "vr" || v === "ar") return "VR/AR"

  // дефолт
  return "Web"
}

function pickByLang(
  lang: "ru" | "kz" | "en",
  ru?: string | null,
  kz?: string | null,
  en?: string | null
) {
  if (lang === "ru" && ru) return ru
  if (lang === "kz" && kz) return kz
  if (en) return en
  return ru || kz || "Untitled project"
}

export function normalizeImage(apiBase: string, image?: string | null): string | undefined {
  const img = (image ?? "").trim()
  if (!img) return undefined
  if (img.startsWith("http://") || img.startsWith("https://")) return img
  if (img.startsWith("/")) return `${apiBase}${img}`
  return `${apiBase}/${img}`
}

export function normalizeProjectUrl(p: BackendProject): string | undefined {
  const url = String((p.projectUrl ?? p.project_url ?? "")).trim()
  if (!url) return undefined
  return url
}

export function backendToUiProject(
  p: BackendProject,
  opts: { lang: "ru" | "kz" | "en"; apiBase: string }
): UiProject {
  const title = pickByLang(opts.lang, p.titleRu, p.titleKz, p.titleEn)
  const descriptionRaw = pickByLang(
    opts.lang,
    p.descriptionRu,
    p.descriptionKz,
    p.descriptionEn
  )
  const description = stripHtml(descriptionRaw)

  const techStack = Array.isArray(p.technologies)
    ? p.technologies.map((x) => String(x)).filter(Boolean)
    : typeof p.technologies === "string"
      ? p.technologies.split(",").map((x) => x.trim()).filter(Boolean)
      : []

  return {
    id: String(p.id),
    title,
    description,
    category: mapCategory(p.category ?? undefined),
    techStack,
    image: normalizeImage(opts.apiBase, p.image ?? undefined),
    projectUrl: normalizeProjectUrl(p),
    featured: Boolean(p.featured), // ВАЖНО: поле всегда есть
  }
}

export function backendToUiProjects(
  list: BackendProject[] | undefined | null,
  opts: { lang: "ru" | "kz" | "en"; apiBase: string }
): UiProject[] {
  const arr = Array.isArray(list) ? list : []
  return arr.map((p) => backendToUiProject(p, opts))
}
