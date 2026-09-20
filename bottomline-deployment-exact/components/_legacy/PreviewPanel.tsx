'use client';

import { Artifact } from '@/lib/mockDeals';
import { Eye, X, FileText } from 'lucide-react';

interface PreviewPanelProps {
  artifact: Artifact | null;
  isRocStep: boolean;
  rocProgress: number;
  onClose: () => void;
}

export default function PreviewPanel({ artifact, onClose }: PreviewPanelProps) {
  // No artifact selected
  if (!artifact) {
    return (
      <div className="bg-white rounded-md border border-slate-200 h-full flex flex-col">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <Eye className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-800">Preview</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Select an artifact to preview
        </div>
      </div>
    );
  }

  // Simple preview for any artifact
  return (
    <div className="bg-white rounded-md border border-slate-200 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-800">{artifact.filename}</span>
          <span className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-500 rounded-md font-medium border border-slate-200">
            {artifact.type}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-800 font-semibold mb-1">{artifact.filename}</p>
          <p className="text-slate-400 text-sm">{artifact.size}</p>
        </div>
      </div>
    </div>
  );
}
