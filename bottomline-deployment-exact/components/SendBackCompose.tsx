'use client';

// ============================================================
//  Send-back compose window.
//  Sits between the ROI deck and the Salesforce sync: the analyst
//  reviews the drafted note plus the package, then punches out to
//  their mail client with everything already attached.
// ============================================================
import { useState } from 'react';
import { FileSpreadsheet, Presentation, Mail, Loader2, Check } from 'lucide-react';
import { draftsForDeal, EmailDraft, attachmentRoute, mailtoHref } from '@/lib/emailDrafts';

type SendState = 'idle' | 'sending' | 'done' | 'error';

function bytes(n: number) {
  return n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.round(n / 1e3)} KB`;
}

/** Downloads a real generated file so it lands in the user's Downloads folder. */
async function downloadAttachment(route: string, filename: string) {
  const res = await fetch(route);
  if (!res.ok) throw new Error((await res.json()).error ?? `Could not build ${filename}.`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function Recipients({ label, list }: { label: string; list: string[] }) {
  return (
    <div className="flex gap-2 border-b border-slate-100 px-3 py-1.5">
      <span className="w-8 shrink-0 pt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <div className="flex flex-wrap gap-1">
        {list.map((addr) => (
          <span
            key={addr}
            className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-700"
          >
            {addr}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SendBackCompose({ dealId }: { dealId: string }) {
  const [activeId, setActiveId] = useState<EmailDraft['id']>('external');
  const [state, setState] = useState<SendState>('idle');
  const [note, setNote] = useState('');

  const drafts = draftsForDeal(dealId);
  const draft = drafts.find((d) => d.id === activeId) ?? drafts[0];

  if (!draft) {
    return (
      <div className="flex h-full items-center justify-center px-8 text-center text-[12px] text-slate-400">
        No sent email on file for this deal.
      </div>
    );
  }

  // Fallback used only if the server can't open the draft itself (e.g. no
  // .eml handler registered on this machine): pop a plain mailto compose and
  // hand the real files over as separate downloads to drag in.
  const fallbackToMailto = async () => {
    window.open(mailtoHref(draft), '_self');
    setNote('Mail client opened — pulling the real files into your Downloads folder…');
    for (let i = 0; i < draft.attachments.length; i += 1) {
      const a = draft.attachments[i];
      if (i > 0) await delay(400); // stagger so the browser doesn't block multi-file downloads
      await downloadAttachment(attachmentRoute(a.source, dealId), a.filename);
    }
    setState('done');
    setNote(
      `${draft.attachments.length} file(s) saved to Downloads — drag them into the compose window to attach.`,
    );
  };

  const punchOut = () => {
    setState('sending');
    setNote('Building the draft with the real files embedded…');

    (async () => {
      try {
        const res = await fetch(`/api/generate/email?draft=${draft.id}&deal=${encodeURIComponent(dealId)}&mode=open`);
        if (!res.ok) throw new Error((await res.json()).error ?? 'Could not open the draft.');
        const { attachmentCount } = await res.json();
        setState('done');
        setNote(`Opened as an editable draft with ${attachmentCount} file(s) already attached. Check Outlook's Drafts folder.`);
      } catch (err) {
        try {
          await fallbackToMailto();
        } catch (fallbackErr) {
          setState('error');
          setNote(fallbackErr instanceof Error ? fallbackErr.message : 'Could not build the attachments.');
        }
      }
    })();
  };


  return (
    <div className="flex h-full min-h-0 bg-white">
      {/* Package side rail */}
      <div className="flex w-[230px] shrink-0 flex-col border-r border-slate-200 bg-slate-50">
        <div className="border-b border-slate-200 px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Attached package
          </div>
        </div>
        <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2">
          {draft.attachments.map((a) => {
            const Icon = a.filename.endsWith('.pptx') ? Presentation : FileSpreadsheet;
            return (
              <div
                key={a.filename}
                className="flex gap-2 rounded-md border border-slate-200 bg-white p-2"
              >
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <div className="break-words text-[11px] font-medium leading-snug text-slate-700">
                    {a.filename}
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-slate-400">
                    {a.ref} · {bytes(a.approxBytes)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="border-t border-slate-200 px-3 py-2 text-[10.5px] leading-snug text-slate-400">
          Attachments are the generated files, not copies of the templates.
        </div>
      </div>

      {/* Draft */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-1 border-b border-slate-200 px-2 py-1.5">
          {drafts.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setActiveId(d.id);
                setState('idle');
                setNote('');
              }}
              className={`rounded px-2 py-1 text-[11.5px] font-medium transition-colors ${
                d.id === activeId
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {d.label}
            </button>
          ))}
          <span className="ml-1 text-[11px] text-slate-400">{draft.audience}</span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Recipients label="To" list={draft.to} />
          <Recipients label="Cc" list={draft.cc} />
          <div className="flex gap-2 border-b border-slate-100 px-3 py-1.5">
            <span className="w-8 shrink-0 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Subj
            </span>
            <span className="text-[12px] font-medium text-slate-800">{draft.subject}</span>
          </div>
          <pre className="whitespace-pre-wrap px-3 py-3 font-sans text-[12px] leading-relaxed text-slate-700">
            {draft.body}
          </pre>
        </div>

        <div className="flex shrink-0 items-center gap-3 border-t border-slate-200 px-3 py-2">
          <button
            onClick={punchOut}
            disabled={state === 'sending'}
            className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-[11.5px] font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {state === 'sending' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : state === 'done' ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Mail className="h-3.5 w-3.5" />
            )}
            Punch out to email
          </button>
          <span
            className={`min-w-0 flex-1 truncate text-[11px] ${
              state === 'error' ? 'text-rose-600' : 'text-slate-500'
            }`}
          >
            {note || 'Opens your mail client with recipients, subject and body filled in, and saves the real files to attach.'}
          </span>
        </div>
      </div>
    </div>
  );
}
