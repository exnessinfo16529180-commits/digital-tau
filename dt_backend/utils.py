import re
from typing import Any, Dict, List


def escape_html(s: Any) -> str:
    return (
        str(s if s is not None else "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#039;")
    )


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
        "projectUrl": row.get("project_url"),
    }

