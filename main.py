import os
import re
import secrets
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse


from fastapi import (
    FastAPI,
    Request,
    Query,
    HTTPException,
    UploadFile,
    File,
    Form,
)
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine


# ============================================================
# CONFIG
# ============================================================

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. Check docker-compose.yml (web -> environment).")

ADMIN_USER = os.getenv("ADMIN_USER", "admin")
ADMIN_PASS = os.getenv("ADMIN_PASS", "admin")
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))

engine: Engine = create_engine(DATABASE_URL, pool_pre_ping=True)

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"
UPLOADS_DIR = STATIC_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))


# ============================================================
# HELPERS
# ============================================================

def escape_html(s: Any) -> str:
    return (
        str(s if s is not None else "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#039;")
    )

def is_logged_in(request: Request) -> bool:
    return request.session.get("admin_logged_in") is True

def require_login(request: Request):
    if not is_logged_in(request):
        raise HTTPException(status_code=401, detail="Not authorized")

def safe_filename(name: str) -> str:
    name = (name or "").strip()
    name = re.sub(r"[^a-zA-Z0-9._-]+", "_", name)
    name = name.strip("._")
    return name or "file"

def parse_tech_input(s: str) -> List[str]:
    """
    Accept:
      - "Python, React, FastAPI"
      - "{Python,React}" (postgres style)
    Return list[str]
    """
    if not s:
        return []
    s = s.strip()
    if s.startswith("{") and s.endswith("}"):
        s = s[1:-1]
    parts = [p.strip() for p in s.split(",")]
    return [p for p in parts if p]

def row_to_project(row: Dict[str, Any]) -> Dict[str, Any]:
    tech = row.get("technologies")
    if tech is None:
        tech_list: List[str] = []
    elif isinstance(tech, list):
        tech_list = [str(x) for x in tech]
    elif isinstance(tech, str):
        tech_list = parse_tech_input(tech)
    else:
        tech_list = []

    return {
        "id": str(row.get("id")),
        "titleRu": row.get("title_ru"),
        "titleKz": row.get("title_kz"),
        "titleEn": row.get("title_en"),
        "descriptionRu": row.get("description_ru"),
        "descriptionKz": row.get("description_kz"),
        "descriptionEn": row.get("description_en"),
        "technologies": tech_list,
        "image": row.get("image"),
        "category": row.get("category"),
        "featured": bool(row.get("featured")),
        "projectUrl": row.get("project_url"),  # IMPORTANT for app.js
    }


# ============================================================
# PAGES (PUBLIC)
# ============================================================

@app.get("/", response_class=HTMLResponse)
def page_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/projects", response_class=HTMLResponse)
def page_projects(request: Request):
    return templates.TemplateResponse("projects.html", {"request": request})

@app.get("/technologies", response_class=HTMLResponse)
def page_technologies(request: Request):
    return templates.TemplateResponse("technologies.html", {"request": request})

@app.get("/about", response_class=HTMLResponse)
def page_about(request: Request):
    return templates.TemplateResponse("about.html", {"request": request})


# ============================================================
# API (PUBLIC)
# ============================================================

@app.get("/api/stats")
def api_stats():
    try:
        with engine.connect() as conn:
            projects_count = conn.execute(text("SELECT COUNT(*) FROM projects")).scalar_one()

            tech_count = conn.execute(
                text("""
                    SELECT COALESCE(COUNT(DISTINCT t), 0) AS cnt
                    FROM projects
                    LEFT JOIN LATERAL unnest(technologies) AS t ON TRUE
                """)
            ).scalar_one()

        return {
            "projects": int(projects_count),
            "students": 500,  # stub
            "technologies": int(tech_count),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"stats db error: {e}")

@app.get("/api/projects")
def api_projects(category: Optional[str] = Query(default=None)):
    try:
        sql = """
            SELECT
                id,
                title_ru, title_kz, title_en,
                description_ru, description_kz, description_en,
                technologies,
                image,
                category,
                featured,
                project_url
            FROM projects
        """
        params: Dict[str, Any] = {}

        if category and category != "all":
            sql += " WHERE category = :category"
            params["category"] = category

        sql += " ORDER BY featured DESC, id ASC"

        with engine.connect() as conn:
            rows = conn.execute(text(sql), params).mappings().all()

        return [row_to_project(dict(r)) for r in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"projects db error: {e}")

@app.get("/health")
def health():
    return {"status": "ok"}


# ============================================================
# ADMIN AUTH
# ============================================================

@app.get("/admin", response_class=HTMLResponse)
def admin_root(request: Request):
    return RedirectResponse("/admin/projects" if is_logged_in(request) else "/admin/login", status_code=302)

