'use client';

import { StepSchema, StepInput } from '@/lib/stepsSchema';
import { Settings, CheckSquare, List, Hash, Type } from 'lucide-react';
import IntakeSourceModule, { IntakeSourceState } from './IntakeSourceModule';
import RequiredSchemaModule, { RequiredSchemaState } from './RequiredSchemaModule';
import ValidationChecksModule, { ValidationChecksState } from './ValidationChecksModule';
import ROCConfigurationModule, { ROCConfigState } from './ROCConfigurationModule';
import MonitoringAlertsModule, { MonitoringAlertsState } from './MonitoringAlertsModule';

interface StepInputsPanelProps {
  step: StepSchema | undefined;
  formValues: Record<string, string | number | boolean>;
  onFormChange: (inputId: string, value: string | number | boolean) => void;
  // Intake module states
  intakeSource?: IntakeSourceState;
  onIntakeSourceChange?: (state: IntakeSourceState) => void;
  requiredSchema?: RequiredSchemaState;
  onRequiredSchemaChange?: (state: RequiredSchemaState) => void;
  validationChecks?: ValidationChecksState;
  onValidationChecksChange?: (state: ValidationChecksState) => void;
  // ROC module states
  rocConfig?: ROCConfigState;
  onRocConfigChange?: (state: ROCConfigState) => void;
  monitoringAlerts?: MonitoringAlertsState;
  onMonitoringAlertsChange?: (state: MonitoringAlertsState) => void;
}

export default function StepInputsPanel({
  step,
  formValues,
  onFormChange,
  intakeSource,
  onIntakeSourceChange,
  requiredSchema,
  onRequiredSchemaChange,
  validationChecks,
  onValidationChecksChange,
  rocConfig,
  onRocConfigChange,
  monitoringAlerts,
  onMonitoringAlertsChange,
}: StepInputsPanelProps) {
  if (!step) {
    return (
      <div className="bg-white rounded-md border border-slate-200 p-4">
        <div className="text-slate-400 text-sm text-center py-8">
          Select a step to view inputs
        </div>
      </div>
    );
  }

  const isIntakeStep = step.id === 'intake';
  const isRocStep = step.id === 'processing';

  // ─── Intake Step: 3 modules ───
  if (isIntakeStep && intakeSource && onIntakeSourceChange && requiredSchema && onRequiredSchemaChange && validationChecks && onValidationChecksChange) {
    return (
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
          <Settings className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Intake Configuration</h3>
          <span className="ml-auto text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-medium">Step {step.order}</span>
        </div>
        <div className="p-3 space-y-3">
          <IntakeSourceModule state={intakeSource} onChange={onIntakeSourceChange} />
          <RequiredSchemaModule state={requiredSchema} onChange={onRequiredSchemaChange} />
          <ValidationChecksModule state={validationChecks} onChange={onValidationChecksChange} />
        </div>
      </div>
    );
  }

  // ─── ROC Step: Config + Monitoring ───
  if (isRocStep && rocConfig && onRocConfigChange && monitoringAlerts && onMonitoringAlertsChange) {
    return (
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
          <Settings className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-800 tracking-tight">ROC Setup</h3>
          <span className="ml-auto text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-medium">Step {step.order}</span>
        </div>
        <div className="p-3 space-y-3">
          <ROCConfigurationModule state={rocConfig} onChange={onRocConfigChange} />
          <MonitoringAlertsModule state={monitoringAlerts} onChange={onMonitoringAlertsChange} />
        </div>
      </div>
    );
  }

  // ─── Default: Generic inputs ───
  const renderInput = (input: StepInput) => {
    const value = formValues[input.id] ?? input.defaultValue ?? '';
    
    switch (input.type) {
      case 'select':
        return (
          <select
            id={input.id}
            value={value as string}
            onChange={(e) => onFormChange(input.id, e.target.value)}
            className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-colors"
          >
            <option value="">Select...</option>
            {input.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              id={input.id}
              checked={value as boolean}
              onChange={(e) => onFormChange(input.id, e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 bg-white text-blue-700 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="text-sm text-slate-600">Enabled</span>
          </label>
        );
      
      case 'number':
        return (
          <input
            type="number"
            id={input.id}
            value={value as number}
            onChange={(e) => onFormChange(input.id, parseFloat(e.target.value) || 0)}
            placeholder={input.placeholder}
            className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-colors"
          />
        );
      
      case 'text':
      default:
        return (
          <input
            type="text"
            id={input.id}
            value={value as string}
            onChange={(e) => onFormChange(input.id, e.target.value)}
            placeholder={input.placeholder}
            className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-colors"
          />
        );
    }
  };

  const getInputIcon = (type: string) => {
    switch (type) {
      case 'select':
        return <List className="w-4 h-4 text-slate-400" />;
      case 'checkbox':
        return <CheckSquare className="w-4 h-4 text-slate-400" />;
      case 'number':
        return <Hash className="w-4 h-4 text-slate-400" />;
      default:
        return <Type className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
        <Settings className="w-4 h-4 text-slate-500" />
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">Step Inputs</h3>
        <span className="ml-auto text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-medium">Step {step.order}</span>
      </div>
      
      {/* Form fields */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {step.inputs.map((input) => (
          <div key={input.id} className="space-y-1.5">
            <label 
              htmlFor={input.id} 
              className="flex items-center gap-2 text-xs font-medium text-slate-500"
            >
              {getInputIcon(input.type)}
              {input.label}
            </label>
            {renderInput(input)}
          </div>
        ))}
        
        {step.inputs.length === 0 && (
          <div className="col-span-2 text-sm text-slate-400 text-center py-4">
            No inputs required for this step
          </div>
        )}
      </div>
    </div>
  );
}
