"use client"

import { useEffect, useMemo, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { FolderKanban, Users, Cpu, Clock } from "lucide-react"
import { getProjects, getStats, type BackendProject, type Stats } from "@/lib/api"

function mapCategory(cat?: string | null) {
  const c = (cat || "").toLowerCase()
  if (c === "aiml" || c === "ai/ml" || c === "ai") return "AI/ML"
  if (c === "iot") return "IoT"
  if (c === "web") return "Web"
  if (c === "mobile") return "Mobile"
  if (c === "vrar" || c === "vr/ar" || c === "vr") return "VR/AR"
  return "Web"
}

function pickTitle(p: BackendProject) {
  return p.titleRu || p.titleEn || p.titleKz || "Untitled project"
}

export default function AdminDashboard() {
  const { t } = useI18n()

  const [stats, setStats] = useState<Stats | null>(null)
  const [projects, setProjects] = useState<BackendProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [s, p] = await Promise.all([getStats(), getProjects()])
        if (!alive) return
        setStats(s ?? null)
        setProjects(Array.isArray(p) ? p : [])
      } catch (e) {
        if (!alive) return
        setStats({ projects: 0, students: 0, technologies: 0 })
        setProjects([])
      } finally {
        if (!alive) return
        setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const safeStats = {
    projects: Number(stats?.projects ?? 0),
    students: Number(stats?.students ?? 0),
    technologies: Number(stats?.technologies ?? 0),
  }

  const dashboardStats = [
    { label: t("totalProjects"), value: safeStats.projects, icon: FolderKanban, color: "#E91E63" },
    { label: t("totalStudents"), value: safeStats.students, icon: Users, color: "#FF9800" },
    { label: t("activeTechnologies"), value: safeStats.technologies, icon: Cpu, color: "#FFC107" },
  ]

  const categories = ["AI/ML", "IoT", "Web", "Mobile", "VR/AR"] as const

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of categories) counts[c] = 0
    for (const p of projects) {
      const c = mapCategory(p.category)
      counts[c] = (counts[c] ?? 0) + 1
    }
    return counts
  }, [projects])

  const totalProjects = projects.length || 0

  const recentActivity = useMemo(() => {
    // У нас с бэка нет логов, поэтому показываем последние проекты как "Recent"
    const last = [...projects].slice(-4).reverse()
    return last.map((p) => ({
      title: pickTitle(p),
      action: p.featured ? t("featuredProject") : t("projectUpdated"),
      time: "—",
    }))
  }, [projects, t])

  if (loading) {
    return <div className="p-6 lg:p-8 text-muted-foreground">{t("loading")}</div>
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">{t("dashboard")}</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {dashboardStats.map((stat, index) => (
          <div
            key={index}
            className="glass border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}+</p>
            <p className="text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="glass border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-[#E91E63]" />
            {t("recentActivity")}
          </h2>

          {recentActivity.length === 0 ? (
            <div className="text-muted-foreground">{t("noActivityYet")}</div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                >
                  <div>
                    <p className="text-white font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="glass border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">{t("projectsByCategory")}</h2>

          <div className="space-y-4">
            {categories.map((category) => {
              const count = categoryCounts[category] ?? 0
              const percentage = totalProjects > 0 ? (count / totalProjects) * 100 : 0
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">{category}</span>
                    <span className="text-sm text-white">{count}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-bg rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {totalProjects === 0 && (
            <div className="text-muted-foreground mt-4">{t("noProjectsInDb")}</div>
          )}
        </div>
      </div>
    </div>
  )
}
