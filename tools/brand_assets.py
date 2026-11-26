"""Arch & Sun brand assets: public/favicon-32.png, public/apple-touch-icon.png, public/og-image.png.
Draws the mark straight with Pillow (an arch and a half-sun), 4x supersampled, so no SVG rasteriser is needed.
Colors come from the brand kit (porta-refinada.svg). The og image text uses Georgia, the site's display fallback.
python -I tools/brand_assets.py"""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

PUBLIC = Path(__file__).resolve().parent.parent / "public"
FOREST, OCHRE, PAPER, INK, OLIVE = (59, 94, 26), (183, 139, 79), (246, 242, 234), (35, 38, 31), (107, 112, 85)
SS = 4  # supersampling


def arch_polygon():
    """Outline of the arch in a 200 x 240 box (outer r100, inner r74), as one even-odd-free ring."""
    pts = [(0, 240), (0, 100)]
    pts += [(100 - 100 * math.cos(math.radians(a)), 100 - 100 * math.sin(math.radians(a))) for a in range(0, 181, 3)]
    pts += [(200, 240), (174, 240), (174, 100)]
    pts += [(100 + 74 * math.cos(math.radians(a)), 100 - 74 * math.sin(math.radians(a))) for a in range(0, 181, 3)]
    pts += [(26, 100), (26, 240)]
    return pts


def draw_mark(d, x, y, h, rays=False):
    """Draws the mark with its top-left at (x, y), total height h (pixels of the working canvas)."""
    s = h / 240
    P = lambda px, py: (x + px * s, y + py * s)
    d.polygon([P(*p) for p in arch_polygon()], fill=FOREST)
    sun = [P(100 + 46 * math.cos(math.radians(a)), 240 - 46 * math.sin(math.radians(a))) for a in range(0, 181, 3)]
    d.polygon(sun, fill=OCHRE)
    if rays:
        for ang in (150, 120, 90, 60, 30):
            r0, r1 = 58, 68
            a = math.radians(ang)
            p0 = P(100 + r0 * math.cos(a), 240 - r0 * math.sin(a))
            p1 = P(100 + r1 * math.cos(a), 240 - r1 * math.sin(a))
            w = 9 * s
            d.line([p0, p1], fill=OCHRE, width=round(w))
            for px, py in (p0, p1):
                d.ellipse([px - w / 2, py - w / 2, px + w / 2, py + w / 2], fill=OCHRE)


def mark_icon(size, pad_ratio, bg=PAPER, radius=0):
    big = size * SS
    img = Image.new("RGB", (big, big), bg)
    d = ImageDraw.Draw(img)
    h = big * (1 - 2 * pad_ratio)
    w = h * 200 / 240
    draw_mark(d, (big - w) / 2, (big - h) / 2, h)
    return img.resize((size, size), Image.LANCZOS)


def og_image():
    W, H = 1200, 630
    big = Image.new("RGB", (W * SS, H * SS), PAPER)
    d = ImageDraw.Draw(big)
    # the faint notebook grid, like the site (24 px, olive at 8.5 %)
    gc = tuple(round(p * (1 - .085) + o * .085) for p, o in zip(PAPER, OLIVE))
    for gx in range(0, W + 1, 24):
        d.line([(gx * SS, 0), (gx * SS, H * SS)], fill=gc, width=SS)
    for gy in range(0, H + 1, 24):
        d.line([(0, gy * SS), (W * SS, gy * SS)], fill=gc, width=SS)
    # mark on the left, full height with margins
    mh = 380
    draw_mark(d, 100 * SS, (H - mh) / 2 * SS, mh * SS, rays=True)
    # wordmark on the right
    fonts = Path("C:/Windows/Fonts")
    bold = ImageFont.truetype(str(fonts / "georgiab.ttf"), 80 * SS)
    ital = ImageFont.truetype(str(fonts / "georgiaz.ttf"), 80 * SS)
    small = ImageFont.truetype(str(fonts / "georgia.ttf"), 28 * SS)
    tx = 480 * SS
    d.text((tx, 205 * SS), "Entrepreneurs", font=bold, fill=INK)
    d.text((tx, 293 * SS), "at Play", font=ital, fill=FOREST)
    d.text((tx, 410 * SS), "A FamilyCoachMD program", font=small, fill=OLIVE)
    return big.resize((W, H), Image.LANCZOS)


if __name__ == "__main__":
    mark_icon(32, 0.08).save(PUBLIC / "favicon-32.png", optimize=True)
    mark_icon(180, 0.17).save(PUBLIC / "apple-touch-icon.png", optimize=True)
    og_image().save(PUBLIC / "og-image.png", optimize=True)
    print("ok")
