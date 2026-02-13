import { HeroSection } from "@/components/hero-section"
import { FeaturedProjects } from "@/components/featured-projects"
import { WhyDigitalTau } from "@/components/why-digital-tau"
import { CollaborationSection } from "@/components/collaboration-section"
import { StatsSection } from "@/components/stats-section"
import { getProjects } from "@/lib/api"

export default async function HomePage() {
  // чтобы страница не падала при ошибке API
  const [projectsRes] = await Promise.allSettled([getProjects()])

  const projects =
    projectsRes.status === "fulfilled" && Array.isArray(projectsRes.value)
      ? projectsRes.value
      : []

  return (
    <>
      <HeroSection />
      <StatsSection />
      <WhyDigitalTau />
      <FeaturedProjects items={projects} />
      <CollaborationSection />
    </>
  )
}
