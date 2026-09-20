'use client';

import { Download, Eye, FileSpreadsheet, Presentation, Braces, Mail } from 'lucide-react';
import { pipeline, StageStatus, StageOutput, ENGINE_LABEL } from '@/lib/pipeline';

const icon = {
  xlsx: <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />,
  pptx: <Presentation className="h-3.5 w-3.5 text-orange-500" />,
  json: <Braces className="h-3.5 w-3.5 text-sky-600" />,
  eml: <Mail className="h-3.5 w-3.5 text-slate-500" />,
  record: <Braces className="h-3.5 w-3.5 text-sky-600" />,
};

interface Props {
  statuses: Record<string, StageStatus>;
  selected: string | null;
  onSelect: (output: StageOutput, stageId: string) => void;
  onDownload: (output: StageOutput) => void;
}

export default function ArtifactRail({ statuses, selected, onSelect, onDownload }: Props) {
  const groups = pipeline
    .filter((s) => s.outputs.length > 0)
    .map((s) => ({
      stage: s,
      available: statuses[s.id] === 'done' || statuses[s.id] === 'needs-review',
    }))
    .filter((g) => g.available);

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
        Artifacts
      </div>

      {groups.length === 0 ? (
        <div className="px-3 py-6 text-center text-[11.5px] text-slate-400">
          Output files appear here as steps complete.
        </div>
      ) : (
        <div className="max-h-[280px] overflow-y-auto">
          {groups.map(({ stage }) => (
            <div key={stage.id}>
              <div className="sticky top-0 bg-slate-50 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {stage.short}
              </div>
              {stage.outputs.map((o) => (
                <div
                  key={o.filename}
                  className={`group flex items-center gap-2 border-b border-slate-50 px-3 py-1.5 ${
                    selected === o.filename ? 'bg-slate-100' : 'hover:bg-slate-50'
                  }`}
                >
                  {icon[o.kind]}
                  <button
                    onClick={() => onSelect(o, stage.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="truncate text-[11.5px] font-medium text-slate-700">
                      {o.filename}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {o.ref !== '—' ? `${o.ref} · ` : ''}
                      {ENGINE_LABEL[o.producedBy]}
                    </div>
                  </button>
                  <button
                    onClick={() => onSelect(o, stage.id)}
                    title="Preview"
                    className="rounded p-1 text-slate-400 opacity-0 transition-opacity hover:bg-slate-200 hover:text-slate-700 group-hover:opacity-100"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDownload(o)}
                    title="Download"
                    className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
