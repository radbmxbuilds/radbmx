# RAD BMX Builds

Static marketing site. Live at radbmxbuilds.com. No build step, no framework — plain HTML/CSS/JS served from the repo root by GitHub Pages.

- **Preview:** `python3 -m http.server` → http://localhost:8000 (assets use relative paths, so local matches production)
- **Deploy:** push to `main` — Pages serves `main` / root.

## Launch status

Live and indexable: custom domain (`CNAME`) active, DNS pointed at GitHub Pages, **Enforce HTTPS** on, and `noindex` removed from `index.html` / `merch.html`. `404.html` keeps `noindex` by design.

Remaining: submit `sitemap.xml` in Google Search Console so the pages get crawled.

## Regenerating brand assets

`favicon.ico`, `apple-touch-icon.png`, and `og-image.png` at the repo root are derived from the source art in `logos/`. Regenerate them with the single Python block below. Pillow is pulled on demand via `uv` — no project virtualenv needed. Last regenerated with **Pillow 12.2.0**.

```bash
uv run --with pillow python3 - <<'PY'
from PIL import Image

# favicon.ico (16/32/48, square) — pad the landscape source to a square
# transparent canvas first so the embedded sizes stay square.
src = Image.open('logos/image0.png').convert('RGBA')
sw, sh = src.size
side = max(sw, sh)
square = Image.new('RGBA', (side, side), (0, 0, 0, 0))
square.paste(src, ((side - sw) // 2, (side - sh) // 2), src)
square.save('favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])

# apple-touch-icon.png — 180x180, pink #ED2B85 background, logo fit to ~85%.
# iOS Safari renders transparent pixels in touch icons as black, so we always
# fill a solid brand background.
canvas = Image.new('RGBA', (180, 180), (0xED, 0x2B, 0x85, 255))
logo = Image.open('logos/image0.png').convert('RGBA')
max_dim = 153  # ~85% of 180
w, h = logo.size
scale = min(max_dim / w, max_dim / h)
nw, nh = int(round(w * scale)), int(round(h * scale))
logo_r = logo.resize((nw, nh), Image.LANCZOS)
canvas.paste(logo_r, ((180 - nw) // 2, (180 - nh) // 2), logo_r)
canvas.save('apple-touch-icon.png', format='PNG')

# og-image.png — 1200x630, ink #2B2F33 background, banner fit to ~80%.
og = Image.new('RGBA', (1200, 630), (0x2B, 0x2F, 0x33, 255))
banner = Image.open('logos/RAD BMX Builds Logo_ BannerFinal.png').convert('RGBA')
bw, bh = banner.size
bscale = min((1200 * 0.8) / bw, (630 * 0.8) / bh)
nbw, nbh = int(round(bw * bscale)), int(round(bh * bscale))
banner_r = banner.resize((nbw, nbh), Image.LANCZOS)
og.paste(banner_r, ((1200 - nbw) // 2, (630 - nbh) // 2), banner_r)
og_rgb = Image.new('RGB', og.size, (0x2B, 0x2F, 0x33))
og_rgb.paste(og, mask=og.split()[3])
og_rgb.save('og-image.png', format='PNG')
PY
```

Verify the outputs:

```bash
file favicon.ico                                         # -> MS Windows icon resource, 3 icons (16x16, 32x32, 48x48)
sips -g pixelWidth -g pixelHeight apple-touch-icon.png   # -> 180 x 180
sips -g pixelWidth -g pixelHeight og-image.png           # -> 1200 x 630
```

## Buy Button

The merch page embeds a third-party Buy Button from the merch partner's hosted SDK (`buy-button/latest/...`), intentionally **unpinned** (`/latest/`) per the vendor's distribution pattern. If the widget renders oddly or stops loading, check the vendor's changelog first. The storefront access token in `docs/snippets/buyButton.html` is a **public** storefront token (safe to commit) — do not swap in an admin/private API key.
