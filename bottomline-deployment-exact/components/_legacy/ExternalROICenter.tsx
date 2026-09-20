'use client';

import { useState, useEffect } from 'react';
import {
  Presentation,
  Image,
  Palette,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Edit3,
  BarChart3,
  PieChart,
  TrendingUp,
  FileText,
  Layout,
  RefreshCw,
  Maximize2,
  Grid,
} from 'lucide-react';

interface SlideData {
  id: number;
  title: string;
  type: string;
  contentType: 'overview' | 'chart' | 'table' | 'narrative' | 'cta';
  template: string;
  status: 'complete' | 'in-review' | 'draft';
  dataSource: string;
}

const mockSlides: SlideData[] = [
  { id: 1, title: 'Executive Summary', type: 'Title Slide', contentType: 'overview', template: 'Channel-Specific', status: 'complete', dataSource: 'Value Statement' },
  { id: 2, title: 'Current State Analysis', type: 'Data + Charts', contentType: 'chart', template: 'Standard', status: 'complete', dataSource: 'Intake Data' },
  { id: 3, title: 'ROI Projection', type: 'Financial Model', contentType: 'chart', template: 'Standard', status: 'complete', dataSource: 'Booking Calculator' },
  { id: 4, title: 'Cost Savings Breakdown', type: 'Data Table', contentType: 'table', template: 'Standard', status: 'complete', dataSource: 'ARR Tab' },
  { id: 5, title: 'Implementation Timeline', type: 'Gantt Chart', contentType: 'chart', template: 'Standard', status: 'complete', dataSource: 'Auto-generated' },
  { id: 6, title: 'Card Rebate Opportunity', type: 'Data + Charts', contentType: 'chart', template: 'Channel-Specific', status: 'complete', dataSource: 'ROC Output' },
  { id: 7, title: 'Case Study Reference', type: 'Narrative', contentType: 'narrative', template: 'Standard', status: 'in-review', dataSource: 'Template Library' },
  { id: 8, title: 'Next Steps & Contact', type: 'CTA', contentType: 'cta', template: 'Channel-Specific', status: 'complete', dataSource: 'SF Opp Data' },
];

const templates = [
  { id: 'boa', label: 'Bank of America', active: true },
  { id: 'usbank', label: 'US Bank', active: false },
  { id: 'wells', label: 'Wells Fargo', active: false },
  { id: 'jpmc', label: 'JPMorgan Chase', active: false },
  { id: 'citi', label: 'Citibank', active: false },
  { id: 'generic', label: 'Generic', active: false },
];

const chartStyles = ['Modern', 'Classic', 'Minimal'];

// Slide thumbnail placeholder colors by content type
const slideColors: Record<string, string> = {
  overview: 'bg-[#16345e]',
  chart: 'bg-[#1d4373]',
  table: 'bg-slate-700',
  narrative: 'bg-slate-600',
  cta: 'bg-[#0f2440]',
};

const contentIcons: Record<string, React.ElementType> = {
  overview: Layout,
  chart: BarChart3,
  table: Grid,
  narrative: FileText,
  cta: TrendingUp,
};

export default function ExternalROICenter() {
  const [selectedSlide, setSelectedSlide] = useState<number>(1);
  const [activeTemplate, setActiveTemplate] = useState('boa');
  const [chartStyle, setChartStyle] = useState('Modern');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const currentSlide = mockSlides.find(s => s.id === selectedSlide) || mockSlides[0];
  const completeCount = mockSlides.filter(s => s.status === 'complete').length;
  const ContentIcon = contentIcons[currentSlide.contentType] || Layout;

  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <Presentation className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-800">ROI Deck Builder</span>
          <span className="text-xs text-slate-400">{completeCount}/{mockSlides.length} slides ready</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded hover:bg-slate-100">
            <Download className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
            External ROI & Sales Materials
          </span>
        </div>
      </div>

      {/* Template + Style selector */}
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Template:</span>
          <div className="flex items-center gap-1">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTemplate(t.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTemplate === t.id
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex items-center gap-1">
            {chartStyles.map(style => (
              <button
                key={style}
                onClick={() => setChartStyle(style)}
                className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                  chartStyle === style
                    ? 'bg-slate-200 text-slate-800 border border-slate-300'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content: slide thumbnails + preview */}
      <div className="flex-1 min-h-0 flex">
        {/* Slide thumbnails (left sidebar) */}
        <div className="w-[180px] border-r border-slate-200 bg-slate-50 overflow-y-auto p-2 space-y-2 flex-shrink-0">
          {mockSlides.map(slide => {
            const isActive = slide.id === selectedSlide;
            const bgGradient = slideColors[slide.contentType] || slideColors.overview;
            const SlideIcon = contentIcons[slide.contentType] || Layout;

            return (
              <button
                key={slide.id}
                onClick={() => setSelectedSlide(slide.id)}
                className={`w-full rounded-lg overflow-hidden transition-all ${
                  isActive ? 'ring-2 ring-blue-500 shadow-md' : 'hover:ring-1 hover:ring-slate-300'
                }`}
              >
                {/* Mini slide preview */}
                <div className={`h-20 ${bgGradient} flex items-center justify-center relative`}>
                  <SlideIcon className="w-6 h-6 text-white/50" />
                  <span className="absolute top-1 left-1.5 text-[9px] font-bold text-white/70">{slide.id}</span>
                  {slide.status === 'in-review' && (
                    <span className="absolute top-1 right-1.5 px-1 py-0.5 text-[8px] font-bold bg-amber-400 text-amber-900 rounded">
                      REVIEW
                    </span>
                  )}
                </div>
                <div className="p-1.5 bg-white">
                  <p className="text-[10px] font-medium text-slate-700 truncate">{slide.title}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Slide Preview (main area) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Preview area */}
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-100">
            <div className={`w-full max-w-[600px] aspect-[16/9] ${slideColors[currentSlide.contentType] || slideColors.overview} rounded-md flex flex-col items-center justify-center relative`}>
              <ContentIcon className="w-12 h-12 text-white/30 mb-3" />
              <p className="text-lg font-bold text-white">{currentSlide.title}</p>
              <p className="text-sm text-white/60 mt-1">{currentSlide.type}</p>
              
              {/* Slide number */}
              <span className="absolute bottom-3 right-4 text-xs font-medium text-white/40">
                Slide {currentSlide.id} of {mockSlides.length}
              </span>
              
              {/* Data source badge */}
              <span className="absolute bottom-3 left-4 px-2 py-0.5 text-[10px] font-medium bg-white/10 text-white/60 rounded border border-white/10">
                Source: {currentSlide.dataSource}
              </span>
            </div>
          </div>

          {/* Slide info bar */}
          <div className="flex-shrink-0 px-4 py-3 border-t border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setSelectedSlide(Math.max(1, selectedSlide - 1))}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-600 font-medium">
                  {currentSlide.id} / {mockSlides.length}
                </span>
                <button 
                  onClick={() => setSelectedSlide(Math.min(mockSlides.length, selectedSlide + 1))}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${
                currentSlide.status === 'complete' ? 'bg-green-50 text-green-700 border-green-200' :
                currentSlide.status === 'in-review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-slate-50 text-slate-600 border-slate-200'
              }`}>{currentSlide.status === 'complete' ? 'Complete' : currentSlide.status === 'in-review' ? 'In Review' : 'Draft'}</span>
              <span className="text-xs text-slate-400">Template: {currentSlide.template}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">
                <Edit3 className="w-3.5 h-3.5" />
                Edit Slide
              </button>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50">
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
