"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, X } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type Tech = { id: number; name: string }

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "")

export default function AdminTechnologiesPage() {
  const { t } = useI18n()

  const [items, setItems] = useState<Tech[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Tech | null>(null)
  const [name, setName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_BASE}/api/admin/technologies/json`, {
        cache: "no-store",
        credentials: "include",
      })
      if (!res.ok) throw new Error(`GET /api/admin/technologies/json failed: ${res.status}`)
      const data = (await res.json()) as Tech[]
      setItems(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setItems([])
      setError(e?.message || "Failed to load technologies")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openAdd() {
    setEditing(null)
    setName("")
    setIsModalOpen(true)
  }

  function openEdit(item: Tech) {
    setEditing(item)
    setName(item.name)
    setIsModalOpen(true)
  }

  async function submit() {
    setSubmitting(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append("name", name.trim())

      const url = editing
        ? `${API_BASE}/api/admin/technologies/${encodeURIComponent(String(editing.id))}/edit`
        : `${API_BASE}/api/admin/technologies/new`

      const res = await fetch(url, { method: "POST", body: fd, credentials: "include" })
      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`Submit failed: ${res.status} ${text}`)
      }

      setIsModalOpen(false)
      await load()
    } catch (e: any) {
      setError(e?.message || "Submit failed")
    } finally {
      setSubmitting(false)
    }
  }

  async function remove(item: Tech) {
    const ok = confirm(`Delete technology "${item.name}"?`)
    if (!ok) return
    setError("")
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/technologies/${encodeURIComponent(String(item.id))}/delete`,
        { method: "POST", credentials: "include" }
      )
      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`Delete failed: ${res.status} ${text}`)
      }
      await load()
    } catch (e: any) {
      setError(e?.message || "Delete failed")
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text">{t("manageTech")}</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white font-medium
                     transition-all duration-300 hover:scale-105 glow-hover"
        >
          <Plus size={20} />
          {t("addTechnology")}
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
                <th className="text-left p-4 text-muted-foreground font-medium">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={3}>
                    {t("loading")}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={3}>
                    Empty
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 last:border-0">
                    <td className="p-4 text-muted-foreground">{item.id}</td>
                    <td className="p-4 text-white font-medium">{item.name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => remove(item)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
                          title="Delete"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-lg glass border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editing ? "Edit technology" : t("addTechnology")}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl glass border border-white/10 text-white",
                  "focus:outline-none focus:border-white/30 transition-colors"
                )}
                placeholder="FastAPI"
              />
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
                onClick={submit}
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

