"use client"

import { useEffect, useRef, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { motion } from "framer-motion"

export type Stats = {
  projects: number
  students: number
  technologies: number
}

interface StatsSectionProps {
  stats?: Stats
}

interface CounterProps {
  end: number
  duration?: number
  suffix?: string
}

function Counter({ end, duration = 2000, suffix = "" }: CounterProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime = 0
    let animationFrame = 0

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      // easing
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))

      if (progress < 1) animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [isVisible, end, duration])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

export function StatsSection({ stats }: StatsSectionProps) {
  const { t } = useI18n()

  const safe = {
    projects: Number(stats?.projects ?? 150),
    students: Number(stats?.students ?? 2500),
    technologies: Number(stats?.technologies ?? 45),
  }

  const statsData = [
    { value: safe.projects, suffix: "+", label: t("projectsCount"), color: "text-cyan-400" },
    { value: safe.students, suffix: "+", label: t("studentsCount"), color: "text-purple-400" },
    { value: safe.technologies, suffix: "+", label: t("technologiesCount"), color: "text-gold-metallic" },
  ]

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {statsData.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative text-center group"
            >
              <div className={`text-6xl md:text-7xl font-black mb-4 ${stat.color} tracking-tighter transition-transform group-hover:scale-110 duration-500`}>
                <Counter end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-slate-400 text-lg font-bold uppercase tracking-[0.2em]">
                {stat.label}
              </p>

              {/* Technical accent */}
              <div className="mt-4 flex justify-center">
                <div className="w-12 h-0.5 bg-slate-800 relative">
                  <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500 group-hover:left-full group-hover:-translate-x-full transition-all duration-700" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
