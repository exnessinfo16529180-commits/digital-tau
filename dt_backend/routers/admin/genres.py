from fastapi import APIRouter, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy import text
from sqlalchemy.engine import Engine

from .auth import require_login
from .html import admin_layout
from ...utils import escape_html


def create_admin_genres_router(engine: Engine) -> APIRouter:
    router = APIRouter(tags=["admin-genres"])

    @router.get("/api/admin/genres", response_class=HTMLResponse)
    def admin_genres(request: Request):
        require_login(request)

        with engine.connect() as conn:
            rows = conn.execute(text("SELECT id, name FROM genres ORDER BY name ASC")).mappings().all()

        items = []
        for r in rows:
            items.append(
                f"""
                <tr>
                  <td style="padding:10px;border-bottom:1px solid #222;">{r["id"]}</td>
                  <td style="padding:10px;border-bottom:1px solid #222;">{escape_html(r["name"])}</td>
                  <td style="padding:10px;border-bottom:1px solid #222;">
                    <form style="display:inline" method="post" action="/api/admin/genres/{r["id"]}/delete"
                          onsubmit="return confirm('Delete genre #{r["id"]}?');">
                      <button style="background:transparent;border:0;color:#ff5b5b;cursor:pointer;">Delete</button>
                    </form>
                  </td>
                </tr>
                """
            )

        body = f"""
          <div style="display:flex;gap:12px;align-items:end;margin-bottom:14px;">
            <form method="post" action="/api/admin/genres/new" style="display:flex;gap:10px;align-items:end;flex-wrap:wrap;">
              <div>
                <label style="display:block;margin-bottom:6px;opacity:.85;">New genre name</label>
                <input name="name" required
                       style="min-width:260px;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">
              </div>
              <button style="padding:10px 12px;border-radius:10px;background:#F5A623;color:#000;font-weight:800;border:0;cursor:pointer;">
                + Add genre
              </button>
            </form>
          </div>

          <table style="width:100%;border-collapse:collapse;background:#0b0b0b;border:1px solid #222;border-radius:14px;overflow:hidden;">
            <thead>
              <tr>
                <th style="text-align:left;padding:10px;border-bottom:1px solid #222;">ID</th>
                <th style="text-align:left;padding:10px;border-bottom:1px solid #222;">Name</th>
                <th style="text-align:left;padding:10px;border-bottom:1px solid #222;">Actions</th>
              </tr>
            </thead>
            <tbody>
              {''.join(items) if items else '<tr><td colspan="3" style="padding:12px;opacity:.7;">No genres</td></tr>'}
            </tbody>
          </table>
        """
        return HTMLResponse(admin_layout("Admin • Genres", body))

    @router.post("/api/admin/genres/new")
    def admin_genres_create(request: Request, name: str = Form(...)):
        require_login(request)

        clean = (name or "").strip()
        if not clean:
            return RedirectResponse("/api/admin/genres", status_code=302)

        with engine.begin() as conn:
            conn.execute(
                text("INSERT INTO genres (name) VALUES (:name) ON CONFLICT (name) DO NOTHING"),
                {"name": clean},
            )

        return RedirectResponse("/api/admin/genres", status_code=302)

    @router.post("/api/admin/genres/{genre_id}/delete")
    def admin_genres_delete(genre_id: int, request: Request):
        require_login(request)

        with engine.begin() as conn:
            conn.execute(text("DELETE FROM genres WHERE id = :id"), {"id": genre_id})

        return RedirectResponse("/api/admin/genres", status_code=302)

    return router
