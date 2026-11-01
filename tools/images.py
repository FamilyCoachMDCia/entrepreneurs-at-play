"""Export site photos: WebP -sm (480 px) and -lg (up to 1200 px), duotone for B&W, warm grade for color.

Usage: python -I tools/images.py <src_dir> <out_dir>
"""
import os
import sys
import numpy as np
from PIL import Image, ImageEnhance

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SHADOW = np.array([0x1F, 0x2A, 0x17], float)   # --forest-deep
LIGHT = np.array([0xF6, 0xF2, 0xEA], float)    # --paper


def is_bw(im):
    hsv = np.array(im.convert('HSV')).astype(float)
    return hsv[..., 1].mean() < 18


def duotone(im):
    lum = np.array(im.convert('L')).astype(float) / 255.0
    lum = np.clip((lum - 0.04) / 0.92, 0, 1)  # gentle contrast stretch
    rgb = SHADOW[None, None] * (1 - lum[..., None]) + LIGHT[None, None] * lum[..., None]
    return Image.fromarray(rgb.astype(np.uint8))


def warm(im):
    im = ImageEnhance.Color(im).enhance(0.92)
    arr = np.array(im).astype(float)
    arr[..., 0] *= 1.03
    arr[..., 2] *= 0.96
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))


report = []
for f in sorted(os.listdir(SRC)):
    if not f.lower().endswith('.jpg'):
        continue
    name = os.path.splitext(f)[0]
    im = Image.open(os.path.join(SRC, f)).convert('RGB')
    bw = is_bw(im)
    graded = duotone(im) if bw else warm(im)
    # -sm for phones and small cards, -lg for everything else (never upscaled)
    for suffix, w in (('sm', 480), ('lg', min(1200, im.width))):
        out = graded if im.width <= w else graded.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        out.save(os.path.join(OUT, f'{name}-{suffix}.webp'), 'WEBP', quality=72, method=6)
    report.append(f'{name}: {im.width}x{im.height} {"duotone" if bw else "warm"}')
print('\n'.join(report))
