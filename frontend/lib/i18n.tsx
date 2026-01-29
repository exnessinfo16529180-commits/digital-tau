"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

type Language = "en" | "ru" | "kz"

interface Translations {
  [key: string]: {
    en: string
    ru: string
    kz: string
  }
}

const translations: Translations = {
  // Navigation
  home: { en: "Home", ru: "Главная", kz: "Басты бет" },
  projects: { en: "Projects", ru: "Проекты", kz: "Жобалар" },
  technologies: { en: "Technologies", ru: "Технологии", kz: "Технологиялар" },
  about: { en: "About", ru: "О нас", kz: "Біз туралы" },
  
  // Hero
  digitalTau: { en: "DIGITAL TAU", ru: "DIGITAL TAU", kz: "DIGITAL TAU" },
  innovationShowcase: { en: "Innovation & Research Showcase", ru: "Витрина инноваций и исследований", kz: "Инновация және зерттеу көрмесі" },
  whereIdeasMeet: { en: "Where ideas meet technology", ru: "Где идеи встречаются с технологиями", kz: "Идеялар технологиямен кездесетін жер" },
  exploreProjects: { en: "Explore Projects", ru: "Изучить проекты", kz: "Жобаларды зерттеу" },
  
  // Stats
  digitalTauByNumbers: { en: "Digital TAU by the Numbers", ru: "Digital TAU в цифрах", kz: "Сандарда Digital TAU" },
  projectsCount: { en: "Projects", ru: "Проектов", kz: "Жоба" },
  studentsCount: { en: "Students", ru: "Студентов", kz: "Студент" },
  technologiesCount: { en: "Technologies", ru: "Технологий", kz: "Технология" },
  
  // Featured Projects
  featuredProjects: { en: "Featured Projects", ru: "Избранные проекты", kz: "Таңдаулы жобалар" },
  viewProject: { en: "View Project", ru: "Смотреть проект", kz: "Жобаны көру" },
  
  // Projects Page
  projectCatalog: { en: "Project Catalog", ru: "Каталог проектов", kz: "Жобалар каталогы" },
  searchProjects: { en: "Search projects...", ru: "Поиск проектов...", kz: "Жобаларды іздеу..." },
  all: { en: "All", ru: "Все", kz: "Барлығы" },
  
  // Technologies Page
  cuttingEdgeTech: { en: "Cutting-edge technology in every project", ru: "Передовые технологии в каждом проекте", kz: "Әр жобада озық технология" },
  andManyMore: { en: "And many more technologies powering innovation at TAU University", ru: "И многие другие технологии, способствующие инновациям в TAU University", kz: "TAU University инновациясын қуаттайтын көптеген басқа технологиялар" },
  exploreAllTech: { en: "Explore All Technologies", ru: "Изучить все технологии", kz: "Барлық технологияларды зерттеу" },
  
  // About Page
  aboutDigitalTau: { en: "About Digital TAU", ru: "О Digital TAU", kz: "Digital TAU туралы" },
  universityName: { en: "M.H. Dulati University", ru: "Университет им. М.Х. Дулати", kz: "М.Х. Дулати атындағы университет" },
  tarazKazakhstan: { en: "Taraz, Kazakhstan", ru: "Тараз, Казахстан", kz: "Тараз, Қазақстан" },
  universityDesc: { en: "M.H. Dulati Taraz Regional University is a leading educational institution in Kazakhstan, dedicated to fostering innovation, research excellence, and student development.", ru: "Таразский региональный университет им. М.Х. Дулати — ведущее образовательное учреждение Казахстана, ориентированное на развитие инноваций, исследовательского мастерства и развитие студентов.", kz: "М.Х. Дулати атындағы Тараз өңірлік университеті - инновацияларды, зерттеу шеберлігін және студенттердің дамуын қолдауға арналған Қазақстандағы жетекші білім беру мекемесі." },
  keyMilestones: { en: "Key Milestones", ru: "Ключевые достижения", kz: "Негізгі жетістіктер" },
  foundedYear: { en: "Founded in 1938", ru: "Основан в 1938 году", kz: "1938 жылы құрылған" },
  researchProjects: { en: "150+ Research Projects", ru: "150+ исследовательских проектов", kz: "150+ зерттеу жобасы" },
  activeStudents: { en: "2500+ Active Students", ru: "2500+ активных студентов", kz: "2500+ белсенді студент" },
  globalPartnerships: { en: "Global Partnerships", ru: "Глобальные партнерства", kz: "Жаһандық серіктестіктер" },
  aboutDesc: { en: "Digital TAU is the innovation hub of M.H. Dulati University, showcasing cutting-edge projects and research from our talented students and faculty. We bridge the gap between academic excellence and real-world applications.", ru: "Digital TAU — это инновационный центр Университета им. М.Х. Дулати, демонстрирующий передовые проекты и исследования наших талантливых студентов и преподавателей.", kz: "Digital TAU - М.Х. Дулати университетінің инновациялық орталығы, біздің талантты студенттер мен оқытушылардың озық жобалары мен зерттеулерін көрсетеді." },
  innovation: { en: "Innovation", ru: "Инновации", kz: "Инновация" },
  innovationDesc: { en: "Cutting-edge technologies and ideas", ru: "Передовые технологии и идеи", kz: "Озық технологиялар мен идеялар" },
  impact: { en: "Impact", ru: "Влияние", kz: "Әсер" },
  impactDesc: { en: "Creating positive impact on society", ru: "Создание позитивного влияния на общество", kz: "Қоғамға оң әсер ету" },
  collaboration: { en: "Collaboration", ru: "Сотрудничество", kz: "Ынтымақтастық" },
  collaborationDesc: { en: "Bringing together students and faculty", ru: "Объединение студентов и преподавателей", kz: "Студенттер мен оқытушыларды біріктіру" },
  diversity: { en: "Diversity", ru: "Разнообразие", kz: "Әртүрлілік" },
  diversityDesc: { en: "Diverse approaches and technologies", ru: "Разнообразные подходы и технологии", kz: "Әртүрлі тәсілдер мен технологиялар" },
  learnMore: { en: "Learn More", ru: "Узнать больше", kz: "Көбірек білу" },
  
  // Footer
  footerDesc: { en: "Showcasing innovation and research excellence at M.H. Dulati University", ru: "Демонстрация инноваций и исследовательского мастерства в Университете им. М.Х. Дулати", kz: "М.Х. Дулати университетіндегі инновация және зерттеу шеберлігін көрсету" },
  contacts: { en: "Contacts", ru: "Контакты", kz: "Байланыс" },
  socialMedia: { en: "Social Media", ru: "Социальные сети", kz: "Әлеуметтік желілер" },
  copyright: { en: "TAU University. All rights reserved.", ru: "TAU University. Все права защищены.", kz: "TAU University. Барлық құқықтар қорғалған." },
  privacy: { en: "Privacy", ru: "Конфиденциальность", kz: "Құпиялылық" },
  terms: { en: "Terms", ru: "Условия", kz: "Шарттар" },
  accessibility: { en: "Accessibility", ru: "Доступность", kz: "Қол жетімділік" },
  
  // Auth
  adminLogin: { en: "Admin Login", ru: "Вход администратора", kz: "Әкімші кіру" },
  loginSubtitle: { en: "Enter your credentials to access the admin panel", ru: "Введите данные для доступа к панели администратора", kz: "Әкімші тақтасына кіру үшін деректеріңізді енгізіңіз" },
  username: { en: "Username", ru: "Имя пользователя", kz: "Пайдаланушы аты" },
  password: { en: "Password", ru: "Пароль", kz: "Құпия сөз" },
  enterUsername: { en: "Enter username", ru: "Введите имя пользователя", kz: "Пайдаланушы атын енгізіңіз" },
  enterPassword: { en: "Enter password", ru: "Введите пароль", kz: "Құпия сөзді енгізіңіз" },
  rememberMe: { en: "Remember me", ru: "Запомнить меня", kz: "Мені есте сақта" },
  login: { en: "Login", ru: "Войти", kz: "Кіру" },
  loggingIn: { en: "Logging in...", ru: "Вход...", kz: "Кіру..." },
  invalidCredentials: { en: "Invalid username or password", ru: "Неверное имя пользователя или пароль", kz: "Пайдаланушы аты немесе құпия сөз дұрыс емес" },
  demoCredentials: { en: "Demo credentials", ru: "Демо данные", kz: "Демо деректер" },
  adminPanel: { en: "Admin Panel", ru: "Панель администратора", kz: "Әкімші тақтасы" },
  admin: { en: "Admin", ru: "Админ", kz: "Әкімші" },
  
  // Admin
  dashboard: { en: "Dashboard", ru: "Панель управления", kz: "Басқару тақтасы" },
  manageProjects: { en: "Manage Projects", ru: "Управление проектами", kz: "Жобаларды басқару" },
  manageTech: { en: "Manage Technologies", ru: "Управление технологиями", kz: "Технологияларды басқару" },
  users: { en: "Users", ru: "Пользователи", kz: "Пайдаланушылар" },
  settings: { en: "Settings", ru: "Настройки", kz: "Параметрлер" },
  logout: { en: "Logout", ru: "Выход", kz: "Шығу" },
  totalProjects: { en: "Total Projects", ru: "Всего проектов", kz: "Барлық жобалар" },
  totalStudents: { en: "Total Students", ru: "Всего студентов", kz: "Барлық студенттер" },
  activeTechnologies: { en: "Active Technologies", ru: "Активные технологии", kz: "Белсенді технологиялар" },
  recentActivity: { en: "Recent Activity", ru: "Последняя активность", kz: "Соңғы белсенділік" },
  addNewProject: { en: "Add New Project", ru: "Добавить проект", kz: "Жаңа жоба қосу" },
  title: { en: "Title", ru: "Название", kz: "Атауы" },
  description: { en: "Description", ru: "Описание", kz: "Сипаттама" },
  category: { en: "Category", ru: "Категория", kz: "Категория" },
  status: { en: "Status", ru: "Статус", kz: "Мәртебе" },
  actions: { en: "Actions", ru: "Действия", kz: "Әрекеттер" },
  active: { en: "Active", ru: "Активный", kz: "Белсенді" },
  draft: { en: "Draft", ru: "Черновик", kz: "Жоба" },
  submit: { en: "Submit", ru: "Отправить", kz: "Жіберу" },
  cancel: { en: "Cancel", ru: "Отмена", kz: "Болдырмау" },
  
  // Project descriptions
  medicalAiTitle: { en: "Medical AI Diagnostics", ru: "Медицинская ИИ-диагностика", kz: "Медициналық AI диагностикасы" },
  medicalAiDesc: { en: "AI-powered diagnostic system for early disease detection using machine learning algorithms", ru: "ИИ-система диагностики для раннего выявления заболеваний с использованием алгоритмов машинного обучения", kz: "Машиналық оқыту алгоритмдерін қолданатын ауруларды ерте анықтауға арналған AI диагностика жүйесі" },
  fieldSenseTitle: { en: "FieldSense IoT Platform", ru: "Платформа FieldSense IoT", kz: "FieldSense IoT платформасы" },
  fieldSenseDesc: { en: "Smart agriculture monitoring system with real-time sensor data and analytics", ru: "Интеллектуальная система мониторинга сельского хозяйства с данными датчиков в реальном времени", kz: "Нақты уақыттағы сенсор деректері мен аналитикасы бар ақылды ауыл шаруашылығы мониторинг жүйесі" },
  eduWebTitle: { en: "EduWeb Platform", ru: "Платформа EduWeb", kz: "EduWeb платформасы" },
  eduWebDesc: { en: "Modern e-learning platform with interactive courses and progress tracking", ru: "Современная платформа электронного обучения с интерактивными курсами и отслеживанием прогресса", kz: "Интерактивті курстар мен прогресті бақылауы бар заманауи электронды оқыту платформасы" },
  mobileLearnTitle: { en: "MobileLearn App", ru: "Приложение MobileLearn", kz: "MobileLearn қосымшасы" },
  mobileLearnDesc: { en: "Cross-platform mobile application for on-the-go learning experiences", ru: "Кроссплатформенное мобильное приложение для обучения на ходу", kz: "Жолда оқу тәжірибесі үшін кросс-платформалық мобильді қосымша" },
  vrCampusTitle: { en: "VR Campus Experience", ru: "VR Кампус", kz: "VR Кампус тәжірибесі" },
  vrCampusDesc: { en: "Immersive virtual reality campus tour for prospective students", ru: "Иммерсивная экскурсия по кампусу в виртуальной реальности для абитуриентов", kz: "Болашақ студенттер үшін виртуалды шындықтағы кампус туры" },
  arInteriorTitle: { en: "AR Interior Design", ru: "AR Дизайн интерьера", kz: "AR интерьер дизайны" },
  arInteriorDesc: { en: "Augmented reality application for visualizing furniture and interior designs", ru: "Приложение дополненной реальности для визуализации мебели и дизайна интерьера", kz: "Жиһаз және интерьер дизайнын визуализациялауға арналған толықтырылған шындық қосымшасы" },
  researchDataTitle: { en: "ResearchData Analytics", ru: "ResearchData Analytics", kz: "ResearchData Analytics" },
  researchDataDesc: { en: "Advanced data analytics platform for academic research visualization", ru: "Продвинутая платформа аналитики данных для визуализации академических исследований", kz: "Академиялық зерттеулерді визуализациялауға арналған озық деректер аналитикасы платформасы" },
  smartHomeTitle: { en: "Smart Home Control", ru: "Умный дом", kz: "Ақылды үй басқаруы" },
  smartHomeDesc: { en: "IoT-based home automation system with voice control and mobile app", ru: "Система домашней автоматизации на основе IoT с голосовым управлением и мобильным приложением", kz: "Дауыспен басқару және мобильді қосымшасы бар IoT негізіндегі үй автоматтандыру жүйесі" },
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = useCallback((key: string): string => {
    const translation = translations[key]
    if (!translation) return key
    return translation[language] || translation.en || key
  }, [language])

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
