"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"

type Particle = {
  id: number
  left: string
  top: string
  animationDelay: string
  animationDuration: string
}

export function HeroSection() {
  const { t } = useI18n()
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${3 + Math.random() * 2}s`,
      }))
    )
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-rose-700 to-red-900 opacity-30 animate-float"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.animationDelay,
              animationDuration: p.animationDuration,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
          <span className="text-white">DIGITAL </span>
          <span className="gradient-text">TAU</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl lg:text-3xl gradient-text font-semibold mb-4">
          {t("innovationShowcase")}
        </p>

        {/* Tagline */}
        <p className="text-muted-foreground text-lg md:text-xl mb-10">
          {t("whereIdeasMeet")}
        </p>

        {/* CTA Button */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full gradient-bg text-white font-semibold text-lg
                     transition-all duration-300 hover:scale-105 glow-hover group"
        >
          {t("exploreProjects")}
          <ArrowRight
            size={20}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>

      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  )
}
