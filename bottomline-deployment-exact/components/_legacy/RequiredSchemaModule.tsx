'use client';

import { useState } from 'react';
import { Database, ChevronDown, ChevronUp, Plus, ToggleLeft, ToggleRight, BookOpen } from 'lucide-react';

export interface SchemaField {
  id: string;
  name: string;
  required: boolean;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  synonyms: string[];
}

export interface RequiredSchemaState {
  templateName: string;
  fields: SchemaField[];
  fuzzyMappingEnabled: boolean;
}

interface RequiredSchemaModuleProps {
  state: RequiredSchemaState;
  onChange: (state: RequiredSchemaState) => void;
}

const dataTypeColors: Record<string, string> = {
  string: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  number: 'bg-blue-50 text-blue-700 border-blue-200',
  date: 'bg-slate-50 text-slate-600 border-slate-200',
  boolean: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function RequiredSchemaModule({ state, onChange }: RequiredSchemaModuleProps) {
  const [expanded, setExpanded] = useState(true);

  const toggleFuzzyMapping = () => {
    onChange({ ...state, fuzzyMappingEnabled: !state.fuzzyMappingEnabled });
  };

  const toggleRequired = (fieldId: string) => {
    onChange({
      ...state,
      fields: state.fields.map(f =>
        f.id === fieldId ? { ...f, required: !f.required } : f
      ),
    });
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">B · Required Schema</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="p-3 space-y-3">
          {/* Template selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Template / Schema</label>
            <select
              value={state.templateName}
              onChange={(e) => onChange({ ...state, templateName: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
            >
              <option value="standard-payments">Standard Payments Template</option>
              <option value="card-processing">Card Processing Template</option>
              <option value="ach-template">ACH Template</option>
              <option value="custom">Custom Schema...</option>
            </select>
          </div>

          {/* Fuzzy mapping toggle */}
          <div className="flex items-center justify-between px-2.5 py-2 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-600">Fuzzy Field Mapping</span>
            </div>
            <button
              onClick={toggleFuzzyMapping}
              className="flex items-center gap-1"
            >
              {state.fuzzyMappingEnabled ? (
                <ToggleRight className="w-5 h-5 text-blue-700" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-slate-400" />
              )}
              <span className={`text-[10px] font-medium ${state.fuzzyMappingEnabled ? 'text-blue-700' : 'text-slate-400'}`}>
                {state.fuzzyMappingEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
          {state.fuzzyMappingEnabled && (
            <div className="px-2.5 py-1.5 bg-slate-50 rounded text-[10px] text-slate-600 border border-slate-200">
              Incoming fields are mapped to the schema with confidence scores. Matches below 80% are flagged for review.
            </div>
          )}

          {/* Field list */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Fields</label>
            <div className="space-y-1">
              {state.fields.map(field => (
                <div
                  key={field.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-slate-100 rounded-lg hover:border-slate-200 transition-colors"
                >
                  {/* Required toggle dot */}
                  <button
                    onClick={() => toggleRequired(field.id)}
                    title={field.required ? 'Required — click to make optional' : 'Optional — click to make required'}
                    className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${
                      field.required ? 'bg-red-500' : 'bg-slate-300'
                    }`}
                  />

                  {/* Field name */}
                  <span className="text-xs text-slate-700 flex-1 truncate">{field.name}</span>

                  {/* Data type badge */}
                  <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded border ${dataTypeColors[field.dataType]}`}>
                    {field.dataType}
                  </span>

                  {/* Synonyms count */}
                  {field.synonyms.length > 0 && (
                    <span className="px-1 py-0.5 text-[9px] text-slate-500 bg-slate-100 rounded" title={field.synonyms.join(', ')}>
                      {field.synonyms.length} syn
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add field button */}
          <button className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors">
            <Plus className="w-3 h-3" />
            Add Field
          </button>
        </div>
      )}
    </div>
  );
}
