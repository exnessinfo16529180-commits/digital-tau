import secrets
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from fastapi import Form
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy import text
from sqlalchemy.engine import Engine

from .auth import require_login
from .html import admin_layout, project_form_html
from ...utils import escape_html, parse_tech_input, safe_filename, sanitize_rich_text_html


def create_admin_projects_router(engine: Engine, uploads_dir: Path) -> APIRouter:
    router = APIRouter(tags=["admin-projects"])

    def _truthy(value: Optional[str]) -> bool:
        if value is None:
            return False
        v = str(value).strip().lower()
        return v in ("1", "true", "on", "yes")

    def _load_lists() -> tuple[list[str], list[str], list[str]]:
        with engine.connect() as conn:
            categories = conn.execute(text("SELECT name FROM categories ORDER BY name ASC")).scalars().all()
            technologies = conn.execute(text("SELECT name FROM technologies ORDER BY name ASC")).scalars().all()
            genres = conn.execute(text("SELECT name FROM genres ORDER BY name ASC")).scalars().all()
        return list(categories or []), list(technologies or []), list(genres or [])

    @router.get("/api/admin/projects", response_class=HTMLResponse)
    def admin_projects(request: Request):
        require_login(request)

        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT id, title_ru, title_en, category, featured, project_url, image
                    FROM projects
                    ORDER BY id DESC
                    """
                )
            ).mappings().all()

        items = []
        for r in rows:
            items.append(
                f"""
                <tr>
                  <td style="padding:10px;border-bottom:1px solid #222;">{r["id"]}</td>
                  <td style="padding:10px;border-bottom:1px solid #222;">{escape_html(r.get("title_ru",""))}</td>
                  <td style="padding:10px;border-bottom:1px solid #222;">{escape_html(r.get("title_en",""))}</td>
                  <td style="padding:10px;border-bottom:1px solid #222;">{escape_html(r.get("category",""))}</td>
                  <td style="padding:10px;border-bottom:1px solid #222;">{"✅" if r.get("featured") else "—"}</td>
                  <td style="padding:10px;border-bottom:1px solid #222;">
                    <a style="color:#F5A623" href="/api/admin/projects/{r["id"]}/edit">Edit</a>
                    &nbsp;|&nbsp;
                    <form style="display:inline" method="post" action="/api/admin/projects/{r["id"]}/delete"
                          onsubmit="return confirm('Delete project #{r["id"]}?');">
                      <button style="background:transparent;border:0;color:#ff5b5b;cursor:pointer;">Delete</button>
                    </form>
                  </td>
                </tr>
                """
            )

        body = f"""
            <div style="margin-bottom:14px;">
              <a href="/api/admin/projects/new" style="display:inline-block;padding:10px 12px;border-radius:10px;background:#F5A623;color:#000;font-weight:800;text-decoration:none;">+ Add project</a>
            </div>

            <table style="width:100%;border-collapse:collapse;background:#0b0b0b;border:1px solid #222;border-radius:14px;overflow:hidden;">
              <thead>
                <tr>
                  <th style="text-align:left;padding:10px;border-bottom:1px solid #222;">ID</th>
                  <th style="text-align:left;padding:10px;border-bottom:1px solid #222;">Title RU</th>
                  <th style="text-align:left;padding:10px;border-bottom:1px solid #222;">Title EN</th>
                  <th style="text-align:left;padding:10px;border-bottom:1px solid #222;">Category</th>
                  <th style="text-align:left;padding:10px;border-bottom:1px solid #222;">Featured</th>
                  <th style="text-align:left;padding:10px;border-bottom:1px solid #222;">Actions</th>
                </tr>
              </thead>
              <tbody>
                {''.join(items) if items else '<tr><td colspan="6" style="padding:12px;opacity:.7;">No projects</td></tr>'}
              </tbody>
            </table>
        """
        return HTMLResponse(admin_layout("Admin • Projects", body))

    @router.get("/api/admin/projects/new", response_class=HTMLResponse)
    def admin_projects_new(request: Request):
        require_login(request)
        categories, technologies, genres = _load_lists()
        return HTMLResponse(
            admin_layout(
                "Admin • New project",
                project_form_html(
                    action="/api/admin/projects/new",
                    categories=categories,
                    technologies=technologies,
                    genres=genres,
                    values={"technologies_selected": [], "genres_selected": []},
                ),
            )
        )

    @router.post("/api/admin/projects/new")
    async def admin_projects_create(
        request: Request,
        title_ru: str = Form(...),
        title_kz: str = Form(...),
        title_en: str = Form(...),
        description_ru: str = Form(...),
        description_kz: str = Form(...),
        description_en: str = Form(...),
        technologies: list[str] = Form([]),
        genres: list[str] = Form([]),
        category: str = Form("web"),
        featured: Optional[str] = Form(None),
        project_url: str = Form(""),
        image_file: Optional[UploadFile] = File(None),
    ):
        require_login(request)

        featured_bool = _truthy(featured)
        description_ru = sanitize_rich_text_html(description_ru)
        description_kz = sanitize_rich_text_html(description_kz)
        description_en = sanitize_rich_text_html(description_en)

        image_path = ""
        if image_file and image_file.filename:
            fname = safe_filename(image_file.filename)
            fname = f"{secrets.token_hex(6)}_{fname}"
            dest = uploads_dir / fname
            dest.write_bytes(await image_file.read())
            image_path = f"/static/uploads/{fname}"

        tech_list = parse_tech_input(technologies)
        genres_list = parse_tech_input(genres)

        with engine.begin() as conn:
            conn.execute(
                text(
                    """
                    INSERT INTO projects (
                        title_ru, title_kz, title_en,
                        description_ru, description_kz, description_en,
                        technologies, genres, image, category, featured, project_url
                    ) VALUES (
                        :title_ru, :title_kz, :title_en,
                        :description_ru, :description_kz, :description_en,
                        :technologies, :genres, :image, :category, :featured, :project_url
                    )
                    """
                ),
                {
                    "title_ru": title_ru,
                    "title_kz": title_kz,
                    "title_en": title_en,
                    "description_ru": description_ru,
                    "description_kz": description_kz,
                    "description_en": description_en,
                    "technologies": tech_list,
                    "genres": genres_list,
                    "image": image_path,
                    "category": category,
                    "featured": featured_bool,
                    "project_url": project_url.strip(),
                },
            )

        return RedirectResponse("/api/admin/projects", status_code=302)

    @router.get("/api/admin/projects/{project_id}/edit", response_class=HTMLResponse)
    def admin_projects_edit(project_id: int, request: Request):
        require_login(request)

        with engine.connect() as conn:
            row = conn.execute(
                text(
                    """
                    SELECT
                        id,
                        title_ru, title_kz, title_en,
                        description_ru, description_kz, description_en,
                        technologies, genres, image, category, featured, project_url
                    FROM projects
                    WHERE id = :id
                    """
                ),
                {"id": project_id},
            ).mappings().first()

        if not row:
            raise HTTPException(status_code=404, detail="Project not found")

        tech_selected = parse_tech_input(row.get("technologies"))
        genres_selected = parse_tech_input(row.get("genres"))
        categories, technologies, genres = _load_lists()

        html = project_form_html(
            action=f"/api/admin/projects/{project_id}/edit",
            categories=categories,
            technologies=technologies,
            genres=genres,
            values={
                "title_ru": row.get("title_ru", ""),
                "title_kz": row.get("title_kz", ""),
                "title_en": row.get("title_en", ""),
                "description_ru": row.get("description_ru", ""),
                "description_kz": row.get("description_kz", ""),
                "description_en": row.get("description_en", ""),
                "technologies_selected": tech_selected,
                "genres_selected": genres_selected,
                "category": row.get("category", "web"),
                "featured": bool(row.get("featured")),
                "project_url": row.get("project_url", "") or "",
                "image": row.get("image", "") or "",
            },
            show_current_image=True,
        )
        return HTMLResponse(admin_layout(f"Admin • Edit project #{project_id}", html))

    @router.post("/api/admin/projects/{project_id}/edit")
    async def admin_projects_update(
        project_id: int,
        request: Request,
        title_ru: str = Form(...),
        title_kz: str = Form(...),
        title_en: str = Form(...),
        description_ru: str = Form(...),
        description_kz: str = Form(...),
        description_en: str = Form(...),
        technologies: list[str] = Form([]),
        genres: list[str] = Form([]),
        category: str = Form("web"),
        featured: Optional[str] = Form(None),
        project_url: str = Form(""),
        image_file: Optional[UploadFile] = File(None),
    ):
        require_login(request)

        featured_bool = _truthy(featured)
        description_ru = sanitize_rich_text_html(description_ru)
        description_kz = sanitize_rich_text_html(description_kz)
        description_en = sanitize_rich_text_html(description_en)

        with engine.connect() as conn:
            old_img = conn.execute(text("SELECT image FROM projects WHERE id=:id"), {"id": project_id}).scalar()

        image_path = old_img or ""
        if image_file and image_file.filename:
            fname = safe_filename(image_file.filename)
            fname = f"{secrets.token_hex(6)}_{fname}"
            dest = uploads_dir / fname
            dest.write_bytes(await image_file.read())
            image_path = f"/static/uploads/{fname}"

        tech_list = parse_tech_input(technologies)
        genres_list = parse_tech_input(genres)

        with engine.begin() as conn:
            res = conn.execute(
                text(
                    """
                    UPDATE projects
                    SET
                        title_ru=:title_ru,
                        title_kz=:title_kz,
                        title_en=:title_en,
                        description_ru=:description_ru,
                        description_kz=:description_kz,
                        description_en=:description_en,
                        technologies=:technologies,
                        genres=:genres,
                        image=:image,
                        category=:category,
                        featured=:featured,
                        project_url=:project_url
                    WHERE id=:id
                    """
                ),
                {
                    "id": project_id,
                    "title_ru": title_ru,
                    "title_kz": title_kz,
                    "title_en": title_en,
                    "description_ru": description_ru,
                    "description_kz": description_kz,
                    "description_en": description_en,
                    "technologies": tech_list,
                    "genres": genres_list,
                    "image": image_path,
                    "category": category,
                    "featured": featured_bool,
                    "project_url": project_url.strip(),
                },
            )
            if res.rowcount == 0:
                raise HTTPException(status_code=404, detail="Project not found")

        return RedirectResponse("/api/admin/projects", status_code=302)

    @router.post("/api/admin/projects/{project_id}/delete")
    def admin_projects_delete(project_id: int, request: Request):
        require_login(request)

        with engine.begin() as conn:
            img = conn.execute(text("SELECT image FROM projects WHERE id=:id"), {"id": project_id}).scalar()
            conn.execute(text("DELETE FROM projects WHERE id=:id"), {"id": project_id})

        try:
            if img and str(img).startswith("/static/uploads/"):
                fname = str(img).split("/static/uploads/")[-1]
                fpath = uploads_dir / fname
                if fpath.exists():
                    fpath.unlink()
        except Exception:
            pass

        return RedirectResponse("/api/admin/projects", status_code=302)

    return router
