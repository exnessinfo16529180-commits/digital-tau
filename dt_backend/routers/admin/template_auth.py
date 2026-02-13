"""
Admin authentication using Jinja2 templates (original design).
Routes: /admin/login, /admin/logout
"""
from pathlib import Path

from fastapi import APIRouter, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates

from ...config import Settings


def is_logged_in(request: Request) -> bool:
    return request.session.get("admin_logged_in") is True


def require_login(request: Request):
    if not is_logged_in(request):
        raise HTTPException(status_code=401, detail="Not authorized")


def create_admin_template_auth_router(settings: Settings, templates_dir: Path) -> APIRouter:
    """
    Admin authentication router using original Jinja2 templates.
    """
    templates = Jinja2Templates(directory=str(templates_dir))
    router = APIRouter(tags=["admin-template-auth"])

    @router.get("/admin", response_class=HTMLResponse)
    def admin_root(request: Request):
        """Redirect to admin dashboard or login."""
        if is_logged_in(request):
            return RedirectResponse("/admin/projects", status_code=302)
        return RedirectResponse("/admin/login", status_code=302)

    @router.get("/admin/login", response_class=HTMLResponse)
    def admin_login_page(request: Request):
        """Show login page using original template."""
        return templates.TemplateResponse("admin_login.html", {
            "request": request,
            "error": None
        })

    @router.post("/admin/login")
    async def admin_login(
        request: Request,
        username: str = Form(...),
        password: str = Form(...)
    ):
        """Process login using original template."""
        if username == settings.admin_user and password == settings.admin_pass:
            request.session["admin_logged_in"] = True
            return RedirectResponse("/admin/projects", status_code=302)

        # Show login page with error
        return templates.TemplateResponse("admin_login.html", {
            "request": request,
            "error": "Неверный логин или пароль"
        }, status_code=401)

    @router.post("/admin/logout")
    def admin_logout(request: Request):
        """Logout and redirect to home."""
        request.session.clear()
        return RedirectResponse("/", status_code=302)

    return router
