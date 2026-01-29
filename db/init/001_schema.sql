-- 001_schema.sql

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,

  title_ru TEXT NOT NULL,
  title_kz TEXT NOT NULL,
  title_en TEXT NOT NULL,

  description_ru TEXT NOT NULL,
  description_kz TEXT NOT NULL,
  description_en TEXT NOT NULL,

  technologies TEXT[] NOT NULL DEFAULT '{}',

  image TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'web',
  featured BOOLEAN NOT NULL DEFAULT FALSE,

  project_url TEXT NOT NULL DEFAULT ''
);
