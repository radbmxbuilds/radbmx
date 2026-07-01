# RAD BMX Builds

Static marketing site for RAD BMX Builds that mirrors the content of radbmxbuilds.com minus the store, with a dedicated merch page powered by an embedded, third-party Buy Button.

No build step, no package manager, no framework. Just HTML, CSS, and JS served directly from the repo root by GitHub Pages.

## Local preview

From the repo root:

```
python3 -m http.server
```

Then open http://localhost:8000 in a browser. All assets resolve via relative paths, so the site works identically locally and on GitHub Pages.

## Deploy

1. Push this repo to GitHub on the `main` branch.
2. In the repo on GitHub: **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.
4. Under **Custom domain**, enter `radbmxbuilds.com`. The `CNAME` file is already committed at the repo root.
5. Wait for the DNS + TLS check to finish, then tick **Enforce HTTPS**.

DNS for the apex `radbmxbuilds.com` should point at GitHub Pages' A records:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

## Project layout

```
index.html        # Home
merch.html        # Merch (embeds the merch partner's Buy Button)
css/              # Stylesheets (styles.css)
js/               # Client JS (main.js — mobile menu toggle)
logos/            # Brand assets (logos, banner art)
CNAME             # Custom domain declaration for GitHub Pages
docs/snippets/    # Canonical HTML fragments (header, footer, buyButton — inlined into pages)
```

## Regenerating brand assets

`favicon.ico`, `apple-touch-icon.png`, and `og-image.png` at the repo root are derived from the source art in `logos/`. They're regenerated with the single Python block below. Pillow is required and is installed on demand via `uv` — no project virtualenv needed. Last regenerated with **Pillow 12.2.0**.

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

## Third-party dependencies

The merch page embeds a third-party Buy Button from the merch partner's hosted SDK (`buy-button/latest/...`). That URL is intentionally **unpinned** (`/latest/`) — it's the vendor's documented distribution pattern and we don't control it. If the merch widget ever renders oddly or stops loading, check the vendor's Buy Button changelog first before digging into local code. The storefront access token in `docs/snippets/buyButton.html` is a **public** storefront token (safe to commit); do not swap in an admin/private API key.
