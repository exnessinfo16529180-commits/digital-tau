"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useI18n } from "@/lib/i18n"

type BackendProject = {
  id: string | number
  titleRu?: string
  titleKz?: string
  titleEn?: string
  category?: string
  categories?: string[] | string
  featured?: boolean
}

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "")

function pickTitle(p: BackendProject) {
  return p.titleRu || p.titleEn || p.titleKz || "Untitled"
}

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

export default function AdminProjectsPage() {
  const { t } = useI18n()

  const [items, setItems] = useState<BackendProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [info, setInfo] = useState<string>("")

  async function loadProjects() {
    setLoading(true)
    setError("")
    setInfo("")
    try {
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

  async function cleanupUploads() {
    setError("")
    setInfo("")
    try {
      const res = await fetch(`${API_BASE}/api/admin/projects/cleanup-uploads`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      })
      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`Cleanup failed: ${res.status} ${text}`)
      }
      const data = (await res.json()) as any
      setInfo(
        `Cleanup ok. Checked: ${data?.checked ?? 0}, updated: ${data?.updated ?? 0}, removed refs: ${data?.removedRefs ?? 0}`
      )
      await loadProjects()
    } catch (e: any) {
      setError(e?.message || "Cleanup failed")
    }
  }

  async function deleteProject(p: BackendProject) {
    const ok = confirm(t("confirmDeleteProject", { title: pickTitle(p) }))
    if (!ok) return

    setError("")
    setInfo("")
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/projects/${encodeURIComponent(String(p.id))}/delete`,
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

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={cleanupUploads}
            className="px-4 py-2 rounded-xl glass border border-white/10 text-white/80 hover:text-white hover:border-white/20 transition-colors"
            title="Remove missing /static/uploads references from DB"
          >
            Cleanup uploads
          </button>

          <Link
            href="/admin/projects/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white font-medium
                       transition-all duration-300 hover:scale-105 glow-hover"
          >
            <Plus size={20} />
            {t("addProject")}
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 glass border border-red-500/30 rounded-2xl p-4 text-red-300">
          {error}
        </div>
      )}

      {info && (
        <div className="mb-6 glass border border-white/10 rounded-2xl p-4 text-white/70">
          {info}
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
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {(() => {
                        const cats = normalizeToArray(p.categories)
                        if (cats.length) return cats.join(", ")
                        return p.category || "—"
                      })()}
                    </td>
                    <td className="p-4 text-muted-foreground">{p.featured ? "✓" : "—"}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/projects/${encodeURIComponent(String(p.id))}/edit`}
                          className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                          title={t("edit")}
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteProject(p)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
                          title={t("delete")}
                        >
                          <Trash2 size={16} />
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
    </div>
  )
}
