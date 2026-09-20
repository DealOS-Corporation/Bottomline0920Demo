"""One-off patch: add a real `bold` flag to every entry in lib/deckFields.ts,
read directly from the generated .pptx's run-level font formatting (not
guessed from pixels) — this is what actually differs between a highlighted
"total" row (bold) and a plain data row (regular weight) using the same
font size, and is what the editable-figure overlay needs to match so an
edited figure isn't rendered heavier/lighter than its neighbours.

Usage: python scripts/fix_deck_field_bold.py
"""

import json
import os
import re

from pptx import Presentation

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIELDS_PATH = os.path.join(ROOT, 'lib', 'deckFields.ts')

DECKS = {
    'jpm': os.path.join(os.environ['TEMP'], 'dealos-artifacts', 'deck-deal-001-53933380132817b8', 'deck.pptx'),
    'illume': os.path.join(os.environ['TEMP'], 'illume_deck.pptx'),
}

ENTRY_RE = re.compile(r'\{[^{}]*\}')
BLOCK_RE = re.compile(r'"(\w+)":\s*\[(.*?)\n  \],', re.DOTALL)


def bold_map_for(pptx_path):
    """key (slide:shape:row:col) -> bool, from the cell's first text run."""
    prs = Presentation(pptx_path)
    out = {}
    for n, slide in enumerate(prs.slides, start=1):
        for shape_idx, shp in enumerate(slide.shapes):
            if not shp.has_table:
                continue
            table = shp.table
            for ri, row in enumerate(table.rows):
                for ci, cell in enumerate(row.cells):
                    bold = False
                    for para in cell.text_frame.paragraphs:
                        for run in para.runs:
                            if run.font.bold:
                                bold = True
                    out[f'{n}:{shape_idx}:{ri}:{ci}'] = bold
    return out


def patch_block(bmap, body):
    changed = 0
    def repl(m):
        nonlocal changed
        f = json.loads(m.group(0))
        if f['key'] in bmap:
            f['bold'] = bmap[f['key']]
            changed += 1
        else:
            f.setdefault('bold', False)
        return json.dumps(f)
    return ENTRY_RE.sub(repl, body), changed


def main():
    with open(FIELDS_PATH, 'r', encoding='utf-8') as fh:
        text = fh.read()

    maps = {key: bold_map_for(path) for key, path in DECKS.items() if os.path.exists(path)}

    total_changed = 0
    def block_repl(m):
        nonlocal total_changed
        key, body = m.group(1), m.group(2)
        new_body, changed = patch_block(maps.get(key, {}), body)
        total_changed += changed
        print(f'{key}: {changed} bold flags set')
        return f'"{key}": [{new_body}\n  ],'

    new_text = BLOCK_RE.sub(block_repl, text)
    new_text = new_text.replace(
        '  bg: string;\n  fg: string;\n}',
        '  bg: string;\n  fg: string;\n  bold: boolean;\n}',
    )

    with open(FIELDS_PATH, 'w', encoding='utf-8') as fh:
        fh.write(new_text)

    print(f'total: {total_changed} bold flags set')


if __name__ == '__main__':
    main()
