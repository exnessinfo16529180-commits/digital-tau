"use client"

import { ArrowRight } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import type { Project } from "@/lib/data"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  project: Project
  className?: string
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const { t } = useI18n()

  return (
    <div
      className={cn(
        "group relative rounded-2xl overflow-hidden glass border border-white/10",
        "hover:border-white/20 hover:shadow-xl hover:shadow-pink-500/10",
        "transition-all duration-300 hover:-translate-y-1",
        className
      )}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="absolute inset-0 flex items-center justify-center text-4xl text-white/20">
          {project.category === "AI/ML" && "🧠"}
          {project.category === "IoT" && "📡"}
          {project.category === "Web" && "🌐"}
          {project.category === "Mobile" && "📱"}
          {project.category === "VR/AR" && "🥽"}
        </div>
        {/* Category Badge */}
        <span className="absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full gradient-bg text-white">
          {project.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-white mb-2 group-hover:gradient-text transition-all duration-300">
          {t(project.titleKey)}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {t(project.descKey)}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="px-2 py-1 text-xs bg-white/5 text-white/70 rounded-md border border-white/10"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* View Project Button */}
        <button className="flex items-center gap-2 text-sm font-medium gradient-text group/btn">
          {t("viewProject")}
          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover/btn:translate-x-1"
          />
        </button>
      </div>
    </div>
  )
}
