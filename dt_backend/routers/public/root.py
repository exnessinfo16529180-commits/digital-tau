from fastapi import APIRouter
from fastapi.responses import RedirectResponse

from ...config import Settings


def create_root_router(settings: Settings) -> APIRouter:
    router = APIRouter()

    def to_front(path: str) -> RedirectResponse:
        base = settings.frontend_url.rstrip("/")
        p = (path or "/").strip()
        if not p.startswith("/"):
            p = "/" + p
        return RedirectResponse(f"{base}{p}", status_code=302)

    @router.get("/")
    def root():
        return to_front("/")

    @router.get("/projects")
    def projects():
        return to_front("/projects")

    @router.get("/technologies")
    def technologies():
        return to_front("/technologies")

    @router.get("/about")
    def about():
        return to_front("/")

    return router
