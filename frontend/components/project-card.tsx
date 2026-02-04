"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import type { UiProject } from "@/lib/mappers/project.mapper"

const brokenImageUrls = new Set<string>()

type Props = {
  project: UiProject
  className?: string
}

export function ProjectCard({ project, className }: Props) {
  const { t } = useI18n()
  const [imgFailed, setImgFailed] = useState(() => !!(project.image && brokenImageUrls.has(project.image)))

  const title = project.title?.trim() || "Untitled project"
  const description = project.description?.trim() || "—"
  const category = project.category || "Web"

  const idStr = String(project.id ?? "").trim()
  const href =
    idStr && idStr !== "undefined" && idStr !== "null"
      ? `/projects/${encodeURIComponent(idStr)}`
      : "/projects"

  // безопасный techStack
  const techs = Array.isArray(project.techStack) ? project.techStack : []

  return (
    <div
      className={cn(
        "group relative rounded-2xl overflow-hidden glass border border-white/10",
        "hover:border-white/20 hover:shadow-xl hover:shadow-rose-900/20",
        "transition-all duration-300 hover:-translate-y-1",
        className
      )}
    >
      {/* IMAGE */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        {project.image && !imgFailed ? (
          <Image
            src={project.image}
            alt={title}
            fill
            className="object-cover opacity-90"
            sizes="(max-width: 768px) 100vw, 350px"
            onError={() => {
              brokenImageUrls.add(project.image as string)
              setImgFailed(true)
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl text-white/20">
            {category === "AI/ML" && "🧠"}
            {category === "IoT" && "📡"}
            {category === "Web" && "🌐"}
            {category === "Mobile" && "📱"}
            {category === "VR/AR" && "🥽"}
          </div>
        )}

        {/* CATEGORY BADGE */}
        <span className="absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full gradient-bg text-white">
          {category}
        </span>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-white mb-2 group-hover:gradient-text transition-all duration-300">
          {title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description}
        </p>

        {/* TECH STACK */}
        <div className="flex flex-wrap gap-2 mb-4">
          {techs.length ? (
            techs.map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 text-xs bg-white/5 text-white/70 rounded-md border border-white/10"
              >
                {tech}
              </span>
            ))
          ) : (
            <span className="text-xs text-white/40">No tech stack</span>
          )}
        </div>

        {/* BUTTON */}
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-sm font-medium gradient-text group/btn"
      >
        {t("viewProject")}
          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover/btn:translate-x-1"
          />
        </Link>
      </div>
    </div>
  )
}
