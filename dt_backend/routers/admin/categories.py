from fastapi import APIRouter, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy import text
from sqlalchemy.engine import Engine

from .auth import require_login
from .html import admin_layout
from ...utils import escape_html


def create_admin_categories_router(engine: Engine) -> APIRouter:
    router = APIRouter(tags=["admin-categories"])

    @router.get("/admin/categories", response_class=HTMLResponse)
    def admin_categories(request: Request):
        require_login(request)

        with engine.connect() as conn:
            rows = conn.execute(text("SELECT id, name FROM categories ORDER BY name ASC")).mappings().all()

        items = []
        for r in rows:
            items.append(
                f"""
                <tr>
                  <td style="padding:10px;border-bottom:1px solid #222;">{r["id"]}</td>
                  <td style="padding:10px;border-bottom:1px solid #222;">{escape_html(r["name"])}</td>
                  <td style="padding:10px;border-bottom:1px solid #222;">
                    <form style="display:inline" method="post" action="/admin/categories/{r["id"]}/delete"
                          onsubmit="return confirm('Delete category #{r["id"]}?');">
                      <button style="background:transparent;border:0;color:#ff5b5b;cursor:pointer;">Delete</button>
                    </form>
                  </td>
                </tr>
                """
            )

        body = f"""
          <div style="display:flex;gap:12px;align-items:end;margin-bottom:14px;">
            <form method="post" action="/admin/categories/new" style="display:flex;gap:10px;align-items:end;flex-wrap:wrap;">
              <div>
                <label style="display:block;margin-bottom:6px;opacity:.85;">New category name</label>
                <input name="name" required
                       style="min-width:260px;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">
              </div>
              <button style="padding:10px 12px;border-radius:10px;background:#F5A623;color:#000;font-weight:800;border:0;cursor:pointer;">
                + Add category
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
              {''.join(items) if items else '<tr><td colspan="3" style="padding:12px;opacity:.7;">No categories</td></tr>'}
            </tbody>
          </table>
        """
        return HTMLResponse(admin_layout("Admin • Categories", body))

    @router.post("/admin/categories/new")
    def admin_categories_create(request: Request, name: str = Form(...)):
        require_login(request)

        clean = (name or "").strip()
        if not clean:
            return RedirectResponse("/admin/categories", status_code=302)

        with engine.begin() as conn:
            conn.execute(
                text("INSERT INTO categories (name) VALUES (:name) ON CONFLICT (name) DO NOTHING"),
                {"name": clean},
            )

        return RedirectResponse("/admin/categories", status_code=302)

    @router.post("/admin/categories/{category_id}/delete")
    def admin_categories_delete(category_id: int, request: Request):
        require_login(request)

        with engine.begin() as conn:
            conn.execute(text("DELETE FROM categories WHERE id = :id"), {"id": category_id})

        return RedirectResponse("/admin/categories", status_code=302)

    return router

