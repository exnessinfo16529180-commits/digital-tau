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


def _parse_csv_tags(s: str) -> List[str]:
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


def parse_tech_input(value: Any) -> List[str]:
    """
    Принимает:
      - list[str] (например, из <select multiple>)
      - "a,b,c" (например, из input text или FormData)
      - "{a,b,c}" (postgres style)
    """
    if value is None:
        return []

    if isinstance(value, list):
        cleaned = [str(x).strip() for x in value if x is not None and str(x).strip()]
        # Совместимость: если пришла одна строка "a,b,c" — распарсим как CSV.
        if len(cleaned) == 1 and "," in cleaned[0]:
            return _parse_csv_tags(cleaned[0])
        return cleaned

    if isinstance(value, str):
        return _parse_csv_tags(value)

    return _parse_csv_tags(str(value))


def row_to_project(row: Dict[str, Any]) -> Dict[str, Any]:
    tech = row.get("technologies")
    if tech is None:
        tech_list: List[str] = []
    elif isinstance(tech, list):
        tech_list = [str(x) for x in tech]
    elif isinstance(tech, str):
        tech_list = _parse_csv_tags(tech)
    else:
        tech_list = []

    genres = row.get("genres")
    if genres is None:
        genres_list: List[str] = []
    elif isinstance(genres, list):
        genres_list = [str(x) for x in genres]
    elif isinstance(genres, str):
        genres_list = _parse_csv_tags(genres)
    else:
        genres_list = []

    return {
        "id": str(row.get("id")),
        "titleRu": row.get("title_ru"),
        "titleKz": row.get("title_kz"),
        "titleEn": row.get("title_en"),
        "descriptionRu": row.get("description_ru"),
        "descriptionKz": row.get("description_kz"),
        "descriptionEn": row.get("description_en"),
        "technologies": tech_list,
        "genres": genres_list,
        "image": row.get("image"),
        "category": row.get("category"),
        "featured": bool(row.get("featured")),
        "projectUrl": row.get("project_url"),
    }
