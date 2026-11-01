"""Trace FamilyCoachMD.png into layered SVGs (one layer per brand color)."""
import sys, os
import numpy as np
from PIL import Image, ImageFilter
import potrace

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

img = Image.open(SRC).convert('RGBA')
W, H = img.size
px = np.array(img).astype(float)
alpha = px[..., 3]
rgb = px[..., :3]

# Seed colors, refined below as the mean of their assigned pixels.
seeds = {
    'stem':       (58, 61, 53),
    'wordmark':   (181, 137, 76),
    'leaf-big':   (107, 112, 85),
    'leaf-small-line': (158, 161, 140),
    'leaf-small': (196, 180, 143),
}
names = list(seeds)
cent = np.array([seeds[n] for n in names], float)
mask = alpha > 110
pts = rgb[mask]
for _ in range(8):
    d = ((pts[:, None, :] - cent[None]) ** 2).sum(-1)
    lab = d.argmin(1)
    for i in range(len(names)):
        if (lab == i).any():
            cent[i] = pts[lab == i].mean(0)
labels = np.full(alpha.shape, -1)
labels[mask] = lab
hexes = {n: '#%02X%02X%02X' % tuple(int(round(c)) for c in cent[i]) for i, n in enumerate(names)}
print(hexes)


def trace(layer_mask, turd=40):
    # light blur + threshold smooths jaggies before tracing
    m = Image.fromarray((layer_mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))
    # this potrace binding traces the False pixels, so pass the inverse
    bm = potrace.Bitmap(np.array(m) <= 127)
    path = bm.trace(turdsize=turd, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY,
                    alphamax=1.0, opticurve=True, opttolerance=0.4)
    out = []
    for curve in path:
        s = curve.start_point
        seg = [f'M{s.x:.1f},{s.y:.1f}']
        for sg in curve.segments:
            if sg.is_corner:
                seg.append(f'L{sg.c.x:.1f},{sg.c.y:.1f}L{sg.end_point.x:.1f},{sg.end_point.y:.1f}')
            else:
                seg.append(f'C{sg.c1.x:.1f},{sg.c1.y:.1f} {sg.c2.x:.1f},{sg.c2.y:.1f} {sg.end_point.x:.1f},{sg.end_point.y:.1f}')
        out.append(''.join(seg) + 'Z')
    return ''.join(out)


layers = {}
for i, n in enumerate(names):
    layers[n] = trace(labels == i)
    print(n, len(layers[n]))

# The letters cut a halo gap into the stem and small leaf. For the symbol-only
# file, close those gaps (dilate then erode) so the stem reads as one line.
def grow(m, r):
    return np.array(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(r))) > 127

# Only touch pixels near the letters, so leaf joints keep their shape.
near_letters = grow(labels == names.index("wordmark"), 91)

def closed(m, r=121):
    im = Image.fromarray((m * 255).astype(np.uint8))
    im = im.filter(ImageFilter.MaxFilter(r)).filter(ImageFilter.MinFilter(r))
    return m | ((np.array(im) > 127) & near_letters)

for n in ['stem', 'leaf-small', 'leaf-small-line']:
    layers[n + '-closed'] = trace(closed(labels == names.index(n)))

# Crop to content bounds with a small margin.
ys, xs = np.where(mask)
x0, y0, x1, y1 = xs.min() - 20, ys.min() - 20, xs.max() + 20, ys.max() + 20
vb = f'{x0} {y0} {x1 - x0} {y1 - y0}'

# Paint order: small leaf fill, its outline, big leaf, stem (outlines on top), wordmark last.
order = ['leaf-small', 'leaf-small-line', 'leaf-big', 'stem', 'wordmark']


def svg(parts, fills, title='FamilyCoachMD'):
    body = '\n'.join(f'  <path id="{p.replace("-closed", "")}" fill="{fills[p.replace("-closed", "")]}" fill-rule="evenodd" d="{layers[p]}"/>' for p in parts)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="{title}">\n'
            f'  <title>{title}</title>\n{body}\n</svg>\n')

mono = lambda c: {n: c for n in names}
files = {
    'familycoachmd-logo.svg': (order, hexes),
    'familycoachmd-logo-mono-ink.svg': (order, mono('#23261F')),
    'familycoachmd-logo-mono-cream.svg': (order, mono('#F6F2EA')),
    'familycoachmd-symbol.svg': (['leaf-small-closed', 'leaf-small-line-closed', 'leaf-big', 'stem-closed'], hexes),
    'familycoachmd-wordmark.svg': (['wordmark'], hexes),
}
# Reversed version for dark backgrounds: cream wordmark, light stem.
dark = dict(hexes); dark['wordmark'] = '#D9B27A'; dark['stem'] = '#E9E4D6'
files['familycoachmd-logo-on-dark.svg'] = (order, dark)

for f, (parts, fills) in files.items():
    open(os.path.join(OUT, f), 'w', encoding='utf-8').write(svg(parts, fills))
print('viewBox', vb)
