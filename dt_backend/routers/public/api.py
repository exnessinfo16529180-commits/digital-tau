from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.engine import Engine

from ...utils import row_to_project


def create_public_api_router(engine: Engine) -> APIRouter:
    router = APIRouter()

    @router.get("/api/stats")
    def api_stats():
        try:
            with engine.connect() as conn:
                projects_count = conn.execute(text("SELECT COUNT(*) FROM projects")).scalar_one()

                tech_count = conn.execute(
                    text(
                        """
                        SELECT COALESCE(COUNT(DISTINCT t), 0) AS cnt
                        FROM projects
                        LEFT JOIN LATERAL unnest(technologies) AS t ON TRUE
                        """
                    )
                ).scalar_one()

            return {
                "projects": int(projects_count),
                "students": 500,  # stub
                "technologies": int(tech_count),
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"stats db error: {e}")

    @router.get("/api/projects")
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

    @router.get("/api/technologies")
    def api_technologies():
        try:
            with engine.connect() as conn:
                rows = conn.execute(text("SELECT name FROM technologies ORDER BY name ASC")).mappings().all()
                if rows:
                    return [r["name"] for r in rows]

                derived = conn.execute(
                    text(
                        """
                        SELECT DISTINCT t AS name
                        FROM projects
                        LEFT JOIN LATERAL unnest(technologies) AS t ON TRUE
                        WHERE t IS NOT NULL AND t <> ''
                        ORDER BY name ASC
                        """
                    )
                ).mappings().all()
                return [r["name"] for r in derived]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"technologies db error: {e}")

    @router.get("/health")
    def health():
        return {"status": "ok"}

    return router

