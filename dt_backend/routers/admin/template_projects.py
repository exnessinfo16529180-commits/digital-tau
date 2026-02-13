"""
Admin projects management using Jinja2 templates (original design).
Routes: /admin/projects, /admin/projects/new, /admin/projects/{id}/edit, etc.
"""
import secrets
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy import text
from sqlalchemy.engine import Engine

from .template_auth import require_login
from ...utils import parse_tech_input, safe_filename


def create_admin_template_projects_router(
    engine: Engine,
    uploads_dir: Path,
    templates_dir: Path
) -> APIRouter:
    """
    Admin projects router using original Jinja2 templates.
    """
    templates = Jinja2Templates(directory=str(templates_dir))
    router = APIRouter(tags=["admin-template-projects"])

    async def _save_image(upload: UploadFile) -> str:
        """Save uploaded image and return URL path."""
        fname = safe_filename(upload.filename)
        fname = f"{secrets.token_hex(6)}_{fname}"
        dest = uploads_dir / fname
        dest.write_bytes(await upload.read())
        return f"/static/uploads/{fname}"

    def _parse_technologies(tech_str: str) -> list[str]:
        """Parse comma-separated technologies."""
        if not tech_str:
            return []
        return [t.strip() for t in tech_str.split(',') if t.strip()]

    @router.get("/admin/projects", response_class=HTMLResponse)
    def admin_projects_list(request: Request):
        """Show projects list using original template."""
        require_login(request)

        with engine.connect() as conn:
            rows = conn.execute(
                text("""
                    SELECT id, title_ru, title_kz, title_en,
                           category, featured, image, project_url
                    FROM projects
                    ORDER BY id DESC
                """)
            ).mappings().all()

        projects = [dict(r) for r in rows]

        response = templates.TemplateResponse("admin_projects.html", {
            "request": request,
            "projects": projects
        })
        response.charset = "utf-8"
        return response

    @router.get("/admin/projects/new", response_class=HTMLResponse)
    def admin_projects_new_page(request: Request):
        """Show new project form using original template."""
        require_login(request)

        response = templates.TemplateResponse("admin_project_form.html", {
            "request": request,
            "project": None
        })
        response.charset = "utf-8"
        return response

    @router.post("/admin/projects/new")
    async def admin_projects_create(
        request: Request,
        title_ru: str = Form(...),
        title_kz: str = Form(...),
        title_en: str = Form(...),
        description_ru: str = Form(...),
        description_kz: str = Form(...),
        description_en: str = Form(...),
        technologies: str = Form(""),
        category: str = Form("web"),
        project_url: str = Form(""),
        image: Optional[UploadFile] = File(None),
        featured: Optional[str] = Form(None)
    ):
        """Create new project."""
        require_login(request)

        # Parse technologies
        tech_list = _parse_technologies(technologies)

        # Handle image upload
        image_path = ""
        if image and image.filename:
            image_path = await _save_image(image)

        # Insert project
        with engine.begin() as conn:
            conn.execute(
                text("""
                    INSERT INTO projects (
                        title_ru, title_kz, title_en,
                        description_ru, description_kz, description_en,
                        technologies, category, image, project_url, featured
                    ) VALUES (
                        :title_ru, :title_kz, :title_en,
                        :description_ru, :description_kz, :description_en,
                        :technologies, :category, :image, :project_url, :featured
                    )
                """),
                {
                    "title_ru": title_ru,
                    "title_kz": title_kz,
                    "title_en": title_en,
                    "description_ru": description_ru,
                    "description_kz": description_kz,
                    "description_en": description_en,
                    "technologies": tech_list,
                    "category": category,
                    "image": image_path,
                    "project_url": project_url,
                    "featured": bool(featured)
                }
            )

        return RedirectResponse("/admin/projects", status_code=302)

    @router.get("/admin/projects/{project_id}/edit", response_class=HTMLResponse)
    def admin_projects_edit_page(request: Request, project_id: int):
        """Show edit project form using original template."""
        require_login(request)

        with engine.connect() as conn:
            row = conn.execute(
                text("SELECT * FROM projects WHERE id = :id"),
                {"id": project_id}
            ).mappings().first()

        if not row:
            raise HTTPException(status_code=404, detail="Project not found")

        project = dict(row)

        response = templates.TemplateResponse("admin_project_form.html", {
            "request": request,
            "project": project
        })
        response.charset = "utf-8"
        return response

    @router.post("/admin/projects/{project_id}/edit")
    async def admin_projects_update(
        request: Request,
        project_id: int,
        title_ru: str = Form(...),
        title_kz: str = Form(...),
        title_en: str = Form(...),
        description_ru: str = Form(...),
        description_kz: str = Form(...),
        description_en: str = Form(...),
        technologies: str = Form(""),
        category: str = Form("web"),
        project_url: str = Form(""),
        image: Optional[UploadFile] = File(None),
        featured: Optional[str] = Form(None)
    ):
        """Update existing project."""
        require_login(request)

        # Get current project
        with engine.connect() as conn:
            row = conn.execute(
                text("SELECT image FROM projects WHERE id = :id"),
                {"id": project_id}
            ).first()

        if not row:
            raise HTTPException(status_code=404, detail="Project not found")

        # Parse technologies
        tech_list = _parse_technologies(technologies)

        # Handle image upload
        image_path = row[0]  # Keep current image by default
        if image and image.filename:
            image_path = await _save_image(image)

        # Update project
        with engine.begin() as conn:
            conn.execute(
                text("""
                    UPDATE projects SET
                        title_ru = :title_ru,
                        title_kz = :title_kz,
                        title_en = :title_en,
                        description_ru = :description_ru,
                        description_kz = :description_kz,
                        description_en = :description_en,
                        technologies = :technologies,
                        category = :category,
                        image = :image,
                        project_url = :project_url,
                        featured = :featured
                    WHERE id = :id
                """),
                {
                    "id": project_id,
                    "title_ru": title_ru,
                    "title_kz": title_kz,
                    "title_en": title_en,
                    "description_ru": description_ru,
                    "description_kz": description_kz,
                    "description_en": description_en,
                    "technologies": tech_list,
                    "category": category,
                    "image": image_path,
                    "project_url": project_url,
                    "featured": bool(featured)
                }
            )

        return RedirectResponse("/admin/projects", status_code=302)

    @router.post("/admin/projects/{project_id}/delete")
    def admin_projects_delete(request: Request, project_id: int):
        """Delete project."""
        require_login(request)

        with engine.begin() as conn:
            conn.execute(
                text("DELETE FROM projects WHERE id = :id"),
                {"id": project_id}
            )

        return RedirectResponse("/admin/projects", status_code=302)

    return router
