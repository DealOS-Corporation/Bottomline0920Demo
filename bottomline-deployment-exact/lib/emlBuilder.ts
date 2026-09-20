// ============================================================
//  Builds the send-back reply as a real MIME message (.eml) with
//  the actual generated files embedded as base64 attachments.
//  X-Unsent: 1 makes Outlook open it as an editable, ready-to-send
//  draft (with a Send button) instead of a received message.
// ============================================================
import { readFile } from 'fs/promises';
import { buildDeck, buildWorkbooks } from '@/lib/artifacts';
import { getSourceFiles } from '@/lib/sourceFiles';
import { EmailDraft, AttachmentSource, DraftAttachment } from '@/lib/emailDrafts';

const CONTENT_TYPES: Record<string, string> = {
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

function contentTypeFor(filename: string): string {
  const ext = filename.slice(filename.lastIndexOf('.'));
  return CONTENT_TYPES[ext] ?? 'application/octet-stream';
}

async function attachmentBytes(source: AttachmentSource, dealId: string): Promise<Buffer> {
  switch (source) {
    case 'deck': {
      const { file } = await buildDeck(dealId);
      return readFile(file);
    }
    case 'file8': {
      const { dir } = await buildWorkbooks(dealId);
      return readFile(`${dir}/file8.xlsx`);
    }
    case 'file9': {
      const { dir } = await buildWorkbooks(dealId);
      return readFile(`${dir}/file9.xlsx`);
    }
    case 'top25': {
      const list = getSourceFiles(dealId)?.top25VendorList;
      if (!list) throw new Error('This deal has no target list file.');
      return readFile(list);
    }
  }
}

function encodeHeader(value: string): string {
  return /^[\x00-\x7F]*$/.test(value) ? value : `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;
}

function base64Lines(buf: Buffer): string {
  const b64 = buf.toString('base64');
  return b64.replace(/(.{76})/g, '$1\r\n');
}

export interface BuiltEmail {
  buffer: Buffer;
  attachmentCount: number;
  attachmentBytes: number;
}

export async function buildEml(draft: EmailDraft, dealId: string): Promise<BuiltEmail> {
  const boundary = `----DealOS_${Date.now().toString(16)}`;
  const files = await Promise.all(
    draft.attachments.map(async (a: DraftAttachment) => ({
      attachment: a,
      bytes: await attachmentBytes(a.source, dealId),
    })),
  );

  const headerLines = [
    `From: ${draft.from}`,
    `To: ${draft.to.join(', ')}`,
    `Cc: ${draft.cc.join(', ')}`,
    `Subject: ${encodeHeader(draft.subject)}`,
    'MIME-Version: 1.0',
    'X-Unsent: 1',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
  ];

  const parts = [
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    draft.body,
    '',
  ];

  for (const { attachment, bytes } of files) {
    parts.push(
      `--${boundary}`,
      `Content-Type: ${contentTypeFor(attachment.filename)}; name="${attachment.filename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${attachment.filename}"`,
      '',
      base64Lines(bytes),
      '',
    );
  }
  parts.push(`--${boundary}--`, '');

  return {
    buffer: Buffer.from([...headerLines, ...parts].join('\r\n'), 'utf8'),
    attachmentCount: files.length,
    attachmentBytes: files.reduce((sum, f) => sum + f.bytes.length, 0),
  };
}
