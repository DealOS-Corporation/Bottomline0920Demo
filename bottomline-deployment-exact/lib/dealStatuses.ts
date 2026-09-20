import { StepStatus } from './stepsSchema';

// Each deal has its own step statuses
// Rule: A step can only be 'done' if all previous steps are 'done'
// Rule: Only one step can be 'running' at a time
// Rule: Steps after a 'running' step must be 'not-started'

export interface DealStepStatuses {
  [stepId: string]: StepStatus;
}

const STEP_ORDER = [
  'intake',
  'processing',
  'campaign-classification',
  'internal-value-statement',
  'external-roi',
  'salesforce-sync',
];

export const dealStepStatuses: Record<string, DealStepStatuses> = {
  // Deal 001: At step 2 (Processing Orchestration) - running
  'deal-001': {
    'intake': 'done',
    'processing': 'running',
    'campaign-classification': 'not-started',
    'internal-value-statement': 'not-started',
    'external-roi': 'not-started',
    'salesforce-sync': 'not-started',
  },

  // Deal 002: At step 2 (Processing Orchestration) - running
  'deal-002': {
    'intake': 'done',
    'processing': 'running',
    'campaign-classification': 'not-started',
    'internal-value-statement': 'not-started',
    'external-roi': 'not-started',
    'salesforce-sync': 'not-started',
  },

  // Deal 003: At step 3 (Campaign Classification) - needs review
  'deal-003': {
    'intake': 'done',
    'processing': 'done',
    'campaign-classification': 'running',
    'internal-value-statement': 'not-started',
    'external-roi': 'not-started',
    'salesforce-sync': 'not-started',
  },

  // Deal 004: At step 1 (Intake) - just started
  'deal-004': {
    'intake': 'running',
    'processing': 'not-started',
    'campaign-classification': 'not-started',
    'internal-value-statement': 'not-started',
    'external-roi': 'not-started',
    'salesforce-sync': 'not-started',
  },

  // Deal 005: At step 2 (Processing Orchestration) - processing
  'deal-005': {
    'intake': 'done',
    'processing': 'running',
    'campaign-classification': 'not-started',
    'internal-value-statement': 'not-started',
    'external-roi': 'not-started',
    'salesforce-sync': 'not-started',
  },

  // Deal 006: At step 3 (Campaign Classification)
  'deal-006': {
    'intake': 'done',
    'processing': 'done',
    'campaign-classification': 'running',
    'internal-value-statement': 'not-started',
    'external-roi': 'not-started',
    'salesforce-sync': 'not-started',
  },

  // Deal 007: At step 4 (Internal Value Statement)
  'deal-007': {
    'intake': 'done',
    'processing': 'done',
    'campaign-classification': 'done',
    'internal-value-statement': 'running',
    'external-roi': 'not-started',
    'salesforce-sync': 'not-started',
  },

  // Deal 008: At step 5 (ROI Deck Generator)
  'deal-008': {
    'intake': 'done',
    'processing': 'done',
    'campaign-classification': 'done',
    'internal-value-statement': 'done',
    'external-roi': 'running',
    'salesforce-sync': 'not-started',
  },

  // Deal 009: At step 1 (Intake) - needs input
  'deal-009': {
    'intake': 'ready',
    'processing': 'not-started',
    'campaign-classification': 'not-started',
    'internal-value-statement': 'not-started',
    'external-roi': 'not-started',
    'salesforce-sync': 'not-started',
  },

  // Deal 010: At step 5 (ROI Deck Generator)
  'deal-010': {
    'intake': 'done',
    'processing': 'done',
    'campaign-classification': 'done',
    'internal-value-statement': 'done',
    'external-roi': 'running',
    'salesforce-sync': 'not-started',
  },

  // Deal 011: At step 6 (Salesforce Sync) - final step
  'deal-011': {
    'intake': 'done',
    'processing': 'done',
    'campaign-classification': 'done',
    'internal-value-statement': 'done',
    'external-roi': 'done',
    'salesforce-sync': 'running',
  },

  // Deal 012: At step 2 (Processing) - almost done
  'deal-012': {
    'intake': 'done',
    'processing': 'running',
    'campaign-classification': 'not-started',
    'internal-value-statement': 'not-started',
    'external-roi': 'not-started',
    'salesforce-sync': 'not-started',
  },

  // Deal 013: At step 2 (Processing) - blocked
  'deal-013': {
    'intake': 'done',
    'processing': 'blocked',
    'campaign-classification': 'not-started',
    'internal-value-statement': 'not-started',
    'external-roi': 'not-started',
    'salesforce-sync': 'not-started',
  },

  // Deal 014: At step 1 (Intake) - needs data schema
  'deal-014': {
    'intake': 'running',
    'processing': 'not-started',
    'campaign-classification': 'not-started',
    'internal-value-statement': 'not-started',
    'external-roi': 'not-started',
    'salesforce-sync': 'not-started',
  },

  // Deal 015: Completed - all steps done
  'deal-015': {
    'intake': 'done',
    'processing': 'done',
    'campaign-classification': 'done',
    'internal-value-statement': 'done',
    'external-roi': 'done',
    'salesforce-sync': 'done',
  },
};

// Helper to get the current active step for a deal
export function getCurrentStepId(dealId: string): string {
  const statuses = dealStepStatuses[dealId];
  if (!statuses) return 'intake';

  // Find the first step that is running, ready, or blocked
  for (const stepId of STEP_ORDER) {
    const status = statuses[stepId];
    if (status === 'running' || status === 'ready' || status === 'blocked') {
      return stepId;
    }
  }

  // If all done, return last step
  if (statuses['salesforce-sync'] === 'done') {
    return 'salesforce-sync';
  }

  // Find first not-started
  for (const stepId of STEP_ORDER) {
    if (statuses[stepId] === 'not-started') {
      return stepId;
    }
  }

  return 'intake';
}

// Get processing progress based on deal (combined Alteryx + ROC)
export function getProcessingProgress(dealId: string): number {
  const progressMap: Record<string, number> = {
    'deal-001': 35,
    'deal-002': 58,
    'deal-003': 100,
    'deal-004': 0,
    'deal-005': 23,
    'deal-006': 100,
    'deal-007': 100,
    'deal-008': 100,
    'deal-009': 0,
    'deal-010': 100,
    'deal-011': 100,
    'deal-012': 89,
    'deal-013': 0,
    'deal-014': 0,
    'deal-015': 100,
  };
  return progressMap[dealId] ?? 0;
}
