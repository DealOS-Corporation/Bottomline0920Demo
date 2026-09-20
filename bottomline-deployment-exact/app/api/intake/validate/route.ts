// ============================================================
//  POST /api/intake/validate
//  Accepts the real vendor payment file (multipart/form-data,
//  field name "file") and runs it through the backend/ business
//  logic — real column presence + fill-rate checks, no mock data.
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { parseVendorFile } from '@/backend/parseVendorFile';
import { validateIntake } from '@/backend/validateIntake';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();

  try {
    const sheet = parseVendorFile(buffer);
    if (sheet.headers.length === 0) {
      return NextResponse.json({ error: 'Could not read any rows from this file.' }, { status: 400 });
    }
    const result = validateIntake(sheet);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'This file could not be parsed as .xlsx/.xls/.csv.' }, { status: 400 });
  }
}
