"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export type Language = "en" | "ru" | "kz"

type Translation = {
  en: string
  ru: string
  kz: string
}

type Translations = Record<string, Translation>

const translations: Translations = {
  /* ================= NAVIGATION ================= */
  home: { en: "Home", ru: "Главная", kz: "Басты бет" },
  projects: { en: "Projects", ru: "Проекты", kz: "Жобалар" },
  technologies: { en: "Technologies", ru: "Технологies", kz: "Технологиялар" },
  about: { en: "About", ru: "О нас", kz: "Біз туралы" },

  /* ================= HERO ================= */
  digitalTau: { en: "DIGITAL TAU", ru: "DIGITAL TAU", kz: "DIGITAL TAU" },
  innovationShowcase: {
    en: "Innovation & Research Showcase",
    ru: "Витрина инноваций и исследований",
    kz: "Инновация және зерттеу көрмесі",
  },
  whereIdeasMeet: {
    en: "Where ideas meet technology",
    ru: "Где идеи встречаются с технологиями",
    kz: "Идеялар технологиямен кездесетін жер",
  },
  exploreProjects: {
    en: "Explore Projects",
    ru: "Изучить проекты",
    kz: "Жобаларды зерттеу",
  },

  /* ================= PROJECTS ================= */
  projectCatalog: {
    en: "Project Catalog",
    ru: "Каталог проектов",
    kz: "Жобалар каталогы",
  },
  searchProjects: {
    en: "Search projects...",
    ru: "Поиск проектов...",
    kz: "Жобаларды іздеу...",
  },
  all: { en: "All", ru: "Все", kz: "Барлығы" },
  featuredProjects: {
    en: "Featured Projects",
    ru: "Избранные проекты",
    kz: "Таңдаулы жобалар",
  },
  viewProject: {
    en: "View Project",
    ru: "Смотреть проект",
    kz: "Жобаны көру",
  },

  /* ================= ABOUT – UNIVERSITY ================= */
  aboutDigitalTau: {
    en: "About Digital TAU",
    ru: "О Digital TAU",
    kz: "Digital TAU туралы",
  },
  universityName: {
    en: "Turan-Astana University",
    ru: "Университет «Туран-Астана»",
    kz: "«Тұран-Астана» университеті",
  },
  tarazKazakhstan: {
    en: "Astana, Kazakhstan",
    ru: "Астана, Казахстан",
    kz: "Астана, Қазақстан",
  },
  universityDesc: {
    en: "Turan-Astana University is a leading educational institution in Kazakhstan focused on innovation, research excellence and student development.",
    ru: "Университет «Туран-Астана» — ведущее образовательное учреждение Казахстана, ориентированное на инновации, исследования и развитие студентов.",
    kz: "«Тұран-Астана» университеті — инновация, зерттеу және студенттер дамуына бағытталған жетекші оқу орны.",
  },

  keyMilestones: {
    en: "Key Milestones",
    ru: "Ключевые достижения",
    kz: "Негізгі жетістіктер",
  },
  foundedYear: {
    en: "Founded in 1998",
    ru: "Основан в 1998 году",
    kz: "1998 жылы құрылған",
  },
  researchProjects: {
    en: "150+ Research Projects",
    ru: "150+ исследовательских проектов",
    kz: "150+ зерттеу жобасы",
  },
  activeStudents: {
    en: "2500+ Active Students",
    ru: "2500+ активных студентов",
    kz: "2500+ белсенді студент",
  },
  globalPartnerships: {
    en: "Global Partnerships",
    ru: "Глобальные партнерства",
    kz: "Жаһандық серіктестіктер",
  },

  /* ================= ABOUT – VALUES ================= */
  innovation: { en: "Innovation", ru: "Инновации", kz: "Инновация" },
  innovationDesc: {
    en: "Cutting-edge technologies and ideas",
    ru: "Передовые технологии и идеи",
    kz: "Озық технологиялар мен идеялар",
  },
  impact: { en: "Impact", ru: "Влияние", kz: "Әсер" },
  impactDesc: {
    en: "Creating positive impact on society",
    ru: "Создание позитивного влияния на общество",
    kz: "Қоғамға оң әсер ету",
  },
  collaboration: {
    en: "Collaboration",
    ru: "Сотрудничество",
    kz: "Ынтымақтастық",
  },
  collaborationDesc: {
    en: "Bringing together students and faculty",
    ru: "Объединение студентов и преподавателей",
    kz: "Студенттер мен оқытушыларды біріктіру",
  },
  diversity: { en: "Diversity", ru: "Разнообразие", kz: "Әртүрлілік" },
  diversityDesc: {
    en: "Diverse approaches and technologies",
    ru: "Разнообразные подходы и технологии",
    kz: "Әртүрлі тәсілдер мен технологиялар",
  },
  learnMore: {
    en: "Learn More",
    ru: "Узнать больше",
    kz: "Көбірек білу",
  },

  /* ================= FOOTER ================= */
  footerDesc: {
    en: "Showcasing innovation and research excellence at Turan-Astana University",
    ru: "Демонстрация инноваций и исследовательского мастерства в Университете «Туран-Астана»",
    kz: "«Тұран-Астана» университетіндегі инновация және зерттеу шеберлігін көрсету",
  },
  contacts: { en: "Contacts", ru: "Контакты", kz: "Байланыс" },
  socialMedia: {
    en: "Social Media",
    ru: "Социальные сети",
    kz: "Әлеуметтік желілер",
  },

  /* ================= ADMIN ================= */
  admin: { en: "Admin", ru: "Админ", kz: "Әкімші" },
  dashboard: { en: "Dashboard", ru: "Панель управления", kz: "Басқару тақтасы" },
  manageProjects: {
    en: "Manage Projects",
    ru: "Управление проектами",
    kz: "Жобаларды басқару",
  },
  settings: { en: "Settings", ru: "Настройки", kz: "Параметрлер" },
  logout: { en: "Logout", ru: "Выход", kz: "Шығу" },
}

/* ================= CONTEXT ================= */

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    const saved = localStorage.getItem("lang")
    if (saved === "en" || saved === "ru" || saved === "kz") {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("lang", lang)
  }, [])

  const t = useCallback(
    (key: string) => translations[key]?.[language] ?? translations[key]?.en ?? key,
    [language]
  )

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider")
  return ctx
}