@app.get("/admin/login", response_class=HTMLResponse)
def admin_login_page(request: Request):
    html = """
    <html><head><meta charset="utf-8"><title>Admin login</title></head>
    <body style="margin:0;background:#000;color:#fff;font-family:Arial;">
      <div style="max-width:520px;margin:40px auto;padding:24px;border:1px solid rgba(255,255,255,.15);border-radius:14px;">
        <h2 style="margin:0 0 14px;">Admin login</h2>
        <form method="post" action="/admin/login">
          <div style="margin:10px 0;">
            <label>Login</label><br>
            <input name="username" style="width:100%;padding:10px;border-radius:10px;border:1px solid #444;background:#111;color:#fff;">
          </div>
          <div style="margin:10px 0;">
            <label>Password</label><br>
            <input type="password" name="password" style="width:100%;padding:10px;border-radius:10px;border:1px solid #444;background:#111;color:#fff;">
          </div>
          <button style="padding:10px 14px;border-radius:10px;border:0;background:#F5A623;font-weight:800;cursor:pointer;">Sign in</button>
        </form>
        <p style="opacity:.7;margin-top:14px;">Default: admin / admin (если не менял ADMIN_USER / ADMIN_PASS)</p>
      </div>
    </body></html>
    """
    return HTMLResponse(html)

@app.post("/admin/login")
async def admin_login(request: Request, username: str = Form(...), password: str = Form(...)):
    if username == ADMIN_USER and password == ADMIN_PASS:
        request.session["admin_logged_in"] = True
        return RedirectResponse("/admin/projects", status_code=302)

    return HTMLResponse(
        """
        <html><head><meta charset="utf-8"><title>Login failed</title></head>
        <body style="margin:0;background:#000;color:#fff;font-family:Arial;">
          <div style="max-width:520px;margin:40px auto;padding:24px;border:1px solid rgba(255,255,255,.15);border-radius:14px;">
            <h2>Login failed</h2>
            <p style="opacity:.8;">Wrong login or password.</p>
            <p><a style="color:#F5A623" href="/admin/login">Try again</a></p>
          </div>
        </body></html>
        """,
        status_code=401,
    )

@app.get("/admin/logout")
def admin_logout(request: Request):
    request.session.clear()
    return RedirectResponse("/", status_code=302)


# ============================================================
# ADMIN CRUD (PROJECTS)
# ============================================================

def admin_layout(title: str, body: str) -> str:
    return f"""
    <html>
      <head><meta charset="utf-8"><title>{escape_html(title)}</title></head>
      <body style="margin:0;background:#000;color:#fff;font-family:Arial;">
        <div style="max-width:1100px;margin:24px auto;padding:0 18px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:16px;">
            <h2 style="margin:0;">{escape_html(title)}</h2>
            <div style="display:flex;gap:10px;">
              <a href="/admin/projects" style="color:#F5A623;text-decoration:none;">Projects</a>
              <a href="/admin/logout" style="color:#F5A623;text-decoration:none;">Logout</a>
            </div>
          </div>
          {body}
        </div>
      </body>
    </html>
    """

