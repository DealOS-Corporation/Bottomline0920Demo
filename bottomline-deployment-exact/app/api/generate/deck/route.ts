// ============================================================
//  GET  /api/generate/deck?deal=<id>
//  POST /api/generate/deck?deal=<id>   body: { edits: { "slide:shape:row:col": "text" } }
//  Produces the client-facing ROI deck by copying the bank's REAL
//  PowerPoint template and overwriting only the values that are
//  deal-specific. Returns the actual .pptx bytes — this is the same
//  file an analyst would hand to the client, not a preview.
//  POST additionally applies figures the analyst typed over in the preview.
// ============================================================
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { buildDeckWithEdits } from '@/lib/artifacts';
import { getSourceFiles } from '@/lib/sourceFiles';
import { DEAL_IDS } from '@/lib/deals';

export const runtime = 'nodejs';
export const maxDuration = 120;

async function respond(dealId: string, edits: Record<string, string>) {
  const src = getSourceFiles(dealId);

  if (!src) {
    return NextResponse.json({ error: `Unknown deal "${dealId}".` }, { status: 404 });
  }
  if (!src.deckTemplate) {
    return NextResponse.json(
      { error: 'This deal produced no ROI deck, so there is nothing to generate.' },
      { status: 409 },
    );
  }
  if (!src.deckSlideMap) {
    return NextResponse.json(
      {
        error:
          'The ROI deck for this deal has a different slide layout to the one the deck ' +
          'engine is mapped for. Generating it now would write figures into the wrong ' +
          'places, so it is disabled until the slide map is derived.',
      },
      { status: 409 },
    );
  }

  try {
    const { file, result, editCount } = await buildDeckWithEdits(dealId, edits);
    const bytes = await readFile(file);

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${src.deliveredDeckName}"`,
        'Content-Length': String(bytes.length),
        'X-Slide-Count': String(result.slideCount),
        'X-Values-Written': String(result.valuesWritten),
        'X-Edits-Applied': String(editCount),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Deck generation failed.' },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const dealId = new URL(request.url).searchParams.get('deal') ?? DEAL_IDS.jpm;
  return respond(dealId, {});
}

export async function POST(request: Request) {
  const dealId = new URL(request.url).searchParams.get('deal') ?? DEAL_IDS.jpm;
  let edits: Record<string, string> = {};
  try {
    const body = await request.json();
    if (body && typeof body.edits === 'object' && body.edits) edits = body.edits;
  } catch {
    // No/!JSON body — treat as an unedited generate.
  }
  return respond(dealId, edits);
}
