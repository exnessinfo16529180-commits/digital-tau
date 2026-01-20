/* =========================
   Digital TAU - app.js (safe for multi-page)
   Works on:
   - /            (home)
   - /projects    (projects page)
   - /technologies
   - /about
   ========================= */

const translations = {
  ru: {
    nav: { home: "Главная", projects: "Проекты", technologies: "Технологии", about: "О платформе" },
    hero: { title: "DIGITAL TAU", subtitle: "Витрина Инноваций и Исследований", description: "Где встречаются идеи и технология", cta: "Explore Projects" },
    stats: { projects: "Проектов", students: "Студентов", technologies: "Технологий" },
    filters: { all: "Все", aiml: "AI/ML", iot: "IoT", web: "Веб", mobile: "Мобильные", vrar: "VR/AR" },
    card: { view: "View Project" }
  },
  kz: {
    nav: { home: "Басты бет", projects: "Жобалар", technologies: "Технологиялар", about: "Платформа туралы" },
    hero: { title: "DIGITAL TAU", subtitle: "Инновация және Зерттеу Витринасы", description: "Идеялар мен технологиялар кездесетін жер", cta: "Жобаларды зерттеу" },
    stats: { projects: "Жоба", students: "Студент", technologies: "Технология" },
    filters: { all: "Барлығы", aiml: "AI/ML", iot: "IoT", web: "Веб", mobile: "Мобильді", vrar: "VR/AR" },
    card: { view: "Жобаны ашу" }
  },
  en: {
    nav: { home: "Home", projects: "Projects", technologies: "Technologies", about: "About" },
    hero: { title: "DIGITAL TAU", subtitle: "Innovation & Research Showcase", description: "Where ideas meet technology", cta: "Explore Projects" },
    stats: { projects: "Projects", students: "Students", technologies: "Technologies" },
    filters: { all: "All", aiml: "AI/ML", iot: "IoT", web: "Web", mobile: "Mobile", vrar: "VR/AR" },
    card: { view: "View Project" }
  }
};

const DEFAULT_LANG = "ru";
const DEFAULT_FILTER = "all";

const state = {
  lang: loadLang(),
  filter: loadFilter(),
  projects: []
};

/* -------------------------
   Small helpers
------------------------- */
function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadLang() {
  const saved = localStorage.getItem("dt_lang");
  if (saved && translations[saved]) return saved;
  return DEFAULT_LANG;
}
function saveLang(lang) {
  localStorage.setItem("dt_lang", lang);
}

function loadFilter() {
  return localStorage.getItem("dt_filter") || DEFAULT_FILTER;
}
function saveFilter(filter) {
  localStorage.setItem("dt_filter", filter);
}

function getT() {
  return translations[state.lang] || translations[DEFAULT_LANG];
}

/* -------------------------
   Header scroll effect
------------------------- */
function initHeaderScroll() {
  const header = qs("#header");
  if (!header) return;

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 50);
  window.addEventListener("scroll", onScroll);
  onScroll(); // initial
}

/* -------------------------
   Mobile menu
------------------------- */
function initMobileMenu() {
  const burger = qs("#burger");
  const mobileMenu = qs("#mobileMenu");
  if (!burger || !mobileMenu) return;

  burger.addEventListener("click", () => {
    mobileMenu.classList.toggle("is-open");
  });

  // close after click
  qsa("a", mobileMenu).forEach(a => {
    a.addEventListener("click", () => mobileMenu.classList.remove("is-open"));
  });
}

/* -------------------------
   Language switcher
------------------------- */
function setLangUI(lang) {
  // Update buttons
  qsa(".lang__btn").forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.lang === lang);
  });
}

function applyTranslations() {
  const t = getT();

  qsa("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n; // e.g. "nav.home"
    if (!key) return;

    const parts = key.split(".");
    let value = t;
    for (const p of parts) value = value?.[p];

    if (typeof value === "string") el.textContent = value;
  });

  // Also update <html lang="">
  document.documentElement.setAttribute("lang", state.lang);
}

function initLanguageSwitcher() {
  setLangUI(state.lang);
  applyTranslations();

  qsa(".lang__btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const lang = btn.dataset.lang;
      if (!lang || !translations[lang]) return;

      state.lang = lang;
      saveLang(lang);

      setLangUI(lang);
      applyTranslations();

      // re-render projects (titles/descriptions depend on lang)
      if (qs("#projectsGrid")) {
        await loadProjects(); // optional: not required, but ok
        renderProjects();
      }
    });
  });
}

/* -------------------------
   Highlight active nav item
------------------------- */
function initActiveNav() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const navLinks = qsa(".nav a");

  navLinks.forEach(a => {
    const href = a.getAttribute("href");
    if (!href) return;

    // Normalize href
    const norm = href.replace(/\/+$/, "") || "/";
    const isActive = (norm === path);

    a.classList.toggle("is-active-link", isActive);
  });
}

/* -------------------------
   Stats animation
------------------------- */
function animateCounter(el, target, duration = 1200) {
  const steps = 60;
  const stepTime = Math.max(10, Math.floor(duration / steps));
  let i = 0;

  const timer = setInterval(() => {
    i++;
    const val = Math.floor((target / steps) * i);
    el.textContent = String(val);
    if (i >= steps) {
      el.textContent = String(target);
      clearInterval(timer);
    }
  }, stepTime);
}

