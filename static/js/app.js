/* =========================
   Digital TAU - app.js (safe for multi-page)
   Pages:
   - /            (home preview: featured)
   - /projects    (projects page: all + filters)
   - /technologies
   - /about
   ========================= */

"use strict";

/* -------------------------
   i18n
------------------------- */
const translations = {
  ru: {
    nav: { home: "Главная", projects: "Проекты", technologies: "Технологии", about: "О платформе" },
    hero: {
      title: "DIGITAL TAU",
      subtitle: "Витрина Инноваций и Исследований",
      description: "Где встречаются идеи и технологии",
      cta: "Explore Projects"
    },
    stats: { projects: "Проектов", students: "Студентов", technologies: "Технологий" },
    filters: { all: "Все", aiml: "AI/ML", iot: "IoT", web: "Веб", mobile: "Мобильные", vrar: "VR/AR" },
    card: { view: "View Project" },
    empty: { projects: "Нет проектов" }
  },
  kz: {
    nav: { home: "Басты бет", projects: "Жобалар", technologies: "Технологиялар", about: "Платформа туралы" },
    hero: {
      title: "DIGITAL TAU",
      subtitle: "Инновация және Зерттеу Витринасы",
      description: "Идеялар мен технологиялар кездесетін жер",
      cta: "Жобаларды зерттеу"
    },
    stats: { projects: "Жоба", students: "Студент", technologies: "Технология" },
    filters: { all: "Барлығы", aiml: "AI/ML", iot: "IoT", web: "Веб", mobile: "Мобильді", vrar: "VR/AR" },
    card: { view: "Жобаны ашу" },
    empty: { projects: "Жоба жоқ" }
  },
  en: {
    nav: { home: "Home", projects: "Projects", technologies: "Technologies", about: "About" },
    hero: {
      title: "DIGITAL TAU",
      subtitle: "Innovation & Research Showcase",
      description: "Where ideas meet technology",
      cta: "Explore Projects"
    },
    stats: { projects: "Projects", students: "Students", technologies: "Technologies" },
    filters: { all: "All", aiml: "AI/ML", iot: "IoT", web: "Web", mobile: "Mobile", vrar: "VR/AR" },
    card: { view: "View Project" },
    empty: { projects: "No projects" }
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
   Helpers
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

function normalizePath(p) {
  const x = (p || "").split("?")[0].split("#")[0];
  return x.replace(/\/+$/, "") || "/";
}

function isHttpUrl(url) {
  if (!url) return false;
  try {
    const u = new URL(url, window.location.origin);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function loadLang() {
  const saved = localStorage.getItem("dt_lang");
  return (saved && translations[saved]) ? saved : DEFAULT_LANG;
}
function saveLang(lang) { localStorage.setItem("dt_lang", lang); }

function loadFilter() {
  return localStorage.getItem("dt_filter") || DEFAULT_FILTER;
}
function saveFilter(filter) { localStorage.setItem("dt_filter", filter); }

function getT() { return translations[state.lang] || translations[DEFAULT_LANG]; }

function readT(key) {
  const t = getT();
  const parts = String(key || "").split(".");
  let value = t;
  for (const p of parts) value = value?.[p];
  return (typeof value === "string") ? value : null;
}

/* -------------------------
   UI: header + mobile menu
------------------------- */
function initHeaderScroll() {
  const header = qs("#header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 50);
  window.addEventListener("scroll", onScroll);
  onScroll();
}

function initMobileMenu() {
  const burger = qs("#burger");
  const mobileMenu = qs("#mobileMenu");
  if (!burger || !mobileMenu) return;

  burger.addEventListener("click", () => mobileMenu.classList.toggle("is-open"));

  // close on link click
  qsa("a", mobileMenu).forEach(a => {
    a.addEventListener("click", () => mobileMenu.classList.remove("is-open"));
  });
}

/* -------------------------
   i18n apply
------------------------- */
function setLangUI(lang) {
  qsa(".lang__btn").forEach(btn => btn.classList.toggle("is-active", btn.dataset.lang === lang));
  document.documentElement.setAttribute("lang", lang);
}

function applyTranslations() {
  qsa("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    const v = key ? readT(key) : null;
    if (v) el.textContent = v;
  });
}

function initLanguageSwitcher() {
  setLangUI(state.lang);
  applyTranslations();

  qsa(".lang__btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      if (!lang || !translations[lang]) return;

      state.lang = lang;
      saveLang(lang);

      setLangUI(lang);
      applyTranslations();

      // re-render cards (no refetch)
      if (qs("#projectsGrid")) renderProjects();
    });
  });
}

/* -------------------------
   Active nav highlight
------------------------- */
function initActiveNav() {
  const path = normalizePath(window.location.pathname);
  qsa(".nav a").forEach(a => {
    const href = normalizePath(a.getAttribute("href") || "");
    a.classList.toggle("is-active-link", href === path);
  });
}

/* -------------------------
   Stats
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
  } catch {
    animateCounter(elProjects, 150);
    animateCounter(elStudents, 500);
    animateCounter(elTech, 25);
  }
}

/* -------------------------
   Projects: normalize technologies
------------------------- */
function normalizeTechnologies(value) {
  // always return array of strings
  if (Array.isArray(value)) return value.map(String).filter(Boolean);

  if (typeof value === "string") {
    let s = value.trim();

    // Postgres array text form: "{Python,TensorFlow,React}"
    if (s.startsWith("{") && s.endsWith("}")) {
      s = s.slice(1, -1).trim();
      if (!s) return [];
      const parts = s.split(",").map(x => x.trim()).filter(Boolean);

      // if it's letters -> join into one word
      if (parts.length > 0 && parts.every(p => p.length === 1)) return [parts.join("")];
      return parts;
    }

    // "Python, TensorFlow, React"
    if (s.includes(",")) {
      return s.split(",").map(x => x.trim()).filter(Boolean);
    }

    return s ? [s] : [];
  }

  return [];
}

/* -------------------------
   Projects: title/desc
------------------------- */
function getTitle(p) {
  if (state.lang === "ru") return p.titleRu;
  if (state.lang === "kz") return p.titleKz;
  return p.titleEn;
}
function getDesc(p) {
  if (state.lang === "ru") return p.descriptionRu;
  if (state.lang === "kz") return p.descriptionKz;
  return p.descriptionEn;
}

/* -------------------------
   Projects: load + render
------------------------- */
function setFilterUI(filter) {
  const filtersEl = qs("#filters");
  if (!filtersEl) return;
  qsa(".chip", filtersEl).forEach(chip => chip.classList.toggle("is-active", chip.dataset.filter === filter));
}

async function loadProjects() {
  const grid = qs("#projectsGrid");
  if (!grid) return;

  // if filters exist => /projects page => use state.filter
  // else => home preview => request all
  const filtersEl = qs("#filters");
  const category = filtersEl ? state.filter : "all";

  const url = (category && category !== "all")
    ? `/api/projects?category=${encodeURIComponent(category)}`
    : "/api/projects";

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("projects http error");
    const data = await res.json();

    state.projects = (Array.isArray(data) ? data : []).map(p => ({
      ...p,
      technologies: normalizeTechnologies(p.technologies),
    }));
  } catch {
    state.projects = [];
  }
}

