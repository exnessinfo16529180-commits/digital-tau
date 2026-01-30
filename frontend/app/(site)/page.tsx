import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { FeaturedProjects } from "@/components/featured-projects"
import { getProjects, getStats } from "@/lib/api"

export default async function HomePage() {
  // чтобы страница не падала при ошибке API
  const [statsRes, projectsRes] = await Promise.allSettled([
    getStats(),
    getProjects(),
  ])

  const stats =
    statsRes.status === "fulfilled"
      ? statsRes.value
      : { projects: 0, students: 0, technologies: 0 }

  const projects =
    projectsRes.status === "fulfilled" && Array.isArray(projectsRes.value)
      ? projectsRes.value
      : []

  return (
    <>
      <HeroSection />
      <StatsSection stats={stats} />
      <FeaturedProjects items={projects} />
    </>
  )
}