async function loadStats() {
  // only if elements exist
  const elProjects = qs("#statProjects");
  const elStudents = qs("#statStudents");
  const elTech = qs("#statTech");
  if (!elProjects || !elStudents || !elTech) return;

  try {
    const res = await fetch("/api/stats", { cache: "no-store" });
    if (!res.ok) throw new Error("stats http error");
    const data = await res.json();

    animateCounter(elProjects, Number(data.projects ?? 0));
    animateCounter(elStudents, Number(data.students ?? 0));
    animateCounter(elTech, Number(data.technologies ?? 0));
  } catch (e) {
    // fallback
    animateCounter(elProjects, 150);
    animateCounter(elStudents, 500);
    animateCounter(elTech, 25);
  }
}

/* -------------------------
   Projects: load + filter + render
------------------------- */
function getTitle(project) {
  if (state.lang === "ru") return project.titleRu;
  if (state.lang === "kz") return project.titleKz;
  return project.titleEn;
}
function getDesc(project) {
  if (state.lang === "ru") return project.descriptionRu;
  if (state.lang === "kz") return project.descriptionKz;
  return project.descriptionEn;
}

function setFilterUI(filter) {
  const filtersEl = qs("#filters");
  if (!filtersEl) return;

  qsa(".chip", filtersEl).forEach(chip => {
    chip.classList.toggle("is-active", chip.dataset.filter === filter);
  });
}

async function loadProjects() {
  // only if there is a grid on the page
  if (!qs("#projectsGrid")) return;

  const category = state.filter;
  const url = (category && category !== "all")
    ? `/api/projects?category=${encodeURIComponent(category)}`
    : "/api/projects";

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("projects http error");
    state.projects = await res.json();
  } catch (e) {
    // fallback mock (same as before)
    state.projects = [
      {
        id: "1",
        titleRu: "AI Анализатор",
        titleKz: "AI Талдаушы",
        titleEn: "AI Analyzer",
        descriptionRu: "Система машинного обучения для анализа данных",
        descriptionKz: "Деректерді талдауға арналған машиналық оқыту жүйесі",
        descriptionEn: "Machine learning system for data analysis",
        technologies: ["Python", "TensorFlow", "React"],
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900",
        category: "aiml",
        featured: true
      },
      {
        id: "2",
        titleRu: "IoT Мониторинг",
        titleKz: "IoT Бақылау",
        titleEn: "IoT Monitoring",
        descriptionRu: "Платформа для мониторинга IoT устройств",
        descriptionKz: "IoT құрылғыларын бақылау платформасы",
        descriptionEn: "Platform for monitoring IoT devices",
        technologies: ["Node.js", "MongoDB", "MQTT"],
        image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=900",
        category: "iot",
        featured: true
      },
      {
        id: "3",
        titleRu: "Веб-портал",
        titleKz: "Веб-портал",
        titleEn: "Web Portal",
        descriptionRu: "Современный веб-портал университета",
        descriptionKz: "Университеттің заманауи веб-порталы",
        descriptionEn: "Modern university web portal",
        technologies: ["Next.js", "TypeScript", "Tailwind"],
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900",
        category: "web",
        featured: false
      }
    ];

    if (category && category !== "all") {
      state.projects = state.projects.filter(p => p.category === category);
    }
  }
}

function renderProjects() {
  const grid = qs("#projectsGrid");
  if (!grid) return;

  const t = getT();
  grid.innerHTML = "";

  const list = Array.isArray(state.projects) ? state.projects : [];
  if (list.length === 0) {
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.style.textAlign = "center";
    empty.style.padding = "20px 0";
    empty.textContent = "No projects";
    grid.appendChild(empty);
    return;
  }

  list.forEach(p => {
    const title = getTitle(p);
    const desc = getDesc(p);

    const card = document.createElement("article");
    card.className = "card";

    const techBadges = (p.technologies || [])
      .map(x => `<span class="badge">${escapeHtml(x)}</span>`)
      .join("");

    card.innerHTML = `
      <div class="card__img">
        <img src="${escapeHtml(p.image)}" alt="${escapeHtml(title)}" loading="lazy">
        <div class="card__shade"></div>
      </div>
      <div class="card__body">
        <h3 class="card__title">${escapeHtml(title)}</h3>
        <p class="card__desc">${escapeHtml(desc)}</p>
        <div class="badges">${techBadges}</div>
        <a class="card__cta" href="/projects/${encodeURIComponent(p.id)}">
          ${escapeHtml(t.card.view)} <span>→</span>
        </a>
      </div>
    `;

    grid.appendChild(card);
  });
}

function initFilters() {
  const filtersEl = qs("#filters");
  const grid = qs("#projectsGrid");
  if (!filtersEl || !grid) return; // only on projects pages

  // set initial UI state
  setFilterUI(state.filter);

  qsa(".chip", filtersEl).forEach(chip => {
    chip.addEventListener("click", async () => {
      const next = chip.dataset.filter || "all";
      state.filter = next;
      saveFilter(next);

      setFilterUI(next);
      await loadProjects();
      renderProjects();
    });
  });
}

/* -------------------------
   Optional: smooth scroll for anchors (if any)
------------------------- */
function initSmoothAnchorScroll() {
  // If you still have some # anchors, this won't break normal links.
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;

      const target = qs(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* -------------------------
   Init
------------------------- */
(async function init() {
  initHeaderScroll();
  initMobileMenu();
  initLanguageSwitcher();
  initActiveNav();
  initSmoothAnchorScroll();

  // Load only where needed
  await loadStats();
  await loadProjects();
  initFilters();
  renderProjects();
})();
