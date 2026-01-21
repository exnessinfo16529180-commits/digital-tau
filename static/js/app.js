/* =========================
   Digital TAU - app.js (safe for multi-page)
   Works on:
   - /            (home)
   - /projects    (projects page)
   - /technologies
   - /about
   ========================= */

"use strict";

const translations = {
  ru: {
    nav: { home: "Главная", projects: "Проекты", technologies: "Технологии", about: "О платформе" },
    hero: { title: "DIGITAL TAU", subtitle: "Витрина Инноваций и Исследований", description: "Где встречаются идеи и технологии", cta: "Explore Projects" },
    stats: { projects: "Проектов", students: "Студентов", technologies: "Технологий" },
    filters: { all: "Все", aiml: "AI/ML", iot: "IoT", web: "Веб", mobile: "Мобильные", vrar: "VR/AR" },
    card: { view: "View Project" },
    empty: { projects: "Нет проектов" }
  },
  kz: {
    nav: { home: "Басты бет", projects: "Жобалар", technologies: "Технологиялар", about: "Платформа туралы" },
    hero: { title: "DIGITAL TAU", subtitle: "Инновация және Зерттеу Витринасы", description: "Идеялар мен технологиялар кездесетін жер", cta: "Жобаларды зерттеу" },
    stats: { projects: "Жоба", students: "Студент", technologies: "Технология" },
    filters: { all: "Барлығы", aiml: "AI/ML", iot: "IoT", web: "Веб", mobile: "Мобильді", vrar: "VR/AR" },
    card: { view: "Жобаны ашу" },
    empty: { projects: "Жоба жоқ" }
  },
  en: {
    nav: { home: "Home", projects: "Projects", technologies: "Technologies", about: "About" },
    hero: { title: "DIGITAL TAU", subtitle: "Innovation & Research Showcase", description: "Where ideas meet technology", cta: "Explore Projects" },
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
  projects: [] // сюда загрузим с /api/projects
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

function loadLang() {
  const saved = localStorage.getItem("dt_lang");
  if (saved && translations[saved]) return saved;
  return DEFAULT_LANG;
}
function saveLang(lang) { localStorage.setItem("dt_lang", lang); }

function loadFilter() {
  return localStorage.getItem("dt_filter") || DEFAULT_FILTER;
}
function saveFilter(filter) { localStorage.setItem("dt_filter", filter); }

function getT() { return translations[state.lang] || translations[DEFAULT_LANG]; }

/* -------------------------
   Header scroll effect
------------------------- */
function initHeaderScroll() {
  const header = qs("#header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 50);
  window.addEventListener("scroll", onScroll);
  onScroll();
}

/* -------------------------
   Mobile menu
------------------------- */
function initMobileMenu() {
  const burger = qs("#burger");
  const mobileMenu = qs("#mobileMenu");
  if (!burger || !mobileMenu) return;

  burger.addEventListener("click", () => mobileMenu.classList.toggle("is-open"));
  qsa("a", mobileMenu).forEach(a => a.addEventListener("click", () => mobileMenu.classList.remove("is-open")));
}

/* -------------------------
   Translations
------------------------- */
function setLangUI(lang) {
  qsa(".lang__btn").forEach(btn => btn.classList.toggle("is-active", btn.dataset.lang === lang));
  document.documentElement.setAttribute("lang", lang);
}

function readT(key) {
  const t = getT();
  const parts = key.split(".");
  let value = t;
  for (const p of parts) value = value?.[p];
  return (typeof value === "string") ? value : null;
}

function applyTranslations() {
  qsa("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    const v = key ? readT(key) : null;
    if (v) el.textContent = v;
  });

  // CTA на главной: ведём на /projects
  const cta = qs("#heroCta");
  if (cta) cta.setAttribute("href", "/projects");
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

      // Просто перерисуем карточки в новом языке (без повторного fetch)
      if (qs("#projectsGrid")) renderProjects();
    });
  });
}

/* -------------------------
   Active nav highlight
------------------------- */
function normalizePath(p) {
  const x = (p || "").split("?")[0].split("#")[0];
  return x.replace(/\/+$/, "") || "/";
}

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
   Projects
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

function setFilterUI(filter) {
  const filtersEl = qs("#filters");
  if (!filtersEl) return;
  qsa(".chip", filtersEl).forEach(chip => chip.classList.toggle("is-active", chip.dataset.filter === filter));
}

async function loadProjects() {
  if (!qs("#projectsGrid")) return;

  const category = state.filter;
  const url = (category && category !== "all")
    ? `/api/projects?category=${encodeURIComponent(category)}`
    : "/api/projects";

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("projects http error");
    state.projects = await res.json();
  } catch {
    state.projects = [];
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
    empty.textContent = t.empty?.projects || "No projects";
    grid.appendChild(empty);
    return;
  }

  list.forEach(p => {
    const title = getTitle(p);
    const desc = getDesc(p);

    const card = document.createElement("article");
    card.className = "card";

    const techBadges = (p.technologies || [])
      .map(x => `<span class="badge" style="letter-spacing:normal">${escapeHtml(x)}</span>`)
      .join("");

    card.innerHTML = `
      <div class="card__img">
        <img src="${escapeHtml(p.image)}" alt="${escapeHtml(title)}" loading="lazy">
        <div class="card__shade"></div>
      </div>
      <div class="card__body">
        <h3 class="card__title" style="letter-spacing:normal">${escapeHtml(title)}</h3>
        <p class="card__desc" style="letter-spacing:normal">${escapeHtml(desc)}</p>
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
   Optional: smooth scroll for anchors
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

  // projects only when grid exists
  if (qs("#projectsGrid")) {
    await loadProjects();
    initFilters();
    renderProjects();
  }
})();
