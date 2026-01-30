from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates


def create_legacy_pages_router(templates_dir: Path) -> APIRouter:
    """
    Старые Jinja-страницы. Чтобы не конфликтовать с / (редирект на фронт),
    уносим их под /legacy.
    """
    templates = Jinja2Templates(directory=str(templates_dir))
    router = APIRouter(prefix="/legacy", tags=["legacy"])

    @router.get("/", response_class=HTMLResponse)
    def page_index(request: Request):
        return templates.TemplateResponse("index.html", {"request": request})

    @router.get("/projects", response_class=HTMLResponse)
    def page_projects(request: Request):
        return templates.TemplateResponse("projects.html", {"request": request})

    @router.get("/technologies", response_class=HTMLResponse)
    def page_technologies(request: Request):
        return templates.TemplateResponse("technologies.html", {"request": request})

    @router.get("/about", response_class=HTMLResponse)
    def page_about(request: Request):
        return templates.TemplateResponse("about.html", {"request": request})

    return router

