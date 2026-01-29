"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { projects, categories, type Category } from "@/lib/data"
import { ProjectCard } from "@/components/project-card"
import { cn } from "@/lib/utils"

export default function ProjectsPage() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all")

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        t(project.titleKey).toLowerCase().includes(searchQuery.toLowerCase()) ||
        t(project.descKey).toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.techStack.some((tech) =>
          tech.toLowerCase().includes(searchQuery.toLowerCase())
        )

      const matchesCategory =
        selectedCategory === "all" || project.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory, t])

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
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  selectedCategory === category
                    ? "gradient-bg text-white"
                    : "glass border border-white/10 text-white/70 hover:text-white hover:border-white/30"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No projects found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