def project_form_html(action: str, values: Optional[Dict[str, Any]] = None, show_current_image: bool = False) -> str:
    v = values or {}

    def val(k: str) -> str:
        return escape_html(v.get(k, "") if v.get(k, "") is not None else "")

    featured_checked = "checked" if v.get("featured") else ""
    current_img = v.get("image") or ""

    img_block = ""
    if show_current_image:
        img_block = f"""
          <div style="margin:10px 0;opacity:.9;">
            <div style="margin-bottom:6px;">Current image:</div>
            <div style="display:flex;gap:12px;align-items:center;">
              <div style="width:200px;height:120px;border:1px solid #222;border-radius:12px;overflow:hidden;background:#111;">
                {'<img src="'+escape_html(current_img)+'" style="width:100%;height:100%;object-fit:cover;">' if current_img else '<div style="padding:12px;opacity:.7;">No image</div>'}
              </div>
              <div style="opacity:.8;">Uploading a new file will replace the image.</div>
            </div>
          </div>
        """

    return f"""
    <form method="post" action="{escape_html(action)}" enctype="multipart/form-data"
          style="background:#0b0b0b;border:1px solid #222;border-radius:14px;padding:18px;">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
        <div>
          <label>Title RU</label><br>
          <input name="title_ru" value="{val("title_ru")}" required
                 style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">
        </div>
        <div>
          <label>Title KZ</label><br>
          <input name="title_kz" value="{val("title_kz")}" required
                 style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">
        </div>
        <div>
          <label>Title EN</label><br>
          <input name="title_en" value="{val("title_en")}" required
                 style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:12px;">
        <div>
          <label>Description RU</label><br>
          <textarea name="description_ru" required rows="3"
            style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">{val("description_ru")}</textarea>
        </div>
        <div>
          <label>Description KZ</label><br>
          <textarea name="description_kz" required rows="3"
            style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">{val("description_kz")}</textarea>
        </div>
        <div>
          <label>Description EN</label><br>
          <textarea name="description_en" required rows="3"
            style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">{val("description_en")}</textarea>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
        <div>
          <label>Technologies (comma separated)</label><br>
          <input name="technologies" value="{val("technologies")}"
                 placeholder="Python, FastAPI, PostgreSQL"
                 style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">
        </div>
        <div>
          <label>Project URL (button will open this)</label><br>
          <input name="project_url" value="{val("project_url")}"
                 placeholder="https://github.com/... or https://site..."
                 style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:12px;align-items:center;">
        <div>
          <label>Category</label><br>
          <select name="category"
                  style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">
            <option value="aiml" {"selected" if v.get("category")=="aiml" else ""}>aiml</option>
            <option value="iot" {"selected" if v.get("category")=="iot" else ""}>iot</option>
            <option value="web" {"selected" if v.get("category")=="web" else ""}>web</option>
            <option value="mobile" {"selected" if v.get("category")=="mobile" else ""}>mobile</option>
            <option value="vrar" {"selected" if v.get("category")=="vrar" else ""}>vrar</option>
          </select>
        </div>

        <div>
          <label>Image file</label><br>
          <input type="file" name="image_file" accept="image/*"
                 style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">
        </div>

        <div style="display:flex;gap:10px;align-items:center;margin-top:20px;">
          <input type="checkbox" id="featured" name="featured" value="1" {featured_checked}>
          <label for="featured">Featured</label>
        </div>
      </div>

      {img_block}

      <div style="margin-top:14px;display:flex;gap:10px;">
        <button style="padding:10px 14px;border-radius:10px;border:0;background:#F5A623;color:#000;font-weight:900;cursor:pointer;">
          Save
        </button>
        <a href="/admin/projects" style="padding:10px 14px;border-radius:10px;border:1px solid #333;color:#fff;text-decoration:none;">
          Cancel
        </a>
      </div>
    </form>
    """


@app.get("/admin/projects", response_class=HTMLResponse)
def admin_projects(request: Request):
    require_login(request)

    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT id, title_ru, title_en, category, featured, project_url, image
            FROM projects
            ORDER BY id DESC
        """)).mappings().all()

    items = []
    for r in rows:
        items.append(f"""
          <tr>
            <td style="padding:10px;border-bottom:1px solid #222;">{r["id"]}</td>
            <td style="padding:10px;border-bottom:1px solid #222;">{escape_html(r.get("title_ru",""))}</td>
            <td style="padding:10px;border-bottom:1px solid #222;">{escape_html(r.get("title_en",""))}</td>
            <td style="padding:10px;border-bottom:1px solid #222;">{escape_html(r.get("category",""))}</td>
            <td style="padding:10px;border-bottom:1px solid #222;">{"✅" if r.get("featured") else "—"}</td>
            <td style="padding:10px;border-bottom:1px solid #222;">
              <a style="color:#F5A623" href="/admin/projects/{r["id"]}/edit">Edit</a>
              &nbsp;|&nbsp;
              <form style="display:inline" method="post" action="/admin/projects/{r["id"]}/delete"
                    onsubmit="return confirm('Delete project #{r["id"]}?');">
                <button style="background:transparent;border:0;color:#ff5b5b;cursor:pointer;">Delete</button>
              </form>
            </td>
          </tr>
        """)

    body = f"""
      <div style="margin-bottom:14px;">
        <a href="/admin/projects/new" style="display:inline-block;padding:10px 12px;border-radius:10px;background:#F5A623;color:#000;font-weight:800;text-decoration:none;">+ Add project</a>
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


@app.get("/admin/projects/new", response_class=HTMLResponse)
def admin_projects_new(request: Request):
    require_login(request)
    return HTMLResponse(admin_layout("Admin • New project", project_form_html(action="/admin/projects/new")))


@app.post("/admin/projects/new")
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
    featured: Optional[str] = Form(None),
    project_url: str = Form(""),
    image_file: Optional[UploadFile] = File(None),
):
    require_login(request)

    featured_bool = bool(featured)

    image_path = ""
    if image_file and image_file.filename:
        fname = safe_filename(image_file.filename)
        fname = f"{secrets.token_hex(6)}_{fname}"
        dest = UPLOADS_DIR / fname
        dest.write_bytes(await image_file.read())
        image_path = f"/static/uploads/{fname}"

    tech_list = parse_tech_input(technologies)

    with engine.begin() as conn:
        conn.execute(
            text("""
                INSERT INTO projects (
                    title_ru, title_kz, title_en,
                    description_ru, description_kz, description_en,
                    technologies, image, category, featured, project_url
                ) VALUES (
                    :title_ru, :title_kz, :title_en,
                    :description_ru, :description_kz, :description_en,
                    :technologies, :image, :category, :featured, :project_url
                )
            """),
            {
                "title_ru": title_ru,
                "title_kz": title_kz,
                "title_en": title_en,
                "description_ru": description_ru,
                "description_kz": description_kz,
                "description_en": description_en,
                "technologies": tech_list,   # ✅ list[str] (important)
                "image": image_path,
                "category": category,
                "featured": featured_bool,
                "project_url": project_url.strip(),
            },
        )

    return RedirectResponse("/admin/projects", status_code=302)


