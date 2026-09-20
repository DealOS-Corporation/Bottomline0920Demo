// ============================================================
//  GET /api/intake/attached?deal=<dealId>
//  The bank's file arrived with the request, so it is already sitting
//  on the deal — the analyst should not have to go find and re-upload
//  it. This reads that real file off disk and runs it through exactly
//  the same parse + validate path as a manual upload.
// ============================================================
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { parseVendorFile } from '@/backend/parseVendorFile';
import { validateIntake } from '@/backend/validateIntake';
import { getSourceFiles } from '@/lib/sourceFiles';
import { sourceForDeal } from '@/lib/dealSources';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const dealId = new URL(request.url).searchParams.get('deal') ?? '';
  const src = getSourceFiles(dealId);
  const provenance = sourceForDeal(dealId);

  if (!src || !provenance) {
    return NextResponse.json({ error: `Unknown deal "${dealId}".` }, { status: 404 });
  }
  if (!existsSync(src.vendorFile)) {
    return NextResponse.json(
      { error: `The vendor file for this deal is not on disk: ${path.basename(src.vendorFile)}` },
      { status: 404 },
    );
  }

  try {
    const buffer = await readFile(src.vendorFile);
    const sheet = parseVendorFile(
      buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer,
    );
    if (sheet.headers.length === 0) {
      return NextResponse.json({ error: 'Could not read any rows from the attached file.' }, { status: 400 });
    }
    const result = validateIntake(sheet);
    return NextResponse.json({
      ...result,
      fileName: path.basename(src.vendorFile),
      attachment: provenance.email.attachment,
      receivedFrom: provenance.email.from,
      receivedAt: provenance.email.receivedAt,
    });
  } catch {
    return NextResponse.json({ error: 'The attached file could not be parsed.' }, { status: 400 });
  }
}
