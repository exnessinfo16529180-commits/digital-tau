"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { useI18n } from "@/lib/i18n"

type CategoryDto =
  | string
  | {
      id?: number
      code: string
      nameRu?: string
      nameKz?: string
      nameEn?: string
    }

type UiCategory = {
  id?: number
  code: string
  nameRu: string
  nameKz: string
  nameEn: string
}

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "")

export default function AdminCategoriesPage() {
  const { t } = useI18n()

  const [items, setItems] = useState<UiCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [code, setCode] = useState("")
  const [nameRu, setNameRu] = useState("")
  const [nameKz, setNameKz] = useState("")
  const [nameEn, setNameEn] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_BASE}/api/categories`, { cache: "no-store" })
      if (!res.ok) throw new Error(`GET /api/categories failed: ${res.status}`)
      const data = (await res.json()) as CategoryDto[]
      const mapped: UiCategory[] = Array.isArray(data)
        ? data
            .map((c) => {
              if (typeof c === "string") {
                return { code: c, nameRu: c, nameKz: c, nameEn: c }
              }
              const code = String(c.code || "").trim()
              if (!code) return null
              return {
                id: typeof c.id === "number" ? c.id : undefined,
                code,
                nameRu: String(c.nameRu || code),
                nameKz: String(c.nameKz || code),
                nameEn: String(c.nameEn || code),
              }
            })
            .filter(Boolean) as UiCategory[]
        : []

      setItems(mapped)
    } catch (e: any) {
      setItems([])
      setError(e?.message || "Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function create() {
    setSubmitting(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append("name", code.trim())
      fd.append("name_ru", nameRu.trim())
      fd.append("name_kz", nameKz.trim())
      fd.append("name_en", nameEn.trim())

      const res = await fetch(`${API_BASE}/api/admin/categories/new`, {
        method: "POST",
        body: fd,
        credentials: "include",
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`Create failed: ${res.status} ${text}`)
      }

      setCode("")
      setNameRu("")
      setNameKz("")
      setNameEn("")
      await load()
    } catch (e: any) {
      setError(e?.message || "Create failed")
    } finally {
      setSubmitting(false)
    }
  }

  async function remove(id: number) {
    const ok = confirm("Delete category?")
    if (!ok) return
    setError("")
    try {
      const res = await fetch(`${API_BASE}/api/admin/categories/${id}/delete`, {
        method: "POST",
        credentials: "include",
      })
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
        <h1 className="text-3xl font-bold gradient-text">{t("category")}</h1>
      </div>

      {error && (
        <div className="mb-6 glass border border-red-500/30 rounded-2xl p-4 text-red-300">
          {error}
        </div>
      )}

      <div className="glass border border-white/10 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="Code" value={code} onChange={setCode} placeholder="web" />
          <Field label="RU" value={nameRu} onChange={setNameRu} placeholder="Веб" />
          <Field label="KZ" value={nameKz} onChange={setNameKz} placeholder="Web" />
          <Field label="EN" value={nameEn} onChange={setNameEn} placeholder="Web" />
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={create}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white font-medium
                       transition-all duration-300 hover:scale-105 glow-hover disabled:opacity-60 disabled:hover:scale-100"
          >
            <Plus size={18} />
            {submitting ? t("saving") : t("submit")}
          </button>
        </div>
      </div>

      <div className="glass border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-muted-foreground font-medium">Code</th>
                <th className="text-left p-4 text-muted-foreground font-medium">RU</th>
                <th className="text-left p-4 text-muted-foreground font-medium">KZ</th>
                <th className="text-left p-4 text-muted-foreground font-medium">EN</th>
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
              ) : items.length === 0 ? (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={5}>
                    Empty
                  </td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr key={c.code} className="border-b border-white/5 last:border-0">
                    <td className="p-4 text-white font-medium">{c.code}</td>
                    <td className="p-4 text-muted-foreground">{c.nameRu}</td>
                    <td className="p-4 text-muted-foreground">{c.nameKz}</td>
                    <td className="p-4 text-muted-foreground">{c.nameEn}</td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => c.id && remove(c.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
                        title="Delete"
                        disabled={!c.id}
                      >
                        <Trash2 size={16} />
                      </button>
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
