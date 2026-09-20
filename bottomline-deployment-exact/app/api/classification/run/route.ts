// ============================================================
//  POST /api/classification/run
//  Accepts the real Alteryx Pricing Output file (File 6 shape,
//  multipart/form-data, field name "file"), runs it through the
//  real Python classification engine (engine/steps/step5_classify.py)
//  and returns real metrics/checks/overrides + a preview table.
//  No mock data — every number here comes from the uploaded file.
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { mkdtemp, writeFile, rm, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { runPythonEngine } from '@/lib/engine';
import { readWorkbookAsTable } from '@/backend/readWorkbookAsTable';
import { getSourceFiles } from '@/lib/sourceFiles';
import { CheckResult, Metric } from '@/lib/runData';

export const runtime = 'nodejs';

interface Step5Result {
  status: string;
  metrics: Metric[];
  checks: CheckResult[];
  overrides: { vendor: string; segmentBefore: string; segmentAfter: string; reason: string }[];
  outputPath: string;
}

export async function POST(req: NextRequest) {
  // No upload means "use the file already attached to this deal" — the pricing
  // output the previous step produced, which is where it comes from in real life.
  const dealId = new URL(req.url).searchParams.get('deal');
  let buffer: Buffer;

  if (dealId) {
    const src = getSourceFiles(dealId);
    if (!src) {
      return NextResponse.json({ error: `Unknown deal "${dealId}".` }, { status: 404 });
    }
    if (!existsSync(src.pricingOutput)) {
      return NextResponse.json(
        { error: `The pricing output for this deal is not on disk: ${path.basename(src.pricingOutput)}` },
        { status: 404 },
      );
    }
    buffer = await readFile(src.pricingOutput);
  } else {
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }
    buffer = Buffer.from(await file.arrayBuffer());
  }

  const dir = await mkdtemp(path.join(tmpdir(), 'dealos-step5-'));
  const inPath = path.join(dir, 'in.xlsx');
  const outPath = path.join(dir, 'out.xlsx');

  try {
    await writeFile(inPath, buffer);

    const result = await runPythonEngine<Step5Result>('steps/step5_classify.py', [
      '--in',
      inPath,
      '--out',
      outPath,
    ]);

    const live = readWorkbookAsTable(outPath, 'Segment (Original)');
    const table = {
      headers: live.headers,
      rows: live.rows.slice(0, 60),
      totalRows: live.totalRows,
      changedColumns: result.overrides.length ? ['Segment'] : [],
      diffNote: `${result.overrides.length} of ${live.totalRows} vendors had their Segment changed by the industry override rules — those rows are listed first.`,
      columnStats: live.columnStats,
    };

    return NextResponse.json({
      metrics: result.metrics,
      checks: result.checks,
      overrides: result.overrides,
      table,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Classification engine failed.' },
      { status: 400 },
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
