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
              <a href="/admin/projects" style="color:#F5A623;text-decoration:none;">Projects</a>
              <a href="/admin/technologies" style="color:#F5A623;text-decoration:none;">Technologies</a>
              <a href="/admin/logout" style="color:#F5A623;text-decoration:none;">Logout</a>
            </div>
          </div>
          {body}
        </div>
      </body>
    </html>
    """


def project_form_html(action: str, values: Optional[Dict[str, Any]] = None, show_current_image: bool = False) -> str:
    v = values or {}

    def val(k: str) -> str:
        return escape_html(v.get(k, "") if v.get(k, "") is not None else "")

    featured_checked = "checked" if v.get("featured") else ""
    current_img = v.get("image") or ""

    categories = ["web", "mobile", "iot", "aiml", "vrar"]
    selected_category = v.get("category") if v.get("category") is not None else ""
    options_html = "".join(
        [
            f'<option value="{c}" {"selected" if selected_category == c else ""}>{c}</option>'
            for c in categories
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
          <label>Technologies (comma-separated)</label><br>
          <input name="technologies" value="{val("technologies")}"
                 style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;">
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
        </div>
        <div>
          <label>Featured</label><br>
          <input type="checkbox" name="featured" value="1" {featured_checked}>
        </div>
        <div>
          <label>Image file</label><br>
          <input type="file" name="image_file" accept="image/*" style="color:#fff;">
        </div>
      </div>

      {img_block}

      <div style="margin-top:14px;">
        <button style="padding:10px 14px;border-radius:10px;border:0;background:#F5A623;font-weight:800;cursor:pointer;">
          Save
        </button>
      </div>
    </form>
    """
