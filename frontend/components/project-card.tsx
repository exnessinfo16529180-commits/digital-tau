"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Box } from "lucide-react"
import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import type { UiProject } from "@/lib/mappers/project.mapper"
import { motion } from "framer-motion"

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

  const techs = Array.isArray(project.techStack) ? project.techStack : []

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn(
        "group relative rounded-2xl overflow-hidden glass border border-cyan-500/20",
        "hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/10",
        "transition-all duration-500",
        className
      )}
    >
      {/* IMAGE */}
      <div className="relative h-56 overflow-hidden bg-slate-900">
        {project.image && !imgFailed ? (
          <Image
            src={project.image}
            alt={title}
            fill
            className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
            sizes="(max-width: 768px) 100vw, 350px"
            onError={() => {
              brokenImageUrls.add(project.image as string)
              setImgFailed(true)
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl text-cyan-500/20">
            <Box size={48} />
          </div>
        )}

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

        {/* CATEGORY BADGE */}
        <span className="absolute top-4 left-4 px-3 py-1 text-[10px] font-black rounded-full bg-cyan-500 text-black uppercase tracking-widest">
          {category}
        </span>
      </div>

      {/* CONTENT */}
      <div className="p-6 relative">
        <h3 className="font-black text-xl text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300 tracking-tight">
          {title}
        </h3>

        <p className="text-sm text-slate-400 line-clamp-2 mb-6 h-10">
          {description}
        </p>

        {/* TECH STACK */}
        <div className="flex flex-wrap gap-2 mb-6">
          {techs.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="px-2 py-1 text-[10px] bg-cyan-500/5 text-cyan-300 font-bold rounded border border-cyan-500/20 uppercase tracking-tighter"
            >
              {tech}
            </span>
          ))}
          {techs.length > 3 && (
            <span className="text-[10px] text-slate-500">+{techs.length - 3}</span>
          )}
        </div>

        {/* BUTTON */}
        <Link
          href={href}
          className="flex items-center justify-between w-full p-4 rounded-xl bg-white/5 border border-white/10 group/btn hover:bg-cyan-500 hover:text-black transition-all duration-300"
        >
          <span className="font-bold uppercase tracking-widest text-xs">
            {t("viewProject")}
          </span>
          <ArrowRight
            size={18}
            className="transition-transform duration-300 group-hover/btn:translate-x-1"
          />
        </Link>

        {/* LEVER ACCENT */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-cyan-500/40 rounded-tr-2xl" />
      </div>
    </motion.div>
  )
}
