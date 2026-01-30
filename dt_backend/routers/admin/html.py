from typing import Any, Dict, Optional

from ...utils import escape_html


def admin_layout(title: str, body: str) -> str:
    return f"""
    <html>
      <head><meta charset="utf-8"><title>{escape_html(title)}</title></head>
      <body style="margin:0;background:#000;color:#fff;font-family:Arial;">
        <div style="max-width:1100px;margin:24px auto;padding:0 18px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:16px;">
            <h2 style="margin:0;">{escape_html(title)}</h2>
            <div style="display:flex;gap:10px;">
              <a href="/api/admin/projects" style="color:#F5A623;text-decoration:none;">Projects</a>
              <a href="/api/admin/categories" style="color:#F5A623;text-decoration:none;">Categories</a>
              <a href="/api/admin/technologies" style="color:#F5A623;text-decoration:none;">Technologies</a>
              <a href="/api/admin/genres" style="color:#F5A623;text-decoration:none;">Genres</a>
              <a href="/api/admin/logout" style="color:#F5A623;text-decoration:none;">Logout</a>
            </div>
          </div>
          {body}
        </div>
      </body>
    </html>
    """


def project_form_html(
    action: str,
    values: Optional[Dict[str, Any]] = None,
    show_current_image: bool = False,
    *,
    categories: Optional[list[str]] = None,
    technologies: Optional[list[str]] = None,
    genres: Optional[list[str]] = None,
) -> str:
    v = values or {}

    def val(k: str) -> str:
        return escape_html(v.get(k, "") if v.get(k, "") is not None else "")

    featured_checked = "checked" if v.get("featured") else ""
    current_img = v.get("image") or ""

    categories_list = categories or ["web", "mobile", "iot", "aiml", "vrar"]
    selected_category = v.get("category") if v.get("category") is not None else ""

    # если категория проекта уже не в списке — покажем её тоже
    if selected_category and selected_category not in categories_list:
        categories_list = [selected_category] + categories_list

    options_html = "".join(
        [f'<option value="{escape_html(c)}" {"selected" if selected_category == c else ""}>{escape_html(c)}</option>' for c in categories_list]
    )

    selected_tech: list[str] = list(v.get("technologies_selected") or [])
    selected_genres: list[str] = list(v.get("genres_selected") or [])

    tech_list = technologies or []
    genres_list = genres or []

    tech_options_html = "".join(
        [
            f'<option value="{escape_html(t)}" {"selected" if t in selected_tech else ""}>{escape_html(t)}</option>'
            for t in tech_list
        ]
    )
    genres_options_html = "".join(
        [
            f'<option value="{escape_html(g)}" {"selected" if g in selected_genres else ""}>{escape_html(g)}</option>'
            for g in genres_list
        ]
    )

    img_block = ""
    if show_current_image:
        img_block = f"""
          <div style="margin:10px 0;opacity:.9;">
            <div style="margin-bottom:6px;">Current image:</div>
            <div style="display:flex;gap:12px;align-items:center;">
              <div style="width:200px;height:120px;border:1px solid #222;border-radius:12px;overflow:hidden;background:#111;">
                {'<img src="'+escape_html(current_img)+'" style="width:100%;height:100%;object-fit:cover;">' if current_img else '<div style="padding:12px;opacity:.7;">No image</div>'}
              </div>
              <div style="opacity:.8;">Uploading a new file will replace the image.</div>
            </div>
          </div>
        """

    return f"""
    <form method="post" action="{escape_html(action)}" enctype="multipart/form-data"
          style="background:#0b0b0b;border:1px solid #222;border-radius:14px;padding:18px;">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
        <div>
          <label>Title RU</label><br>
          <input name="title_ru" value="{val("title_ru")}" required
                 style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">
        </div>
        <div>
          <label>Title KZ</label><br>
          <input name="title_kz" value="{val("title_kz")}" required
                 style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">
        </div>
        <div>
          <label>Title EN</label><br>
          <input name="title_en" value="{val("title_en")}" required
                 style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">
        </div>
      </div>

      <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
        <div>
          <label>Description RU</label><br>
          <textarea name="description_ru" required
                 style="width:100%;min-height:90px;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">{val("description_ru")}</textarea>
        </div>
        <div>
          <label>Description KZ</label><br>
          <textarea name="description_kz" required
                 style="width:100%;min-height:90px;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">{val("description_kz")}</textarea>
        </div>
        <div>
          <label>Description EN</label><br>
          <textarea name="description_en" required
                 style="width:100%;min-height:90px;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">{val("description_en")}</textarea>
        </div>
      </div>

      <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:end;">
        <div>
          <label>Technologies</label><br>
          <select name="technologies" multiple size="8"
                  style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">
            {tech_options_html}
          </select>
          <div style="margin-top:6px;opacity:.7;font-size:12px;">
            Tip: hold Ctrl/Cmd to select multiple. Add options in <a style="color:#F5A623" href="/api/admin/technologies">Technologies</a>.
          </div>
        </div>
        <div>
          <label>Project URL</label><br>
          <input name="project_url" value="{val("project_url")}"
                 style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">
        </div>
      </div>

      <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;align-items:end;">
        <div>
          <label>Category</label><br>
          <select name="category"
                  style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">
            {options_html}
          </select>
          <div style="margin-top:6px;opacity:.7;font-size:12px;">
            Manage in <a style="color:#F5A623" href="/api/admin/categories">Categories</a>.
          </div>
        </div>
        <div>
          <label>Genres</label><br>
          <select name="genres" multiple size="6"
                  style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">
            {genres_options_html}
          </select>
          <div style="margin-top:6px;opacity:.7;font-size:12px;">
            Manage in <a style="color:#F5A623" href="/api/admin/genres">Genres</a>.
          </div>
        </div>
        <div>
          <label>Featured</label><br>
          <input type="checkbox" name="featured" value="1" {featured_checked}>
        </div>
      </div>

      <div style="margin-top:12px;">
        <label>Image file</label><br>
        <input type="file" name="image_file" accept="image/*" style="color:#fff;">
      </div>

      {img_block}

      <div style="margin-top:14px;">
        <button style="padding:10px 14px;border-radius:10px;border:0;background:#F5A623;font-weight:800;cursor:pointer;">
          Save
        </button>
      </div>
    </form>
    """
