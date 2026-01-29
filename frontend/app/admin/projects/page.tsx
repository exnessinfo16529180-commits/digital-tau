"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { projects, categories, type Project, type Category } from "@/lib/data"
import { Plus, Pencil, Trash2, Eye, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminProjectsPage() {
  const { t } = useI18n()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingProject(null)
    setIsModalOpen(true)
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text">
          {t("manageProjects")}
        </h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white font-medium
                     transition-all duration-300 hover:scale-105 glow-hover"
        >
          <Plus size={20} />
          {t("addNewProject")}
        </button>
      </div>

      {/* Projects Table */}
      <div className="glass border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-muted-foreground font-medium">
                  Thumbnail
                </th>
                <th className="text-left p-4 text-muted-foreground font-medium">
                  {t("title")}
                </th>
                <th className="text-left p-4 text-muted-foreground font-medium">
                  {t("category")}
                </th>
                <th className="text-left p-4 text-muted-foreground font-medium">
                  {t("status")}
                </th>
                <th className="text-left p-4 text-muted-foreground font-medium">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-2xl">
                      {project.category === "AI/ML" && "🧠"}
                      {project.category === "IoT" && "📡"}
                      {project.category === "Web" && "🌐"}
                      {project.category === "Mobile" && "📱"}
                      {project.category === "VR/AR" && "🥽"}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-white font-medium">
                      {t(project.titleKey)}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {t(project.descKey)}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 text-xs font-medium rounded-full gradient-bg text-white">
                      {project.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-full",
                        project.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      )}
                    >
                      {t(project.status)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-lg glass border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingProject ? "Edit Project" : t("addNewProject")}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  {t("title")}
                </label>
                <input
                  type="text"
                  defaultValue={editingProject ? t(editingProject.titleKey) : ""}
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white
                             focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  {t("description")}
                </label>
                <textarea
                  rows={3}
                  defaultValue={editingProject ? t(editingProject.descKey) : ""}
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white
                             focus:outline-none focus:border-white/30 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  {t("category")}
                </label>
                <select
                  defaultValue={editingProject?.category || ""}
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white
                             focus:outline-none focus:border-white/30 transition-colors bg-transparent"
                >
                  <option value="" disabled className="bg-[#1a1a1a]">
                    Select category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#1a1a1a]">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  {t("status")}
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      defaultChecked={editingProject?.status === "active"}
                      className="w-4 h-4 accent-pink-500"
                    />
                    <span className="text-white">{t("active")}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      defaultChecked={editingProject?.status === "draft"}
                      className="w-4 h-4 accent-pink-500"
                    />
                    <span className="text-white">{t("draft")}</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white font-medium
                             hover:bg-white/5 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl gradient-bg text-white font-medium
                             hover:scale-105 transition-all duration-300"
                >
                  {t("submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
