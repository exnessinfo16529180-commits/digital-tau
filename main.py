import os
from typing import Optional

from fastapi import FastAPI, Request, Query
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# ---- Paths (важно для Windows и чтобы static всегда находился) ----
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")

app = FastAPI()

# ---- Static + Templates ----
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
templates = Jinja2Templates(directory=TEMPLATES_DIR)

# ===== Mock Data (позже заменишь на БД) =====
MOCK_PROJECTS = [
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

# ===== Pages =====
@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/projects/{project_id}", response_class=HTMLResponse)
def project_page(project_id: str):
    # позже сделаешь отдельный шаблон страницы проекта
    return HTMLResponse(
        f"""
        <html>
          <head><meta charset="utf-8"><title>Project {project_id}</title></head>
          <body style="margin:0;background:black;color:white;font-family:Arial;">
            <div style="padding:24px;">
              <h1>Project {project_id}</h1>
              <p><a style="color:#F5A623" href="/">← Back</a></p>
            </div>
          </body>
        </html>
        """
    )

# ===== API =====
@app.get("/api/stats")
def stats():
    # потом посчитаешь из БД
    return {"projects": 1880, "students": 500, "technologies": 25}

@app.get("/api/projects")
def projects(category: Optional[str] = Query(default=None)):
    # category: all | aiml | iot | web | mobile | vrar
    if category and category != "all":
        return [p for p in MOCK_PROJECTS if p["category"] == category]
    return MOCK_PROJECTS

# ===== Healthcheck (удобно для проверки, что сервер жив) =====
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/projects", response_class=HTMLResponse)
def projects_page(request: Request):
    return templates.TemplateResponse("projects.html", {"request": request})

@app.get("/technologies", response_class=HTMLResponse)
def technologies_page(request: Request):
    return templates.TemplateResponse("technologies.html", {"request": request})

@app.get("/about", response_class=HTMLResponse)
def about_page(request: Request):
    return templates.TemplateResponse("about.html", {"request": request})
