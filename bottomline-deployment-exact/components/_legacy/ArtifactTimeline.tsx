'use client';

import { Artifact } from '@/lib/mockDeals';
import { StepSchema } from '@/lib/stepsSchema';
import { FileText, FileSpreadsheet, FileJson, File, Clock, HardDrive, Eye, Download, Filter, Mail } from 'lucide-react';

interface ArtifactTimelineProps {
  artifacts: Artifact[];
  activeStepId: string;
  steps: StepSchema[];
  onPreviewArtifact: (artifact: Artifact) => void;
  selectedArtifactId: string | null;
}

const fileIcons: Record<string, React.ReactNode> = {
  'PDF': <FileText className="w-5 h-5 text-red-500" />,
  'CSV': <FileSpreadsheet className="w-5 h-5 text-emerald-400" />,
  'Excel': <FileSpreadsheet className="w-5 h-5 text-emerald-400" />,
  'JSON': <FileJson className="w-5 h-5 text-amber-500" />,
  'Email': <Mail className="w-5 h-5 text-blue-500" />,
};

export default function ArtifactTimeline({ 
  artifacts, 
  activeStepId, 
  steps, 
  onPreviewArtifact,
  selectedArtifactId 
}: ArtifactTimelineProps) {
  // Sort artifacts: active step first, then by date descending
  const sortedArtifacts = [...artifacts].sort((a, b) => {
    if (a.stepId === activeStepId && b.stepId !== activeStepId) return -1;
    if (b.stepId === activeStepId && a.stepId !== activeStepId) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getStepLabel = (stepId: string) => {
    return steps.find(s => s.id === stepId)?.label || stepId;
  };

  const getStepOrder = (stepId: string) => {
    return steps.find(s => s.id === stepId)?.order || 0;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200/60 bg-slate-50/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <File className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-medium text-slate-800">Artifacts</h3>
          <span className="text-xs text-slate-500">({artifacts.length})</span>
        </div>
        <button className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors">
          <Filter className="w-3 h-3" />
          Filter
        </button>
      </div>
      
      {/* Artifact List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sortedArtifacts.length === 0 ? (
          <div className="text-center py-4 text-slate-400 text-sm">
            No artifacts yet
          </div>
        ) : (
          sortedArtifacts.map((artifact) => {
            const isActiveStep = artifact.stepId === activeStepId;
            const isSelected = artifact.id === selectedArtifactId;
            
            return (
              <div
                key={artifact.id}
                className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-100 border-slate-300'
                    : isActiveStep
                    ? 'bg-slate-50/50 border-slate-200/60 hover:border-slate-300'
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
                onClick={() => onPreviewArtifact(artifact)}
              >
                {/* File icon */}
                <div className="flex-shrink-0">
                  {fileIcons[artifact.type] || <File className="w-4 h-4 text-slate-400" />}
                </div>
                
                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">
                    {artifact.filename}
                  </p>
                </div>
                
                {/* Step badge */}
                <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] text-slate-400 flex-shrink-0">
                  {getStepOrder(artifact.stepId)}
                </span>
                
                {isActiveStep && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-400 rounded flex-shrink-0">
                    Current
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
