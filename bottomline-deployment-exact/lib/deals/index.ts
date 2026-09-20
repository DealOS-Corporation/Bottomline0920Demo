// ============================================================
//  Deal registry.
//  The workspace route resolves a deal from the URL through
//  here, so adding a deal means adding one entry below.
// ============================================================

import type { DealDefinition } from './types';
import { jpmDeal } from './jpm';
import { illumeDeal } from './illume';
import { abgDeal } from './abg';

export * from './types';

/** Canonical ids — these match the ids used by the deal list page. */
export const DEAL_IDS = {
  jpm: 'deal-001',
  abg: 'abg-bofa',
  illume: 'illume-ag-53',
} as const;

export type DealId = (typeof DEAL_IDS)[keyof typeof DEAL_IDS];

const registry: Record<string, DealDefinition> = {
  [DEAL_IDS.jpm]: jpmDeal,
  [DEAL_IDS.illume]: illumeDeal,
  [DEAL_IDS.abg]: abgDeal,
};

/** Returns the deal, or undefined when the id is not one we have data for. */
export function getDeal(dealId: string | undefined): DealDefinition | undefined {
  if (!dealId) return undefined;
  return registry[dealId];
}

export function isInteractive(dealId: string): boolean {
  return dealId in registry;
}
