"use client"

import { useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { projects } from "@/lib/data"
import { ProjectCard } from "./project-card"

export function FeaturedProjects() {
  const { t } = useI18n()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const featuredProjects = projects.filter((p) => p.status === "active").slice(0, 6)
  const totalSlides = featuredProjects.length

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return

    const cardWidth = 380
    const gap = 24
    const scrollAmount = cardWidth + gap

    if (direction === "left") {
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" })
      setCurrentIndex(Math.max(0, currentIndex - 1))
    } else {
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
      setCurrentIndex(Math.min(totalSlides - 1, currentIndex + 1))
    }
  }

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return

    const cardWidth = 380
    const gap = 24
    const scrollPosition = index * (cardWidth + gap)

    scrollRef.current.scrollTo({ left: scrollPosition, behavior: "smooth" })
    setCurrentIndex(index)
  }

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            {t("featuredProjects")}
          </h2>
          <div className="w-24 h-1 gradient-bg mx-auto rounded-full" />
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Cards Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {featuredProjects.map((project) => (
              <div key={project.id} className="flex-none w-[350px] snap-start">
                <ProjectCard project={project} />
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => scroll("left")}
              className="p-3 rounded-full glass border border-white/10 text-white/70
                         hover:text-white hover:border-white/30 transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={24} />
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-2">
              {featuredProjects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-6 gradient-bg"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => scroll("right")}
              className="p-3 rounded-full glass border border-white/10 text-white/70
                         hover:text-white hover:border-white/30 transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentIndex === totalSlides - 1}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