function projectLink(p) {
  // If DB has projectUrl (or project_url), use it.
  // Else fallback to internal /projects/{id}
  const url = p.projectUrl || p.project_url || "";
  if (isHttpUrl(url)) return { href: url, external: true };
  return { href: `/projects/${encodeURIComponent(p.id)}`, external: false };
}

function renderProjects() {
  const grid = qs("#projectsGrid");
  if (!grid) return;

  const t = getT();
  grid.innerHTML = "";

  let list = Array.isArray(state.projects) ? state.projects : [];

  // home page: show only featured
  if (normalizePath(window.location.pathname) === "/") {
    list = list.filter(p => !!p.featured);
  }

  if (list.length === 0) {
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.style.textAlign = "center";
    empty.style.padding = "20px 0";
    empty.textContent = t.empty?.projects || "No projects";
    grid.appendChild(empty);
    return;
  }

  list.forEach(p => {
    const title = getTitle(p) || "";
    const desc = getDesc(p) || "";

    const { href, external } = projectLink(p);

    const techBadges = (p.technologies || [])
      .map(x => `<span class="badge">${escapeHtml(x)}</span>`)
      .join("");

    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <div class="card__img">
        <img src="${escapeHtml(p.image || "")}" alt="${escapeHtml(title)}" loading="lazy">
        <div class="card__shade"></div>
      </div>
      <div class="card__body">
        <h3 class="card__title">${escapeHtml(title)}</h3>
        <p class="card__desc">${escapeHtml(desc)}</p>
        <div class="badges">${techBadges}</div>
        <a class="card__cta"
           href="${escapeHtml(href)}"
           ${external ? 'target="_blank" rel="noopener noreferrer"' : ""}>
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
  if (!filtersEl || !grid) return;

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
   Smooth anchors (optional)
------------------------- */
function initSmoothAnchorScroll() {
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

  await loadStats();

  if (qs("#projectsGrid")) {
    await loadProjects();
    initFilters();
    renderProjects();
  }
})();
