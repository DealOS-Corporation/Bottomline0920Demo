"""Locate every editable figure in a generated deck and emit lib/deckFields.ts.

For each table cell that holds a number we record its box as a fraction of the
slide, plus the cell's background/text colour sampled from the rendered PNG, so
the web preview can lay a real input box exactly over the printed figure.

Usage:
    python deck_fields.py --deck jpm=<generated.pptx>:<png dir> ... --out lib/deckFields.ts
"""

import argparse
import json
import os
import re
from collections import Counter

from PIL import Image
from pptx import Presentation

HAS_DIGIT = re.compile(r'\d')


def cell_boxes(slide, slide_w, slide_h):
    """Yield (row, col, text, x, y, w, h) in slide fractions for every table cell."""
    for shape_idx, shp in enumerate(slide.shapes):
        if not shp.has_table:
            continue
        table = shp.table
        col_w = [c.width for c in table.columns]
        row_h = [r.height for r in table.rows]
        # Stored row heights are minimums; scale them to the frame's real height
        # so tall wrapped rows don't push every later row out of alignment.
        total_h = sum(row_h) or 1
        scale = (shp.height / total_h) if shp.height else 1.0

        y = shp.top
        for ri, row in enumerate(table.rows):
            x = shp.left
            h = row_h[ri] * scale
            for ci, cell in enumerate(row.cells):
                w = col_w[ci]
                text = cell.text.replace('\n', ' ').replace('\x0b', ' ').strip()
                bold = any(
                    run.font.bold
                    for para in cell.text_frame.paragraphs
                    for run in para.runs
                )
                sizes = [
                    run.font.size.emu
                    for para in cell.text_frame.paragraphs
                    for run in para.runs
                    if run.font.size
                ]
                # Fraction of the slide's own height — used to scale the
                # overlay input's font size, since a single 14pt line is far
                # smaller than the row's own box height.
                font_frac = round(max(sizes) / slide_h, 5) if sizes else 0.022
                yield {
                    'shape': shape_idx,
                    'row': ri,
                    'col': ci,
                    'text': text,
                    'bold': bold,
                    'fontFrac': font_frac,
                    'x': x / slide_w,
                    'y': y / slide_h,
                    'w': w / slide_w,
                    'h': h / slide_h,
                }
                x += w
            y += h


def sample_colors(img, box):
    """Modal fill colour inside the box, and the modal colour of whatever
    glyph pixels differ enough from that fill — the *actual* printed text
    colour, not a black/white guess from background luminance."""
    W, H = img.size
    x0 = max(0, int(box['x'] * W) + 2)
    y0 = max(0, int(box['y'] * H) + 2)
    x1 = min(W, int((box['x'] + box['w']) * W) - 2)
    y1 = min(H, int((box['y'] + box['h']) * H) - 2)
    if x1 <= x0 or y1 <= y0:
        return '#ffffff', '#333333'
    region = img.crop((x0, y0, x1, y1)).convert('RGB')
    pixels = list(region.getdata())
    counts = Counter(pixels)
    (br, bg_, bb), _ = counts.most_common(1)[0]
    bg_hex = f'#{br:02x}{bg_:02x}{bb:02x}'
    fg_pixels = [px for px in pixels if sum(abs(a - b) for a, b in zip(px, (br, bg_, bb))) > 60]
    if len(fg_pixels) >= 4:
        (r, g, b), _ = Counter(fg_pixels).most_common(1)[0]
        return bg_hex, f'#{r:02x}{g:02x}{b:02x}'
    lum = (0.299 * br + 0.587 * bg_ + 0.114 * bb) / 255
    return bg_hex, ('#1a1a1a' if lum > 0.55 else '#ffffff')


def fields_for(pptx_path, png_dir):
    prs = Presentation(pptx_path)
    sw, sh = prs.slide_width, prs.slide_height
    out = []
    for n, slide in enumerate(prs.slides, start=1):
        png = os.path.join(png_dir, f'slide-{n:02d}.png')
        img = Image.open(png) if os.path.exists(png) else None
        for box in cell_boxes(slide, sw, sh):
            if not HAS_DIGIT.search(box['text']):
                continue
            bg, fg = sample_colors(img, box) if img else ('#ffffff', '#333333')
            out.append({
                'slide': n,
                'key': f"{n}:{box['shape']}:{box['row']}:{box['col']}",
                'row': box['row'],
                'col': box['col'],
                'text': box['text'],
                'x': round(box['x'], 5),
                'y': round(box['y'], 5),
                'w': round(box['w'], 5),
                'h': round(box['h'], 5),
                'bg': bg,
                'fg': fg,
                'bold': box['bold'],
                'fontFrac': box['fontFrac'],
            })
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--deck', action='append', required=True,
                    help='key=<generated.pptx>::<png dir>')
    ap.add_argument('--out', required=True)
    args = ap.parse_args()

    decks = {}
    for spec in args.deck:
        key, _, rest = spec.partition('=')
        pptx_path, _, png_dir = rest.partition('::')
        decks[key] = fields_for(pptx_path, png_dir)

    blocks = []
    for key, fields in decks.items():
        rows = ',\n'.join('    ' + json.dumps(f) for f in fields)
        blocks.append(f'  {json.dumps(key)}: [\n{rows},\n  ],')

    with open(args.out, 'w', encoding='utf-8') as fh:
        fh.write(
            '// GENERATED by scripts/render-deck-slides-all.ps1 — do not edit by hand.\n'
            '// One entry per numeric table cell in the generated deck: where the figure\n'
            '// sits on the slide (as a fraction) and what colour it is printed on, so the\n'
            '// preview can lay an editable input exactly over it.\n\n'
            'export interface DeckField {\n'
            '  slide: number;\n'
            '  /** Stable id: slide:shape:row:col — also the key used when saving edits. */\n'
            '  key: string;\n'
            '  row: number;\n'
            '  col: number;\n'
            '  text: string;\n'
            '  x: number;\n'
            '  y: number;\n'
            '  w: number;\n'
            '  h: number;\n'
            '  bg: string;\n'
            '  fg: string;\n'
            '  bold: boolean;\n'
            "  /** Font size as a fraction of the slide's own height. */\n"
            '  fontFrac: number;\n'
            '}\n\n'
            'export const deckFieldsByDeck: Record<string, DeckField[]> = {\n'
            + '\n'.join(blocks)
            + '\n};\n\n'
            '/** Editable figures on one slide of one deck. */\n'
            'export function deckFieldsFor(deckMap: string | undefined, slide: number): DeckField[] {\n'
            '  if (!deckMap) return [];\n'
            '  return (deckFieldsByDeck[deckMap] ?? []).filter((f) => f.slide === slide);\n'
            '}\n'
        )
    print(json.dumps({k: len(v) for k, v in decks.items()}))


if __name__ == '__main__':
    main()