@app.get("/admin/projects/{project_id}/edit", response_class=HTMLResponse)
def admin_projects_edit(project_id: int, request: Request):
    require_login(request)

    with engine.connect() as conn:
        row = conn.execute(
            text("""
                SELECT
                    id,
                    title_ru, title_kz, title_en,
                    description_ru, description_kz, description_en,
                    technologies, image, category, featured, project_url
                FROM projects
                WHERE id = :id
            """),
            {"id": project_id},
        ).mappings().first()

    if not row:
        raise HTTPException(status_code=404, detail="Project not found")

    tech = row.get("technologies") or []
    tech_str = ", ".join([str(x) for x in tech]) if isinstance(tech, list) else str(tech)

    html = project_form_html(
        action=f"/admin/projects/{project_id}/edit",
        values={
            "title_ru": row.get("title_ru", ""),
            "title_kz": row.get("title_kz", ""),
            "title_en": row.get("title_en", ""),
            "description_ru": row.get("description_ru", ""),
            "description_kz": row.get("description_kz", ""),
            "description_en": row.get("description_en", ""),
            "technologies": tech_str,
            "category": row.get("category", "web"),
            "featured": bool(row.get("featured")),
            "project_url": row.get("project_url", "") or "",
            "image": row.get("image", "") or "",
        },
        show_current_image=True,
    )
    return HTMLResponse(admin_layout(f"Admin • Edit project #{project_id}", html))


@app.post("/admin/projects/{project_id}/edit")
async def admin_projects_update(
    project_id: int,
    request: Request,
    title_ru: str = Form(...),
    title_kz: str = Form(...),
    title_en: str = Form(...),
    description_ru: str = Form(...),
    description_kz: str = Form(...),
    description_en: str = Form(...),
    technologies: str = Form(""),
    category: str = Form("web"),
    featured: Optional[str] = Form(None),
    project_url: str = Form(""),
    image_file: Optional[UploadFile] = File(None),
):
    require_login(request)

    featured_bool = bool(featured)

    with engine.connect() as conn:
        old_img = conn.execute(text("SELECT image FROM projects WHERE id=:id"), {"id": project_id}).scalar()

    image_path = old_img or ""
    if image_file and image_file.filename:
        fname = safe_filename(image_file.filename)
        fname = f"{secrets.token_hex(6)}_{fname}"
        dest = UPLOADS_DIR / fname
        dest.write_bytes(await image_file.read())
        image_path = f"/static/uploads/{fname}"

    tech_list = parse_tech_input(technologies)

    with engine.begin() as conn:
        res = conn.execute(
            text("""
                UPDATE projects
                SET
                    title_ru=:title_ru,
                    title_kz=:title_kz,
                    title_en=:title_en,
                    description_ru=:description_ru,
                    description_kz=:description_kz,
                    description_en=:description_en,
                    technologies=:technologies,
                    image=:image,
                    category=:category,
                    featured=:featured,
                    project_url=:project_url
                WHERE id=:id
            """),
            {
                "id": project_id,
                "title_ru": title_ru,
                "title_kz": title_kz,
                "title_en": title_en,
                "description_ru": description_ru,
                "description_kz": description_kz,
                "description_en": description_en,
                "technologies": tech_list,  # ✅ list[str]
                "image": image_path,
                "category": category,
                "featured": featured_bool,
                "project_url": project_url.strip(),
            },
        )
        if res.rowcount == 0:
            raise HTTPException(status_code=404, detail="Project not found")

    return RedirectResponse("/admin/projects", status_code=302)


@app.post("/admin/projects/{project_id}/delete")
def admin_projects_delete(project_id: int, request: Request):
    require_login(request)

    with engine.begin() as conn:
        img = conn.execute(text("SELECT image FROM projects WHERE id=:id"), {"id": project_id}).scalar()
        conn.execute(text("DELETE FROM projects WHERE id=:id"), {"id": project_id})

    try:
        if img and str(img).startswith("/static/uploads/"):
            fname = str(img).split("/static/uploads/")[-1]
            fpath = UPLOADS_DIR / fname
            if fpath.exists():
                fpath.unlink()
    except Exception:
        pass

    return RedirectResponse("/admin/projects", status_code=302)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return RedirectResponse("http://localhost:3000", status_code=302)