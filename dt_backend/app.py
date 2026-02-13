from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from .config import get_settings
from .db import create_db_engine, ensure_schema
from .paths import static_dir, templates_dir, uploads_dir
from .routers.admin.auth import create_admin_auth_router
from .routers.admin.categories import create_admin_categories_router
from .routers.admin.genres import create_admin_genres_router
from .routers.admin.projects import create_admin_projects_router
from .routers.admin.technologies import create_admin_technologies_router
from .routers.admin.template_auth import create_admin_template_auth_router
from .routers.admin.template_projects import create_admin_template_projects_router
from .routers.public.api import create_public_api_router
from .routers.public.legacy_pages import create_legacy_pages_router
from .routers.public.root import create_root_router


def create_app() -> FastAPI:
    settings = get_settings()
    engine = create_db_engine(settings)

    uploads_dir().mkdir(parents=True, exist_ok=True)

    app = FastAPI()

    app.add_middleware(SessionMiddleware, secret_key=settings.secret_key)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.mount("/static", StaticFiles(directory=str(static_dir())), name="static")

    @app.on_event("startup")
    def _startup() -> None:
        ensure_schema(engine)

    app.include_router(create_public_api_router(engine))
    app.include_router(create_root_router(settings))
    app.include_router(create_legacy_pages_router(templates_dir()))

    # Original admin interface with templates (restored design)
    app.include_router(create_admin_template_auth_router(settings, templates_dir()))
    app.include_router(create_admin_template_projects_router(engine, uploads_dir(), templates_dir()))

    # API-based admin endpoints (kept for backward compatibility)
    app.include_router(create_admin_auth_router(settings))
    app.include_router(create_admin_projects_router(engine, uploads_dir()))
    app.include_router(create_admin_technologies_router(engine))
    app.include_router(create_admin_categories_router(engine))
    app.include_router(create_admin_genres_router(engine))

    return app
