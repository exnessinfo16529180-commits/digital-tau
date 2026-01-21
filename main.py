import os
from typing import Optional, List, Any, Dict

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from fastapi import FastAPI, Request, Query, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# -------------------------
# DB
# -------------------------
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Лучше сразу упасть с понятной ошибкой, чем ловить "NoneType" позже
    raise RuntimeError("DATABASE_URL is not set. Check docker-compose.yml environment for web service.")

engine: Engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# -------------------------
# Paths (Windows-safe)
# -------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")

app = FastAPI()

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
templates = Jinja2Templates(directory=TEMPLATES_DIR)

# -------------------------
# Helpers
# -------------------------
def row_to_project(row: Any) -> Dict[str, Any]:
    """
    Преобразуем строку из БД в формат, который ждёт твой фронт (app.js):
    titleRu/titleKz/titleEn, descriptionRu/..., technologies как list[str]
    """
    tech = row.technologies
    if tech is None:
        tech_list: List[str] = []
    elif isinstance(tech, list):
        tech_list = tech
    else:
        # на всякий случай (если драйвер вернул что-то странное)
        tech_list = list(tech)

    return {
        "id": str(row.id),
        "titleRu": row.title_ru,
        "titleKz": row.title_kz,
        "titleEn": row.title_en,
        "descriptionRu": row.description_ru,
        "descriptionKz": row.description_kz,
        "descriptionEn": row.description_en,
        "technologies": tech_list,
        "image": row.image,
        "category": row.category,
        "featured": bool(row.featured),
    }

# -------------------------
# Pages
# -------------------------
@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/projects", response_class=HTMLResponse)
def projects_page(request: Request):
    return templates.TemplateResponse("projects.html", {"request": request})

@app.get("/technologies", response_class=HTMLResponse)
def technologies_page(request: Request):
    return templates.TemplateResponse("technologies.html", {"request": request})

@app.get("/about", response_class=HTMLResponse)
def about_page(request: Request):
    return templates.TemplateResponse("about.html", {"request": request})

@app.get("/projects/{project_id}", response_class=HTMLResponse)
def project_page(project_id: int):
    # Пока простая страница. Потом сделаем templates/project.html и подтянем данные проекта из БД.
    return HTMLResponse(
        f"""
        <html>
          <head><meta charset="utf-8"><title>Project {project_id}</title></head>
          <body style="margin:0;background:black;color:white;font-family:Arial;">
            <div style="padding:24px;">
              <h1>Project {project_id}</h1>
              <p><a style="color:#F5A623" href="/projects">← Back to Projects</a></p>
            </div>
          </body>
        </html>
        """
    )

# -------------------------
# API
# -------------------------
@app.get("/api/stats")
def stats():
    """
    Считаем статистику из БД.
    projects = кол-во записей в projects
    technologies = кол-во уникальных технологий (по массиву technologies)
    students = пока заглушка (позже появится таблица students)
    """
    try:
        with engine.connect() as conn:
            projects_count = conn.execute(text("SELECT COUNT(*) FROM projects")).scalar_one()

            # Уникальные технологии из массива TEXT[]
            tech_count = conn.execute(
                text("""
                    SELECT COUNT(DISTINCT t) AS cnt
                    FROM projects
                    CROSS JOIN LATERAL unnest(technologies) AS t
                """)
            ).scalar_one()

        return {
            "projects": int(projects_count),
            "students": 500,          # пока заглушка
            "technologies": int(tech_count),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"stats db error: {e}")

@app.get("/api/projects")
def projects(category: Optional[str] = Query(default=None)):
    """
    Возвращает проекты из Postgres.
    category: all | aiml | iot | web | mobile | vrar
    """
    try:
        sql = """
            SELECT
                id,
                title_ru, title_kz, title_en,
                description_ru, description_kz, description_en,
                technologies,
                image,
                category,
                featured
            FROM projects
        """
        params = {}

        if category and category != "all":
            sql += " WHERE category = :category"
            params["category"] = category

        sql += " ORDER BY featured DESC, id ASC"

        with engine.connect() as conn:
            res = conn.execute(text(sql), params)
            rows = res.mappings().all()  # словари-строки

        return [row_to_project(r) for r in rows]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"projects db error: {e}")

# -------------------------
# Healthcheck
# -------------------------
@app.get("/health")
def health():
    return {"status": "ok"}
