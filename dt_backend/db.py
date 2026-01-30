from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

from .config import Settings


def create_db_engine(settings: Settings) -> Engine:
    return create_engine(settings.database_url, pool_pre_ping=True)


def ensure_schema(engine: Engine) -> None:
    # Idempotent: полезно для пустого volume без init-скрипта.
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS categories (
                  id SERIAL PRIMARY KEY,
                  name TEXT NOT NULL UNIQUE
                );
                """
            )
        )

        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS genres (
                  id SERIAL PRIMARY KEY,
                  name TEXT NOT NULL UNIQUE
                );
                """
            )
        )
        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS projects (
                  id SERIAL PRIMARY KEY,

                  title_ru TEXT NOT NULL,
                  title_kz TEXT NOT NULL,
                  title_en TEXT NOT NULL,

                  description_ru TEXT NOT NULL,
                  description_kz TEXT NOT NULL,
                  description_en TEXT NOT NULL,

                  technologies TEXT[] NOT NULL DEFAULT '{}',
                  genres TEXT[] NOT NULL DEFAULT '{}',

                  image TEXT NOT NULL DEFAULT '',
                  category TEXT NOT NULL DEFAULT 'web',
                  featured BOOLEAN NOT NULL DEFAULT FALSE,

                  project_url TEXT NOT NULL DEFAULT ''
                );
                """
            )
        )

        # Если projects уже есть (например, после старой версии схемы) — добавим недостающие поля.
        conn.execute(text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS genres TEXT[] NOT NULL DEFAULT '{}'"))

        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS technologies (
                  id SERIAL PRIMARY KEY,
                  name TEXT NOT NULL UNIQUE
                );
                """
            )
        )

        # Базовые категории (если хотите свои — добавляйте/удаляйте в /admin/categories).
        conn.execute(
            text(
                """
                INSERT INTO categories (name) VALUES
                  ('aiml'), ('iot'), ('web'), ('mobile'), ('vrar')
                ON CONFLICT (name) DO NOTHING;
                """
            )
        )
