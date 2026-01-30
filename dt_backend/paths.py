from pathlib import Path


def project_root() -> Path:
    # dt_backend/ лежит внутри корня didgital-tau/
    return Path(__file__).resolve().parents[1]


def static_dir() -> Path:
    return project_root() / "static"


def templates_dir() -> Path:
    return project_root() / "templates"


def uploads_dir() -> Path:
    return static_dir() / "uploads"

