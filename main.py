import os
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, Request, Query, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from sqlalchemy import create_engine, text


# ---- Paths (важно для Windows и чтобы static всегда находился) ----
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")

app = FastAPI()

# ---- Static + Templates ----
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
templates = Jinja2Templates(directory=TEMPLATES_DIR)


# ===== Mock Data (используется, если БД не подключена) =====
MOCK_PROJECTS: List[Dict[str, Any]] = [
    {
        "id": "1",
        "titleRu": "AI Анализатор",
        "titleKz": "AI Талдаушы",
        "titleEn": "AI Analyzer",
        "descriptionRu": "Система машинного обучения для анализа данных",
        "descriptionKz": "Деректерді талдауға арналған машиналық оқыту жүйесі",
        "descriptionEn": "Machine learning system for data analysis",
        "technologies": ["Python", "TensorFlow", "React"],
        "image": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900",
        "category": "aiml",
        "featured": True,
    },
    {
        "id": "2",
        "titleRu": "IoT Мониторинг",
        "titleKz": "IoT Бақылау",
        "titleEn": "IoT Monitoring",
        "descriptionRu": "Платформа для мониторинга IoT устройств",
        "descriptionKz": "IoT құрылғыларын бақылау платформасы",
        "descriptionEn": "Platform for monitoring IoT devices",
        "technologies": ["Node.js", "MongoDB", "MQTT"],
        "image": "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=900",
        "category": "iot",
        "featured": True,
    },
    {
        "id": "3",
        "titleRu": "Веб-портал",
        "titleKz": "Веб-портал",
        "titleEn": "Web Portal",
        "descriptionRu": "Современный веб-портал университета",
        "descriptionKz": "Университеттің заманауи веб-порталы",
        "descriptionEn": "Modern university web portal",
        "technologies": ["Next.js", "TypeScript", "Tailwind"],
        "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900",
        "category": "web",
        "featured": False,
    },
]


# ===== DB: подключаемся только если есть DATABASE_URL =====
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, pool_pre_ping=True) if DATABASE_URL else None


def db_enabled() -> bool:
    return engine is not None


def init_db() -> None:
    """Создаем таблицу projects, если подключена БД."""
    if not db_enabled():
        return

    with engine.begin() as conn:
        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS projects (
                    id SERIAL PRIMARY KEY,
                    title_ru TEXT NOT NULL,
                    title_kz TEXT NOT NULL,
                    title_en TEXT NOT NULL,
                    description_ru TEXT NOT NULL,
                    description_kz TEXT NOT NULL,
                    description_en TEXT NOT NULL,
                    technologies TEXT NOT NULL,
                    image TEXT NOT NULL,
                    category TEXT NOT NULL,
                    featured BOOLEAN NOT NULL DEFAULT FALSE
                );
                """
            )
        )


def db_row_to_front(r: Dict[str, Any]) -> Dict[str, Any]:
    """Приводим строку из БД к формату, который ожидает твой фронт."""
    item = dict(r)
    item["id"] = str(item["id"])
    item["technologies"] = [x.strip() for x in item["technologies"].split(",") if x.strip()]

    item["titleRu"] = item.pop("title_ru")
    item["titleKz"] = item.pop("title_kz")
    item["titleEn"] = item.pop("title_en")
    item["descriptionRu"] = item.pop("description_ru")
    item["descriptionKz"] = item.pop("description_kz")
    item["descriptionEn"] = item.pop("description_en")
    return item


@app.on_event("startup")
def startup():
    init_db()


# ===== Pages =====
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
def project_page(project_id: str):
    # Потом сделаешь нормальный шаблон project.html + данные из БД
    return HTMLResponse(
        f"""
        <html>
          <head><meta charset="utf-8"><title>Project {project_id}</title></head>
          <body style="margin:0;background:black;color:white;font-family:Arial;">
            <div style="padding:24px;">
              <h1>Project {project_id}</h1>
              <p><a style="color:#F5A623" href="/projects">← Back to Projects</a></p>
              <p><a style="color:#F5A623" href="/">← Back to Home</a></p>
            </div>
          </body>
        </html>
        """
    )


# ===== API =====
@app.get("/api/stats")
def stats():
    # Можно позже считать из БД
    return {"projects": 1880, "students": 500, "technologies": 25}


@app.get("/api/projects")
def projects(category: Optional[str] = Query(default=None)):
    """
    Возвращает проекты:
    - если есть DATABASE_URL → берём из PostgreSQL
    - если БД нет → берём из MOCK_PROJECTS
    """
    if not db_enabled():
        if category and category != "all":
            return [p for p in MOCK_PROJECTS if p["category"] == category]
        return MOCK_PROJECTS

    # --- DB mode ---
    q = "SELECT * FROM projects"
    params = {}

    if category and category != "all":
        q += " WHERE category = :category"
        params["category"] = category

    q += " ORDER BY id DESC"

    with engine.connect() as conn:
        rows = conn.execute(text(q), params).mappings().all()

    return [db_row_to_front(dict(r)) for r in rows]


@app.post("/api/seed")
def seed():
    """
    Заполняет БД тестовыми данными (один раз).
    Если БД не подключена — вернёт ошибку.
    """
    if not db_enabled():
        raise HTTPException(status_code=400, detail="DATABASE_URL not set. DB is not enabled.")

    with engine.begin() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM projects")).scalar_one()
        if count > 0:
            return {"status": "already_seeded", "count": count}

        conn.execute(
            text(
                """
                INSERT INTO projects
                (title_ru,title_kz,title_en,description_ru,description_kz,description_en,technologies,image,category,featured)
                VALUES
                (:tr,:tk,:te,:dr,:dk,:de,:tech,:img,:cat,:feat)
                """
            ),
            [
                {
                    "tr": "AI Анализатор",
                    "tk": "AI Талдаушы",
                    "te": "AI Analyzer",
                    "dr": "Система машинного обучения для анализа данных",
                    "dk": "Деректерді талдауға арналған машиналық оқыту жүйесі",
                    "de": "Machine learning system for data analysis",
                    "tech": "Python,TensorFlow,React",
                    "img": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900",
                    "cat": "aiml",
                    "feat": True,
                },
                {
                    "tr": "IoT Мониторинг",
                    "tk": "IoT Бақылау",
                    "te": "IoT Monitoring",
                    "dr": "Платформа для мониторинга IoT устройств",
                    "dk": "IoT құрылғыларын бақылау платформасы",
                    "de": "Platform for monitoring IoT devices",
                    "tech": "Node.js,MongoDB,MQTT",
                    "img": "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=900",
                    "cat": "iot",
                    "feat": True,
                },
                {
                    "tr": "Веб-портал",
                    "tk": "Веб-портал",
                    "te": "Web Portal",
                    "dr": "Современный веб-портал университета",
                    "dk": "Университеттің заманауи веб-порталы",
                    "de": "Modern university web portal",
                    "tech": "Next.js,TypeScript,Tailwind",
                    "img": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900",
                    "cat": "web",
                    "feat": False,
                },
            ],
        )

    return {"status": "seeded"}


# ===== Healthcheck =====
@app.get("/health")
def health():
    return {"status": "ok", "db": "enabled" if db_enabled() else "disabled"}
