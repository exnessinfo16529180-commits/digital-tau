"use client"

import { useI18n } from "@/lib/i18n"
import {
  GraduationCap,
  Check,
  Lightbulb,
  Target,
  Users,
  Layers,
  ArrowRight,
} from "lucide-react"

export default function AboutPage() {
  const { t } = useI18n()

  const milestones = [
    { key: "foundedYear" },
    { key: "researchProjects" },
    { key: "activeStudents" },
    { key: "globalPartnerships" },
  ]

  const features = [
    {
      icon: Lightbulb,
      titleKey: "innovation",
      descKey: "innovationDesc",
    },
    {
      icon: Target,
      titleKey: "impact",
      descKey: "impactDesc",
    },
    {
      icon: Users,
      titleKey: "collaboration",
      descKey: "collaborationDesc",
    },
    {
      icon: Layers,
      titleKey: "diversity",
      descKey: "diversityDesc",
    },
  ]

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            {t("about")}
          </h1>
          <div className="w-24 h-1 gradient-bg mx-auto rounded-full" />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Column - University Info */}
          <div className="glass border border-white/10 rounded-2xl p-8">
            {/* University Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center">
                <GraduationCap size={40} className="text-white" />
              </div>
            </div>

            {/* University Name */}
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              {t("universityName")}
            </h2>
            <p className="text-muted-foreground text-center mb-6">
              {t("tarazKazakhstan")}
            </p>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed mb-8">
              {t("universityDesc")}
            </p>

            {/* Key Milestones */}
            <h3 className="font-semibold text-white mb-4">{t("keyMilestones")}</h3>
            <ul className="space-y-3">
              {milestones.map((milestone, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-white" />
                  </div>
                  <span className="text-muted-foreground">{t(milestone.key)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column - About Digital TAU */}
          <div className="space-y-8">
            {/* About Heading */}
            <div>
              <h2 className="text-3xl font-bold gradient-text mb-4">
                {t("aboutDigitalTau")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("aboutDesc")}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="glass border border-white/10 rounded-xl p-5
                             hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      <feature.icon size={20} className="text-[#7A1F3D]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">
                        {t(feature.titleKey)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t(feature.descKey)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Learn More Button */}
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-bg text-white font-semibold
                             transition-all duration-300 hover:scale-105 glow-hover group">
              {t("learnMore")}
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
