"use client"

import { useI18n } from "@/lib/i18n"
import { stats, projects } from "@/lib/data"
import { FolderKanban, Users, Cpu, Clock } from "lucide-react"

export default function AdminDashboard() {
  const { t } = useI18n()

  const dashboardStats = [
    {
      label: t("totalProjects"),
      value: stats.projects,
      icon: FolderKanban,
      color: "#E91E63",
    },
    {
      label: t("totalStudents"),
      value: stats.students,
      icon: Users,
      color: "#FF9800",
    },
    {
      label: t("activeTechnologies"),
      value: stats.technologies,
      icon: Cpu,
      color: "#FFC107",
    },
  ]

  const recentActivity = [
    {
      action: "Project added",
      title: "Medical AI Diagnostics",
      time: "2 hours ago",
    },
    {
      action: "Project updated",
      title: "FieldSense IoT Platform",
      time: "5 hours ago",
    },
    {
      action: "Technology added",
      title: "TensorFlow",
      time: "1 day ago",
    },
    {
      action: "Project published",
      title: "EduWeb Platform",
      time: "2 days ago",
    },
  ]

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

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="glass border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-[#E91E63]" />
            {t("recentActivity")}
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
              >
                <div>
                  <p className="text-white font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.action}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="glass border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Projects by Category
          </h2>
          <div className="space-y-4">
            {["AI/ML", "IoT", "Web", "Mobile", "VR/AR"].map((category) => {
              const count = projects.filter(
                (p) => p.category === category
              ).length
              const percentage = (count / projects.length) * 100
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">
                      {category}
                    </span>
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
        </div>
      </div>
    </div>
  )
}
