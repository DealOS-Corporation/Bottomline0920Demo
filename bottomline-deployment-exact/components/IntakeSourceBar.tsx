'use client';

// ============================================================
//  "Start a pricing analysis from …" — the intake bar on the deal list.
//  The bank's request can arrive four ways; each one resolves to a real
//  deal in the queue rather than creating an empty shell.
// ============================================================

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Paperclip, Search, Upload } from 'lucide-react';

import { DEAL_SOURCES, resolveSalesforceRef, type IntakeChannel } from '@/lib/dealSources';

/** Brand marks live in public/logos — the real ones, not icon-font stand-ins. */
function Logo({ src, alt, className = 'h-4 w-4' }: { src: string; alt: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`${className} shrink-0 object-contain`} />;
}

const SOURCES: {
  id: IntakeChannel;
  label: string;
  description: string;
  mark: React.ReactNode;
}[] = [
  {
    id: 'upload',
    label: 'Upload a file',
    description: 'Drop the vendor file straight in',
    mark: <Upload className="h-3.5 w-3.5 shrink-0 text-slate-500" />,
  },
  {
    id: 'salesforce',
    label: 'Salesforce',
    description: 'Pull by pricing record or opportunity ID',
    mark: <Logo src="/logos/salesforce.png" alt="Salesforce" className="h-4 w-4" />,
  },
  {
    id: 'email',
    label: 'Email',
    description: 'Pick up the bank’s request and its attachment',
    mark: (
      <span className="flex shrink-0 items-center gap-1">
        <Logo src="/logos/gmail.png" alt="Gmail" className="h-3.5 w-3.5" />
        <Logo src="/logos/outlook.png" alt="Outlook" className="h-3.5 w-3.5" />
      </span>
    ),
  },
  {
    id: 'teams',
    label: 'Teams',
    description: 'Pull a file shared in the channel',
    mark: <Logo src="/logos/teams.png" alt="Microsoft Teams" className="h-3.5 w-3.5" />,
  },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function fmtBytes(n: number) {
  return n >= 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.round(n / 1e3)} KB`;
}

export default function IntakeSourceBar() {
  const router = useRouter();
  const [open, setOpen] = useState<IntakeChannel | null>(null);
  const [sfRef, setSfRef] = useState('');
  const [sfError, setSfError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<
    { status: 'idle' } | { status: 'checking'; name: string } | { status: 'done'; name: string; rows: string; usable: boolean } | { status: 'error'; message: string }
  >({ status: 'idle' });
  const fileRef = useRef<HTMLInputElement>(null);

  const toggle = (id: IntakeChannel) => {
    setSfError(null);
    setOpen((cur) => (cur === id ? null : id));
    if (id === 'upload') fileRef.current?.click();
  };

  const pullFromSalesforce = () => {
    const hit = resolveSalesforceRef(sfRef);
    if (!hit) {
      setSfError('No pricing record with that ID. Try one of the IDs listed below.');
      return;
    }
    router.push(`/deals/${hit.dealId}`);
  };

  const checkUpload = async (file: File) => {
    setOpen('upload');
    setUploadState({ status: 'checking', name: file.name });
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/intake/validate', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) {
        setUploadState({ status: 'error', message: json.error ?? 'Could not read this file.' });
        return;
      }
      const rows = json.metrics?.[0]?.value ?? '—';
      setUploadState({ status: 'done', name: file.name, rows, usable: json.usable });
    } catch {
      setUploadState({ status: 'error', message: 'Could not reach the validation backend.' });
    }
  };

  return (
    <div className="rounded-md border border-slate-200 bg-white">
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void checkUpload(f);
          e.target.value = '';
        }}
      />

      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <div className="mr-1">
          <div className="text-[13px] font-semibold text-slate-900">Start a pricing analysis from</div>
          <div className="text-[11px] text-slate-500">
            However the bank sends it, the file lands on the deal ready to run.
          </div>
        </div>
        <div className="flex-1" />
        {SOURCES.map(({ id, label, description, mark }) => (
          <button
            key={id}
            onClick={() => toggle(id)}
            title={description}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors ${
              open === id
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {mark}
            {label}
          </button>
        ))}
      </div>

      {open && (
        <div className="border-t border-slate-100 px-4 py-3.5">
          {open === 'salesforce' && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={sfRef}
                    onChange={(e) => {
                      setSfRef(e.target.value);
                      setSfError(null);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && pullFromSalesforce()}
                    placeholder="Pricing record ID, opportunity ID, or record URL"
                    className="w-full rounded-md border border-slate-200 py-2 pl-8 pr-3 text-[12px] outline-none focus:border-slate-400"
                  />
                </div>
                <button
                  onClick={pullFromSalesforce}
                  className="rounded-md bg-slate-900 px-3 py-2 text-[12px] font-semibold text-white hover:bg-slate-700"
                >
                  Pull
                </button>
              </div>
              {sfError && <div className="text-[11px] text-rose-600">{sfError}</div>}
              <div className="flex flex-wrap gap-1.5">
                {DEAL_SOURCES.map((s) => (
                  <button
                    key={s.dealId}
                    onClick={() => setSfRef(s.salesforceRecordId)}
                    className="rounded border border-slate-200 px-2 py-1 font-mono text-[10.5px] text-slate-500 hover:bg-slate-50"
                  >
                    {s.salesforceRecordId}
                    <span className="ml-1.5 font-sans text-slate-400">{s.client}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {open === 'email' && (
            <div className="space-y-1.5">
              {DEAL_SOURCES.map((s) => (
                <button
                  key={s.dealId}
                  onClick={() => router.push(`/deals/${s.dealId}`)}
                  className="flex w-full items-start gap-2.5 rounded-md border border-slate-200 px-3 py-2.5 text-left hover:border-slate-300 hover:bg-slate-50"
                >
                  <Logo src="/logos/outlook.png" alt="Outlook" className="mt-0.5 h-4 w-4" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-semibold text-slate-900">
                      {s.email.subject}
                    </span>
                    <span className="block truncate text-[11px] text-slate-500">
                      {s.email.fromName} &lt;{s.email.from}&gt; · {fmtDate(s.email.receivedAt)}
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-[10.5px] text-slate-400">
                      <Paperclip className="h-3 w-3 shrink-0" />
                      <span className="truncate">{s.email.attachment}</span>
                      <span className="shrink-0">· {fmtBytes(s.email.attachmentBytes)}</span>
                    </span>
                  </span>
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                </button>
              ))}
            </div>
          )}

          {open === 'upload' && (
            <div className="space-y-2">
              {uploadState.status === 'idle' && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full items-center gap-2 rounded-md border border-dashed border-slate-300 px-3 py-3 text-left hover:border-slate-400 hover:bg-slate-50"
                >
                  <Upload className="h-4 w-4 text-slate-400" />
                  <span className="text-[12px] font-medium text-slate-600">
                    Choose a vendor payment file (.xlsx, .xls, .csv)
                  </span>
                </button>
              )}
              {uploadState.status === 'checking' && (
                <div className="flex items-center gap-2 text-[12px] text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Reading {uploadState.name} on the backend…
                </div>
              )}
              {uploadState.status === 'error' && (
                <div className="text-[12px] text-rose-600">{uploadState.message}</div>
              )}
              {uploadState.status === 'done' && (
                <div className="space-y-2">
                  <div className="text-[12px] text-slate-700">
                    <span className="font-semibold">{uploadState.name}</span> — {uploadState.rows} rows,{' '}
                    {uploadState.usable ? 'usable' : 'not usable as-is'}.
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Checked with the same rules step 1 uses. Open the deal this file belongs to and it is
                    already attached there.
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[11.5px] font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Check another file
                  </button>
                </div>
              )}
            </div>
          )}

          {open === 'teams' && (
            <div className="text-[12px] leading-relaxed text-slate-500">
              No Teams workspace is connected in this environment, so there is nothing real to pull. The
              three deals below all arrived by email — use that source to see the real hand-off.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
