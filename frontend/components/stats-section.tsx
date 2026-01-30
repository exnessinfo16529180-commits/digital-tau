"use client"

import { useEffect, useRef, useState } from "react"
import { useI18n } from "@/lib/i18n"

export type Stats = {
  projects: number
  students: number
  technologies: number
}

interface StatsSectionProps {
  stats: Stats
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
    <span ref={ref} className="gradient-text">
      {count}
      {suffix}
    </span>
  )
}

export function StatsSection({ stats }: StatsSectionProps) {
  const { t } = useI18n()

  // защита от undefined / null
  const safe = {
    projects: Number(stats?.projects ?? 0),
    students: Number(stats?.students ?? 0),
    technologies: Number(stats?.technologies ?? 0),
  }

  const statsData = [
    { value: safe.projects, suffix: "+", label: t("projectsCount") },
    { value: safe.students, suffix: "+", label: t("studentsCount") },
    { value: safe.technologies, suffix: "+", label: t("technologiesCount") },
  ]

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            {t("digitalTauByNumbers")}
          </h2>
          <div className="w-24 h-1 gradient-bg mx-auto rounded-full" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="glass border border-white/10 rounded-2xl p-8 text-center
                         hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-5xl md:text-6xl font-bold mb-2">
                <Counter end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-muted-foreground text-lg">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
