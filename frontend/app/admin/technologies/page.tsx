"use client"

import { useI18n } from "@/lib/i18n"
import { technologies } from "@/lib/data"
import { Plus, Pencil, Trash2 } from "lucide-react"

export default function AdminTechnologiesPage() {
  const { t } = useI18n()

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text">{t("manageTech")}</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white font-medium
                     transition-all duration-300 hover:scale-105 glow-hover"
        >
          <Plus size={20} />
          Add Technology
        </button>
      </div>

      {/* Technologies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {technologies.map((tech) => (
          <div
            key={tech.name}
            className="glass border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold"
                style={{ backgroundColor: `${tech.color}20`, color: tech.color }}
              >
                {tech.name.charAt(0)}
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
                  <Pencil size={16} />
                </button>
                <button className="p-2 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-white">{tech.name}</h3>
            <p className="text-sm text-muted-foreground">Used in 5 projects</p>
          </div>
        ))}
      </div>
    </div>
  )
}
