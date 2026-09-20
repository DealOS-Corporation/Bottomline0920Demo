// ============================================================
//  GET /api/generate/workbook?file=8|9
//  Rebuilds the internal value statement (File 8) and the client
//  ROI analysis (File 9) from the reviewed pricing output by driving
//  the bank's own Excel models through COM, then returns the real
//  .xlsx bytes.
// ============================================================
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { buildWorkbooks } from '@/lib/artifacts';
import { getSourceFiles } from '@/lib/sourceFiles';
import { DEAL_IDS } from '@/lib/deals';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const which = params.get('file') ?? '8';
  const dealId = params.get('deal') ?? DEAL_IDS.jpm;

  if (which !== '8' && which !== '9') {
    return NextResponse.json({ error: 'file must be 8 or 9' }, { status: 400 });
  }

  const src = getSourceFiles(dealId);
  if (!src) {
    return NextResponse.json({ error: `Unknown deal "${dealId}".` }, { status: 404 });
  }

  const target =
    which === '8'
      ? { name: 'file8.xlsx', download: src.deliveredValueStatementName }
      : { name: 'file9.xlsx', download: src.deliveredRoiWorkbookName };

  try {
    const { dir, result } = await buildWorkbooks(dealId);
    const bytes = await readFile(path.join(dir, target.name));

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${target.download}"`,
        'Content-Length': String(bytes.length),
        'X-Vendor-Rows': String(result.vendorRows),
        'X-Cells-Pasted': String(result.cellsPasted),
        'X-Overrides': String(result.overrides),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Workbook generation failed.' },
      { status: 500 },
    );
  }
}
