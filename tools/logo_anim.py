"""Build the animatable FamilyCoachMD SVG used by the loader.

Layers: small leaf (fill + line), big leaf (fill + line), stem (masked by a
centerline stroke so it can "grow"), and the wordmark split into one path per
glyph. Coordinates stay in the source PNG's pixel space, like the static SVGs.
"""
import re
import sys
import numpy as np
from PIL import Image, ImageFilter
import potrace

SRC, OUT = sys.argv[1], sys.argv[2]
px = np.array(Image.open(SRC).convert('RGBA')).astype(float)
alpha, rgb = px[..., 3], px[..., :3]

names = ['stem', 'wordmark', 'leaf-big', 'leaf-small-line', 'leaf-small']
cent = np.array([(58, 61, 53), (181, 137, 76), (107, 112, 85), (158, 161, 140), (196, 180, 143)], float)
mask = alpha > 110
pts = rgb[mask]
for _ in range(8):
    lab = ((pts[:, None, :] - cent[None]) ** 2).sum(-1).argmin(1)
    for i in range(len(names)):
        if (lab == i).any():
            cent[i] = pts[lab == i].mean(0)
labels = np.full(alpha.shape, -1)
labels[mask] = lab
hexes = {n: '#%02X%02X%02X' % tuple(int(round(c)) for c in cent[i]) for i, n in enumerate(names)}

H, W = labels.shape
yy, xx = np.mgrid[0:H, 0:W]
dark = labels == names.index('stem')
# The big leaf sits top-right of where the stem meets it (~2790, 720).
big_region = (xx > 2760) & (yy < 765)
layer_masks = {
    'stem': dark & ~big_region,
    'leaf-big-line': dark & big_region,
    'leaf-big': labels == names.index('leaf-big'),
    'leaf-small-line': labels == names.index('leaf-small-line'),
    'leaf-small': labels == names.index('leaf-small'),
    'wordmark': labels == names.index('wordmark'),
}
fills = dict(hexes)
fills['leaf-big-line'] = hexes['stem']


def trace(m, turd=40):
    im = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))
    bm = potrace.Bitmap(np.array(im) <= 127)  # binding traces False pixels
    path = bm.trace(turdsize=turd, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY,
                    alphamax=1.0, opticurve=True, opttolerance=0.4)
    subs = []
    for curve in path:
        s = curve.start_point
        d = [f'M{s.x:.1f},{s.y:.1f}']
        for sg in curve.segments:
            if sg.is_corner:
                d.append(f'L{sg.c.x:.1f},{sg.c.y:.1f}L{sg.end_point.x:.1f},{sg.end_point.y:.1f}')
            else:
                d.append(f'C{sg.c1.x:.1f},{sg.c1.y:.1f} {sg.c2.x:.1f},{sg.c2.y:.1f} {sg.end_point.x:.1f},{sg.end_point.y:.1f}')
        subs.append(''.join(d) + 'Z')
    return subs


def bbox(d):
    n = list(map(float, re.findall(r'-?\d+\.?\d*', d)))
    xs, ys = n[0::2], n[1::2]
    return min(xs), min(ys), max(xs), max(ys)


traced = {k: trace(m) for k, m in layer_masks.items()}

# Group wordmark sub-paths into glyphs: a sub-path inside another's bbox is a
# counter (hole) of that glyph. The i-dot stays its own piece.
subs = traced['wordmark']
boxes = [bbox(s) for s in subs]
area = lambda b: (b[2] - b[0]) * (b[3] - b[1])
order = sorted(range(len(subs)), key=lambda i: -area(boxes[i]))
owner = {}
for i in order:
    bi = boxes[i]
    for j in order:
        if j == i or j in owner or area(boxes[j]) <= area(bi):
            continue
        bj = boxes[j]
        if bi[0] >= bj[0] and bi[1] >= bj[1] and bi[2] <= bj[2] and bi[3] <= bj[3]:
            owner[i] = j
            break
glyphs = {}
for i in range(len(subs)):
    root = i
    while root in owner:
        root = owner[root]
    glyphs.setdefault(root, []).append(subs[i])
glyph_list = sorted(glyphs.items(), key=lambda kv: boxes[kv[0]][0])
print('glyph pieces:', len(glyph_list))

# Stem centerline, sampled per column (stem is a function of x until the leaf).
line = []
for x in list(range(232, 2760, 40)) + [2759]:
    ys = np.where(layer_masks['stem'][:, x])[0]
    if len(ys):
        line.append((x, ys.mean()))
line.append((2792, 712))  # into the big leaf's base
# Light smoothing to avoid kinks from the y/D halo gaps.
arr = np.array(line)
sm = arr.copy()
for k in range(1, len(arr) - 1):
    sm[k, 1] = (arr[k - 1, 1] + 2 * arr[k, 1] + arr[k + 1, 1]) / 4
center_d = 'M' + ' L'.join(f'{x:.0f},{y:.0f}' for x, y in sm)


def base_of(m, xmin, ymin, xmax, ymax):
    """Lowest pixel of a layer inside a box: the leaf's attachment point."""
    region = m & (xx >= xmin) & (xx <= xmax) & (yy >= ymin) & (yy <= ymax)
    ys, xs = np.where(region)
    k = ys.argmax()
    return int(xs[k]), int(ys[k])

big_base = (2792, 716)
small_base = (2672, 830)  # measured: bottom of the small leaf stub
print('small leaf base', small_base, 'big leaf base', big_base)

ys, xs = np.where(mask)
vb = f'{xs.min() - 20} {ys.min() - 20} {xs.max() - xs.min() + 40} {ys.max() - ys.min() + 40}'
P = lambda k: ''.join(traced[k])
glyph_paths = '\n'.join(
    f'      <path class="glyph" d="{"".join(parts)}"/>' for _, parts in glyph_list)

svg = f'''<svg class="fcmd-logo" xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="FamilyCoachMD">
  <defs>
    <mask id="fcmd-stem-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="{W}" height="{H}">
      <path class="fcmd-stem-center" d="{center_d}" fill="none" stroke="#fff" stroke-width="120" stroke-linecap="round" stroke-linejoin="round"/>
    </mask>
  </defs>
  <g class="fcmd-leaf-small" data-origin="{small_base[0]} {small_base[1]}">
    <path fill="{fills['leaf-small']}" fill-rule="evenodd" d="{P('leaf-small')}"/>
    <path fill="{fills['leaf-small-line']}" fill-rule="evenodd" d="{P('leaf-small-line')}"/>
  </g>
  <g class="fcmd-leaf-big" data-origin="{big_base[0]} {big_base[1]}">
    <path fill="{fills['leaf-big']}" fill-rule="evenodd" d="{P('leaf-big')}"/>
    <path fill="{fills['leaf-big-line']}" fill-rule="evenodd" d="{P('leaf-big-line')}"/>
  </g>
  <path class="fcmd-stem" mask="url(#fcmd-stem-mask)" fill="{fills['stem']}" fill-rule="evenodd" d="{P('stem')}"/>
  <g class="fcmd-wordmark" fill="{fills['wordmark']}" fill-rule="evenodd">
{glyph_paths}
  </g>
</svg>
'''
open(OUT, 'w', encoding='utf-8').write(svg)
print('viewBox', vb, 'bytes', len(svg))
