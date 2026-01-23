# Copilot Instructions for Digital TAU

## Context & Architecture
- Stack: FastAPI + Jinja2 templates + vanilla JS/CSS, Postgres via SQLAlchemy engine. Containers defined in docker-compose.yml (web + db). Entrypoint is uvicorn (Dockerfile).
- Pages: /, /projects, /technologies, /about render templates in [templates](templates) (shared layout in [templates/base.html](templates/base.html); projects page currently standalone HTML).
- Static assets live in [static](static) (JS translations/DOM in [static/js/app.js](static/js/app.js), styling in [static/css/styles.css](static/css/styles.css)).
- API is served from [main.py](main.py): health, stats, and project listing endpoints; DB access uses raw SQL via SQLAlchemy engine.

## Running & Environment
- Required env: DATABASE_URL (Postgres URI with psycopg driver). docker-compose already sets `postgresql+psycopg://dt_user:dt_pass@db:5432/dt_db`.
- Local dev (hot reload, with Dockerized DB): `docker compose up --build`. Web listens on 8000, DB on 5432.
- Bare-metal run (ensure Postgres running and DATABASE_URL set): `uvicorn main:app --reload --host 0.0.0.0 --port 8000`.

## Data & API
- Expected table `projects` with columns: id, title_ru/kz/en, description_ru/kz/en, technologies (TEXT[]), image, category, featured. API assumes these exist; no migrations present.
- `/api/projects` optionally filters by `category` (all|aiml|iot|web|mobile|vrar). Results mapped through `row_to_project` to `titleRu`, `descriptionEn`, etc., and `technologies` forced to list.
- `/api/stats` counts projects and distinct technologies (unnest array); students is placeholder 500.

## Frontend behavior
- JS bootstraps on any page: language switching uses `data-lang` buttons and `data-i18n` attributes; translations stored in `translations` dict (ru/kz/en). LocalStorage keys: `dt_lang`, `dt_filter`.
- Projects grid rendered client-side from `/api/projects`; filter chips drive the `category` query param.
- Stats section animates counters using `/api/stats`; falls back to defaults on error.
- Cards expect `image` URL; link to `/projects/{id}` (currently static minimal page).

## Conventions & Patterns
- Keep template variables `data-i18n` aligned with translation keys in app.js; add all locales when adding new strings.
- Maintain project schema contract in `row_to_project` when changing DB columns; front expects `titleRu/Kz/En`, `descriptionRu/Kz/En`, `technologies` list, `featured` boolean, `image`, `category`.
- Use `StaticFiles` mount at `/static`; reference assets via `url_for('static', path=...)` in templates.
- Avoid None DATABASE_URL: app raises immediately on startup for clarity.

## Testing & Checks
- No test suite present. Basic health: GET /health. Smoke check APIs: GET /api/stats, GET /api/projects?category=web.

## Common tasks (examples)
- Add project fields: update SQL SELECTs and `row_to_project` in [main.py](main.py); update cards rendering in [static/js/app.js](static/js/app.js) and styles if needed.
- Add new page: create template extending [templates/base.html](templates/base.html); static assets under [static](static).
- Update translations: add keys for ru/kz/en in `translations` object and mark elements with `data-i18n`.

## Notes
- Current projects page template ([templates/projects.html](templates/projects.html)) uses hardcoded header markup (not base.html); keep JS-compatible IDs/classes (`#projectsGrid`, `.chip`).
- Students metric is a stub; adjust `/api/stats` when real data source appears.
- Prefer ASCII; project already uses Cyrillic content in templates/JS—preserve where present but avoid adding new non-ASCII unless needed for translations.
