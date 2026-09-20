// ============================================================
//  GET /api/generate/email?draft=external|internal&mode=open|download
//  Builds the real .eml (real attachments embedded) and either
//  streams it for the browser to download, or — since this dev
//  server and the analyst's mail client run on the same machine —
//  writes it to a temp file and shells out to open it with the OS
//  default handler, so it pops up already composed and attached.
// ============================================================
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { execFile } from 'child_process';
import { tmpdir } from 'os';
import path from 'path';
import { getDraft } from '@/lib/emailDrafts';
import { buildEml } from '@/lib/emlBuilder';
import { DEAL_IDS } from '@/lib/deals';

export const runtime = 'nodejs';
export const maxDuration = 180;

function openWithDefaultApp(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // cmd's internal `start` needs an (empty) window-title arg before the path.
    execFile('cmd.exe', ['/c', 'start', '""', filePath], (err) => (err ? reject(err) : resolve()));
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dealId = searchParams.get('deal') ?? DEAL_IDS.jpm;
  const draft = getDraft(dealId, searchParams.get('draft') ?? '');
  const mode = searchParams.get('mode') ?? 'download';

  if (!draft) {
    return NextResponse.json({ error: 'Unknown draft id.' }, { status: 400 });
  }

  try {
    const { buffer, attachmentCount, attachmentBytes } = await buildEml(draft, dealId);
    const filename = `${draft.subject.replace(/[\\/:*?"<>|]/g, '')}.eml`;

    if (mode === 'open') {
      const dir = path.join(tmpdir(), 'dealos-sendback');
      await mkdir(dir, { recursive: true });
      const filePath = path.join(dir, filename);
      await writeFile(filePath, buffer);
      await openWithDefaultApp(filePath);
      return NextResponse.json({ opened: true, attachmentCount, attachmentBytes });
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'message/rfc822',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Attachment-Count': String(attachmentCount),
        'X-Attachment-Bytes': String(attachmentBytes),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Email draft failed.' },
      { status: 500 },
    );
  }
}
