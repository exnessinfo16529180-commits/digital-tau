"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { getProject, type BackendProject } from "@/lib/api"

function normalizeToArray(input?: string[] | string) {
  if (!input) return []
  if (Array.isArray(input)) return input.map((x) => String(x).trim()).filter(Boolean)
  const raw = String(input).trim()
  if (!raw) return []
  const s = raw.startsWith("{") && raw.endsWith("}") ? raw.slice(1, -1) : raw
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
}

function pickLang(p: BackendProject, lang: "ru" | "kz" | "en") {
  const title =
    (lang === "ru" ? p.titleRu : lang === "kz" ? p.titleKz : p.titleEn) ||
    p.titleEn ||
    p.titleRu ||
    p.titleKz ||
    "Untitled project"

  const descriptionHtml =
    (lang === "ru" ? p.descriptionRu : lang === "kz" ? p.descriptionKz : p.descriptionEn) ||
    p.descriptionEn ||
    p.descriptionRu ||
    p.descriptionKz ||
    ""

  return { title, descriptionHtml }
}

function safeProjectUrl(p: BackendProject) {
  const url = String(p.projectUrl ?? (p as any).project_url ?? "").trim()
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  return url
}

export default function ProjectDetailPage() {
  const { t, language } = useI18n()
  const lang: "ru" | "kz" | "en" = (language as any) || "en"
  const router = useRouter()
  const params = useParams<{ id?: string | string[] }>()
  const routeId = Array.isArray(params?.id) ? params?.id?.[0] : params?.id

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [project, setProject] = useState<BackendProject | null>(null)
  const [index, setIndex] = useState(0)
  const [brokenImages, setBrokenImages] = useState<string[]>([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError("")
      try {
        const rawId = String(routeId ?? "").trim()
        if (!rawId || rawId === "undefined" || rawId === "null" || !/^\d+$/.test(rawId)) {
          router.replace("/projects")
          return
        }
        const p = await getProject(rawId)
        if (!alive) return
        setProject(p)
        setIndex(0)
        setBrokenImages([])
      } catch (e: any) {
        if (!alive) return
        setProject(null)
        setError(e?.message || "Failed to load project")
      } finally {
        if (alive) setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [routeId, router])

  const { title, descriptionHtml } = useMemo(() => pickLang(project || ({} as any), lang), [project, lang])

  const techs = useMemo(() => {
    if (!project) return []
    return normalizeToArray(project.technologies as any)
  }, [project])

  const images = useMemo(() => {
    if (!project) return []
    const combined = [
      String(project.image || "").trim(),
      ...normalizeToArray((project as any).images),
    ].filter(Boolean)
    const unique = Array.from(new Set(combined))
    if (!brokenImages.length) return unique
    const broken = new Set(brokenImages)
    return unique.filter((u) => !broken.has(u))
  }, [project, brokenImages])

  function markBroken(url: string) {
    const u = String(url || "").trim()
    if (!u) return
    setBrokenImages((prev) => (prev.includes(u) ? prev : [...prev, u]))
  }

  const canPrev = images.length > 1
  const canNext = images.length > 1

  useEffect(() => {
    if (!images.length) {
      if (index !== 0) setIndex(0)
      return
    }
    if (index >= images.length) setIndex(0)
  }, [images.length, index])

  function prev() {
    if (!images.length) return
    setIndex((i) => (i - 1 + images.length) % images.length)
  }

  function next() {
    if (!images.length) return
    setIndex((i) => (i + 1) % images.length)
  }

  const current = images[index] || ""
  const projectUrl = project ? safeProjectUrl(project) : ""

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">{t("loading")}</div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="glass border border-red-500/30 rounded-2xl p-6 text-red-300 text-center">
            {error || "Project not found"}
            <div className="mt-4">
              <Link href="/projects" className="gradient-text underline">
                {t("projects")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-white/80 hover:text-white hover:border-white/20 transition-colors"
          >
            <ChevronLeft size={18} />
            {t("projects")}
          </Link>

          {projectUrl && (
            <a
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity"
            >
              <ExternalLink size={18} />
              {t("viewProject")}
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Slider */}
          <div className="glass border border-white/10 rounded-2xl p-4">
            <div className="relative rounded-2xl overflow-hidden bg-black/40 aspect-[16/10] border border-white/10">
              {current ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => markBroken(current)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  No images
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    disabled={!canPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full glass border border-white/10 text-white hover:border-white/20 transition-colors"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="mx-auto" size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    disabled={!canNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full glass border border-white/10 text-white hover:border-white/20 transition-colors"
                    aria-label="Next"
                  >
                    <ChevronRight className="mx-auto" size={20} />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                    {images.slice(0, 10).map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={cn(
                      "relative rounded-xl overflow-hidden aspect-[4/3] border bg-black/40",
                      i === index ? "border-pink-500/60" : "border-white/10 hover:border-white/20"
                    )}
                    aria-label={`image ${i + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={() => markBroken(url)}
                      />
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="glass border border-white/10 rounded-2xl p-6">
            <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-3">{title}</h1>

            <div className="flex flex-wrap items-center gap-2 mb-5">
              {project.category && (
                <span className="px-3 py-1 rounded-full text-xs font-medium gradient-bg text-white">
                  {String(project.category).toUpperCase()}
                </span>
              )}
              {Boolean(project.featured) && (
                <span className="px-3 py-1 rounded-full text-xs font-medium border border-pink-500/40 bg-pink-500/10 text-pink-200">
                  Featured
                </span>
              )}
            </div>

            {techs.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {techs.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-white/80"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            <div
              className="prose prose-invert max-w-none text-white/80"
              // backend sanitizes this field
              dangerouslySetInnerHTML={{ __html: descriptionHtml || "" }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
