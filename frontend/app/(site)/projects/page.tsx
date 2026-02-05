"use client"

import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { cn, stripHtml } from "@/lib/utils"
import { getCategories, getProjects, type BackendCategory, type BackendProject } from "@/lib/api"
import { ProjectCard } from "@/components/project-card"
import { extractCategoryCodes, formatCategoryLabel, mapCategory, normalizeCategoryCode } from "@/lib/mappers/project.mapper"
import type { UiProject } from "@/lib/mappers/project.mapper"

// -------- helpers --------
const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "")

function normalizeImage(img?: string) {
  if (!img) return ""
  if (img.startsWith("http://") || img.startsWith("https://")) return img
  if (img.startsWith("/")) return `${API_BASE}${img}`
  return `${API_BASE}/${img}`
}

type UiProjectWithCodes = UiProject & { categoryCodes: string[] }

function pickLangText(p: BackendProject, lang: "ru" | "kz" | "en") {
  const title =
    (lang === "ru" ? p.titleRu : lang === "kz" ? p.titleKz : p.titleEn) ||
    p.titleEn ||
    p.titleRu ||
    p.titleKz ||
    "Untitled project"

  const descriptionRaw =
    (lang === "ru" ? p.descriptionRu : lang === "kz" ? p.descriptionKz : p.descriptionEn) ||
    p.descriptionEn ||
    p.descriptionRu ||
    p.descriptionKz ||
    ""

  return { title, description: stripHtml(descriptionRaw) }
}

function toUiProject(p: BackendProject, lang: "ru" | "kz" | "en"): UiProjectWithCodes {
  const { title, description } = pickLangText(p, lang)

  const techStack = Array.isArray(p.technologies)
    ? p.technologies
    : typeof p.technologies === "string"
      ? p.technologies.split(",").map((s) => s.trim()).filter(Boolean)
      : []

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
// -------------------------

export default function ProjectsPage() {
  const { t, language } = useI18n()
  const lang: "ru" | "kz" | "en" = (language as "ru" | "kz" | "en") || "en"

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all")

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<BackendProject[]>([])
  const [categoryItems, setCategoryItems] = useState<BackendCategory[]>([])
  const [error, setError] = useState<string | null>(null)

  // 1) грузим проекты из API
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const [projects, categories] = await Promise.all([
          getProjects(),
          getCategories().catch(() => [] as BackendCategory[]),
        ])
        if (!alive) return
        setItems(Array.isArray(projects) ? projects : [])
        setCategoryItems(Array.isArray(categories) ? categories : [])
      } catch (e: any) {
        if (!alive) return
        setItems([])
        setCategoryItems([])
        setError(e?.message || t("failedToLoadProjects"))
      } finally {
        if (alive) setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [t])

  // 2) переводим проекты к виду карточки (UiProject)
  const uiProjects = useMemo<UiProjectWithCodes[]>(() => {
    const mapped = (Array.isArray(items) ? items : []).map((p) => toUiProject(p, lang))
    return mapped.filter((p) => isValidProjectId(p.id))
  }, [items, lang])

  // 3) категории показываем только те, по которым есть проекты
  const categories = useMemo(() => {
    const byCode = new Map<string, BackendCategory>()
    for (const c of Array.isArray(categoryItems) ? categoryItems : []) {
      const code = normalizeCategoryCode(c?.code)
      if (code) byCode.set(code, c)
    }

    const usedCodes = new Set<string>()
    for (const p of uiProjects) {
      for (const code of p.categoryCodes) usedCodes.add(code)
    }

    const labelFor = (code: string) => {
      const meta = byCode.get(code)
      if (!meta) return formatCategoryLabel(code)
      if (lang === "ru") return String(meta.nameRu || meta.code || code)
      if (lang === "kz") return String(meta.nameKz || meta.code || code)
      return String(meta.nameEn || meta.code || code)
    }

    return Array.from(usedCodes)
      .map((code) => ({ code, label: labelFor(code) }))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }))
  }, [uiProjects, categoryItems, lang])

  // 4) фильтрация + поиск
  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return uiProjects.filter((project) => {
      const matchesCategory =
        selectedCategory === "all" || project.categoryCodes.includes(selectedCategory)

      const matchesSearch =
        !q ||
        project.title.toLowerCase().includes(q) ||
        (project.description || "").toLowerCase().includes(q) ||
        (project.techStack || []).some((tech) => tech.toLowerCase().includes(q))

      return matchesCategory && matchesSearch
    })
  }, [uiProjects, searchQuery, selectedCategory])

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            {t("projectCatalog")}
          </h1>
          <div className="w-24 h-1 gradient-bg mx-auto rounded-full" />
        </div>

        {/* Search & Filter */}
        <div className="max-w-4xl mx-auto mb-12">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder={t("searchProjects")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl glass border border-white/10
                         text-white placeholder:text-muted-foreground
                         focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                selectedCategory === "all"
                  ? "gradient-bg text-white"
                  : "glass border border-white/10 text-white/70 hover:text-white hover:border-white/30"
              )}
            >
              {t("all")}
            </button>

            {categories.map((category) => (
              <button
                key={category.code}
                onClick={() => setSelectedCategory(category.code)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  selectedCategory === category.code
                    ? "gradient-bg text-white"
                    : "glass border border-white/10 text-white/70 hover:text-white hover:border-white/30"
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-10 text-muted-foreground">{t("loading")}</div>
        )}

        {!loading && error && (
          <div className="text-center py-10 text-red-400">
            {error}
            <div className="text-sm text-muted-foreground mt-2">
              {t("checkApi")}
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {/* Empty State */}
            {filteredProjects.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  {t("noProjectsFound")}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
