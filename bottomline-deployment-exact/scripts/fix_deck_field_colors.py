"""One-off patch: resample the *actual* text colour for every entry in
lib/deckFields.ts from the existing public/deck/<key>/slide-NN.png renders.

deck_fields.py's `fg` was never a real sampled colour — it was a fixed
black/white pick based on background luminance, so an edited figure never
matched a differently-coloured neighbour in the same row (e.g. a blue
"total" row rendering the user's edit in plain black). This finds the
actual glyph pixels inside each field's box (pixels far enough from the
box's own background colour) and uses their modal colour as `fg` instead.

Usage: python scripts/fix_deck_field_colors.py
"""

import json
import os
import re
from collections import Counter

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIELDS_PATH = os.path.join(ROOT, 'lib', 'deckFields.ts')
DECK_DIR = os.path.join(ROOT, 'public', 'deck')

ENTRY_RE = re.compile(r'\{[^{}]*\}')
BLOCK_RE = re.compile(r'"(\w+)":\s*\[(.*?)\n  \],', re.DOTALL)


def real_fg(img, box, bg_hex):
    W, H = img.size
    x0 = max(0, int(box['x'] * W) + 2)
    y0 = max(0, int(box['y'] * H) + 2)
    x1 = min(W, int((box['x'] + box['w']) * W) - 2)
    y1 = min(H, int((box['y'] + box['h']) * H) - 2)
    if x1 <= x0 or y1 <= y0:
        return None
    region = img.crop((x0, y0, x1, y1)).convert('RGB')
    bg = tuple(int(bg_hex[i:i + 2], 16) for i in (1, 3, 5))
    fg_pixels = [
        px for px in region.getdata()
        if sum(abs(a - b) for a, b in zip(px, bg)) > 60
    ]
    if len(fg_pixels) < 4:
        return None
    (r, g, b), _ = Counter(fg_pixels).most_common(1)[0]
    return f'#{r:02x}{g:02x}{b:02x}'


def patch_block(deck_key, body):
    changed = 0
    def repl(m):
        nonlocal changed
        f = json.loads(m.group(0))
        png = os.path.join(DECK_DIR, deck_key, f'slide-{f["slide"]:02d}.png')
        if os.path.exists(png):
            img = Image.open(png)
            new_fg = real_fg(img, f, f['bg'])
            if new_fg and new_fg != f['fg']:
                f['fg'] = new_fg
                changed += 1
        return json.dumps(f)
    new_body = ENTRY_RE.sub(repl, body)
    return new_body, changed


def main():
    with open(FIELDS_PATH, 'r', encoding='utf-8') as fh:
        text = fh.read()

    total_changed = 0
    def block_repl(m):
        nonlocal total_changed
        key, body = m.group(1), m.group(2)
        new_body, changed = patch_block(key, body)
        total_changed += changed
        print(f'{key}: {changed} fg values updated')
        return f'"{key}": [{new_body}\n  ],'

    new_text = BLOCK_RE.sub(block_repl, text)

    with open(FIELDS_PATH, 'w', encoding='utf-8') as fh:
        fh.write(new_text)

    print(f'total: {total_changed} fg values updated')


if __name__ == '__main__':
    main()
