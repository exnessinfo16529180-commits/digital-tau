from fastapi import APIRouter, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse

from ...config import Settings


def is_logged_in(request: Request) -> bool:
    return request.session.get("admin_logged_in") is True


def require_login(request: Request):
    if not is_logged_in(request):
        raise HTTPException(status_code=401, detail="Not authorized")


def create_admin_auth_router(settings: Settings) -> APIRouter:
    router = APIRouter(tags=["admin-auth"])

    @router.get("/api/admin/me")
    def admin_me(request: Request):
        return {"loggedIn": is_logged_in(request)}

    @router.get("/api/admin", response_class=HTMLResponse)
    def admin_root(request: Request):
        return RedirectResponse(
            "/api/admin/projects" if is_logged_in(request) else "/api/admin/login",
            status_code=302,
        )

    @router.get("/api/admin/login", response_class=HTMLResponse)
    def admin_login_page(request: Request):
        html = """
        <html><head><meta charset="utf-8"><title>Admin login</title></head>
        <body style="margin:0;background:#000;color:#fff;font-family:Arial;">
          <div style="max-width:520px;margin:40px auto;padding:24px;border:1px solid rgba(255,255,255,.15);border-radius:14px;">
            <h2 style="margin:0 0 14px;">Admin login</h2>
            <form method="post" action="/api/admin/login">
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

    @router.post("/api/admin/login")
    async def admin_login(request: Request, username: str = Form(...), password: str = Form(...)):
        if username == settings.admin_user and password == settings.admin_pass:
            request.session["admin_logged_in"] = True
            return RedirectResponse("/api/admin/projects", status_code=302)

        return HTMLResponse(
            """
            <html><head><meta charset="utf-8"><title>Login failed</title></head>
            <body style="margin:0;background:#000;color:#fff;font-family:Arial;">
              <div style="max-width:520px;margin:40px auto;padding:24px;border:1px solid rgba(255,255,255,.15);border-radius:14px;">
                <h2>Login failed</h2>
                <p style="opacity:.8;">Wrong login or password.</p>
                <p><a style="color:#F5A623" href="/api/admin/login">Try again</a></p>
              </div>
            </body></html>
            """,
            status_code=401,
        )

    @router.get("/api/admin/logout")
    def admin_logout(request: Request):
        request.session.clear()
        return RedirectResponse(settings.frontend_url, status_code=302)

    return router
