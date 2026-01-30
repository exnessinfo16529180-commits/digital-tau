"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Pencil, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

type BackendProject = {
  id: string | number
  titleRu?: string
  titleKz?: string
  titleEn?: string
  descriptionRu?: string
  descriptionKz?: string
  descriptionEn?: string
  technologies?: string[] | string
  image?: string
  category?: string
  featured?: boolean
  projectUrl?: string
  project_url?: string
}

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000"
  ).replace(/\/+$/, "")

function normalizeTechToString(tech?: string[] | string) {
  if (!tech) return ""
  if (Array.isArray(tech)) return tech.join(", ")
  return String(tech)
}

function toBoolString(v: boolean) {
  return v ? "true" : "false"
}

function pickTitle(p: BackendProject) {
  return p.titleRu || p.titleEn || p.titleKz || "Untitled"
}

export default function AdminProjectsPage() {
  const { t } = useI18n()

  const [items, setItems] = useState<BackendProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<BackendProject | null>(null)

  // form state (именно под multipart/form-data поля твоего бекенда)
  const [titleRu, setTitleRu] = useState("")
  const [titleKz, setTitleKz] = useState("")
  const [titleEn, setTitleEn] = useState("")
  const [descriptionRu, setDescriptionRu] = useState("")
  const [descriptionKz, setDescriptionKz] = useState("")
  const [descriptionEn, setDescriptionEn] = useState("")
  const [technologies, setTechnologies] = useState("") // строка "a,b,c"
  const [category, setCategory] = useState("web")
  const [featured, setFeatured] = useState(false)
  const [projectUrl, setProjectUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function loadProjects() {
    setLoading(true)
    setError("")
    try {
      // список берём из JSON API (который ты уже видел: /api/projects)
      const res = await fetch(`${API_BASE}/api/projects`, { cache: "no-store" })
      if (!res.ok) throw new Error(`GET /api/projects failed: ${res.status}`)
      const data = (await res.json()) as BackendProject[]
      setItems(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setItems([])
      setError(e?.message || "Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  function openAdd() {
    setEditing(null)
    setTitleRu("")
    setTitleKz("")
    setTitleEn("")
    setDescriptionRu("")
    setDescriptionKz("")
    setDescriptionEn("")
    setTechnologies("")
    setCategory("web")
    setFeatured(false)
    setProjectUrl("")
    setImageFile(null)
    setIsModalOpen(true)
  }

  function openEdit(p: BackendProject) {
    setEditing(p)
    setTitleRu(p.titleRu || "")
    setTitleKz(p.titleKz || "")
    setTitleEn(p.titleEn || "")
    setDescriptionRu(p.descriptionRu || "")
    setDescriptionKz(p.descriptionKz || "")
    setDescriptionEn(p.descriptionEn || "")
    setTechnologies(normalizeTechToString(p.technologies))
    setCategory((p.category || "web").toLowerCase())
    setFeatured(Boolean(p.featured))
    setProjectUrl(p.projectUrl || (p as any).project_url || "")
    setImageFile(null) // при редактировании файл выбирается заново (если надо)
    setIsModalOpen(true)
  }

  async function submitForm() {
    setSubmitting(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append("title_ru", titleRu)
      fd.append("title_kz", titleKz)
      fd.append("title_en", titleEn)
      fd.append("description_ru", descriptionRu)
      fd.append("description_kz", descriptionKz)
      fd.append("description_en", descriptionEn)
      fd.append("technologies", technologies) // бек ждёт string
      fd.append("category", category)
      fd.append("featured", toBoolString(featured))
      fd.append("project_url", projectUrl)

      if (imageFile) {
        fd.append("image_file", imageFile)
      }

      // важно: админские endpoints у тебя form-data и чаще всего требуют cookie-сессию
      const url = editing
        ? `${API_BASE}/admin/projects/${encodeURIComponent(String(editing.id))}/edit`
        : `${API_BASE}/admin/projects/new`

      const res = await fetch(url, {
        method: "POST",
        body: fd,
        credentials: "include",
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`Admin submit failed: ${res.status} ${text}`)
      }

      setIsModalOpen(false)
      await loadProjects()
    } catch (e: any) {
      setError(e?.message || "Submit failed")
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteProject(p: BackendProject) {
    const ok = confirm(t("confirmDeleteProject", { title: pickTitle(p) }))
    if (!ok) return

    setError("")
    try {
      const res = await fetch(
        `${API_BASE}/admin/projects/${encodeURIComponent(String(p.id))}/delete`,
        { method: "POST", credentials: "include" }
      )
      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`Delete failed: ${res.status} ${text}`)
      }
      await loadProjects()
    } catch (e: any) {
      setError(e?.message || "Delete failed")
    }
  }

  const rows = useMemo(() => items, [items])

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text">{t("manageProjects")}</h1>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white font-medium
                     transition-all duration-300 hover:scale-105 glow-hover"
        >
          <Plus size={20} />
          {t("addProject")}
        </button>
      </div>

      {error && (
        <div className="mb-6 glass border border-red-500/30 rounded-2xl p-4 text-red-300">
          {error}
        </div>
      )}

      <div className="glass border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-muted-foreground font-medium">ID</th>
                <th className="text-left p-4 text-muted-foreground font-medium">{t("title")}</th>
                <th className="text-left p-4 text-muted-foreground font-medium">{t("category")}</th>
                <th className="text-left p-4 text-muted-foreground font-medium">{t("featured")}</th>
                <th className="text-left p-4 text-muted-foreground font-medium">{t("actions")}</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={5}>
                    {t("loading")}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={5}>
                    {t("noProjectsTable")}
                  </td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr
                    key={String(p.id)}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 text-white/80">{String(p.id)}</td>
                    <td className="p-4">
                      <p className="text-white font-medium">{pickTitle(p)}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {p.descriptionRu || p.descriptionEn || p.descriptionKz || "—"}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 text-xs font-medium rounded-full gradient-bg text-white">
                        {(p.category || "web").toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "px-3 py-1 text-xs font-medium rounded-full",
                          p.featured ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/60"
                        )}
                      >
                        {p.featured ? "true" : "false"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                          title={t("edit")}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => deleteProject(p)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
                          title={t("delete")}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl glass border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editing ? t("editProject") : t("addProject")}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label={t("fieldTitleRu")} value={titleRu} onChange={setTitleRu} />
              <Field label={t("fieldTitleKz")} value={titleKz} onChange={setTitleKz} />
              <Field label={t("fieldTitleEn")} value={titleEn} onChange={setTitleEn} />

              <Area label={t("fieldDescRu")} value={descriptionRu} onChange={setDescriptionRu} />
              <Area label={t("fieldDescKz")} value={descriptionKz} onChange={setDescriptionKz} />
              <Area label={t("fieldDescEn")} value={descriptionEn} onChange={setDescriptionEn} />
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label={t("fieldTech")}
                value={technologies}
                onChange={setTechnologies}
                placeholder="FastAPI, PostgreSQL, Docker"
              />

              <Field
                label={t("fieldProjectUrl")}
                value={projectUrl}
                onChange={setProjectUrl}
                placeholder="https://..."
              />

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t("category")}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white
                             focus:outline-none focus:border-white/30 transition-colors bg-transparent"
                >
                  {["aiml", "iot", "web", "mobile", "vrar"].map((c) => (
                    <option key={c} value={c} className="bg-[#1a1a1a]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t("featured")}</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-pink-500"
                  />
                  <span className="text-white">true</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-muted-foreground mb-2">{t("fieldImage")}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white
                             focus:outline-none focus:border-white/30 transition-colors bg-transparent"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {t("keepImageHint")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white font-medium
                           hover:bg-white/5 transition-colors"
                disabled={submitting}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={submitForm}
                className="flex-1 px-4 py-3 rounded-xl gradient-bg text-white font-medium
                           hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:hover:scale-100"
                disabled={submitting}
              >
                {submitting ? t("saving") : t("submit")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm text-muted-foreground mb-2">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white
                   focus:outline-none focus:border-white/30 transition-colors"
      />
    </div>
  )
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="md:col-span-3">
      <label className="block text-sm text-muted-foreground mb-2">{label}</label>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white
                   focus:outline-none focus:border-white/30 transition-colors resize-none"
      />
    </div>
  )
}
