// ============================================================
//  GET /api/generate/vendor-list
//  Serves the real day-one target vendor list that ships to the
//  bank alongside the deck. Not model output — a straight file read.
// ============================================================
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getSourceFiles } from '@/lib/sourceFiles';
import { DEAL_IDS } from '@/lib/deals';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const dealId = new URL(request.url).searchParams.get('deal') ?? DEAL_IDS.jpm;
  const src = getSourceFiles(dealId);

  if (!src) {
    return NextResponse.json({ error: `Unknown deal "${dealId}".` }, { status: 404 });
  }
  if (!src.top25VendorList) {
    return NextResponse.json(
      { error: 'This deal has no day-one target vendor list.' },
      { status: 409 },
    );
  }
  if (!existsSync(src.top25VendorList)) {
    return NextResponse.json(
      { error: `Source file not found: ${src.top25VendorList}` },
      { status: 500 },
    );
  }

  const bytes = await readFile(src.top25VendorList);
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${path.basename(src.top25VendorList)}"`,
      'Content-Length': String(bytes.length),
    },
  });
}
