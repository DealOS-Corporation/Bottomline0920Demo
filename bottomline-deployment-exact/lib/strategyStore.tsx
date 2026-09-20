'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

/* ════════════════════════════════════════════════════════════════
   STRATEGY ENGINE — the single "handle" that drives how pricing
   recommendations are generated across every deal. Set in Analytics,
   read by the Pricing Recommendation tab (and anywhere else).
   ════════════════════════════════════════════════════════════════ */

export type StrategyPosture = 'land' | 'balanced' | 'expand';

export interface StrategySettings {
  /** Land = win the logo (accept more discount); Expand = protect margin / grow ARR. */
  posture: StrategyPosture;
  /** Max discount % a rep can quote before it routes to deal desk for approval. */
  approvalThreshold: number;
  /** Minimum acceptable gross margin %. Anything below is blocked / escalated. */
  marginFloor: number;
  /** When on, the recommended tier is auto-applied to the quote. */
  autoApply: boolean;
  /** Free-text guidance tailored to this book of business. */
  context: string;
}

export const DEFAULT_STRATEGY: StrategySettings = {
  posture: 'balanced',
  approvalThreshold: 10,
  marginFloor: 65,
  autoApply: true,
  context: '',
};

const STORAGE_KEY = 'bottomline.strategy.v1';

export const POSTURE_META: Record<StrategyPosture, { label: string; tagline: string; targetGrade: 'A' | 'B' | 'C'; description: string }> = {
  land: {
    label: 'Land',
    tagline: 'Win the logo',
    targetGrade: 'C',
    description: 'Prioritize win-rate. Lead with the most competitive defensible quote to displace an incumbent or capture a strategic logo, accepting thinner margin up front.',
  },
  balanced: {
    label: 'Balanced',
    tagline: 'Maximize expected value',
    targetGrade: 'B',
    description: 'Default posture. Opens at the position that balances win-rate against margin — the median of comparable won deals.',
  },
  expand: {
    label: 'Expand',
    tagline: 'Protect margin & grow ARR',
    targetGrade: 'A',
    description: 'Lead with a premium quote. Best when you already own the relationship and the value case is signed off — protects margin and grows account value.',
  },
};

export interface PricingTierLite {
  grade: 'A' | 'B' | 'C';
  discountPct: number;
  marginPct: number;
}

export interface StrategyResolution<T extends PricingTierLite> {
  tier: T;
  grade: 'A' | 'B' | 'C';
  needsApproval: boolean;
  belowFloor: boolean;
}

/** Pure function: given the strategy + the available tiers, decide the recommendation. */
export function resolveStrategy<T extends PricingTierLite>(
  strategy: StrategySettings,
  tiers: T[],
): StrategyResolution<T> {
  const targetGrade = POSTURE_META[strategy.posture].targetGrade;
  const tier = tiers.find(t => t.grade === targetGrade) ?? tiers[0];
  return {
    tier,
    grade: tier.grade,
    needsApproval: tier.discountPct > strategy.approvalThreshold,
    belowFloor: tier.marginPct < strategy.marginFloor,
  };
}

interface StrategyContextValue {
  strategy: StrategySettings;
  setStrategy: (next: StrategySettings) => void;
  updateStrategy: (patch: Partial<StrategySettings>) => void;
  resetStrategy: () => void;
}

const StrategyContext = createContext<StrategyContextValue | null>(null);

export function StrategyProvider({ children }: { children: React.ReactNode }) {
  const [strategy, setStrategyState] = useState<StrategySettings>(DEFAULT_STRATEGY);

  // Hydrate from localStorage after mount (avoids SSR mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StrategySettings>;
        setStrategyState({ ...DEFAULT_STRATEGY, ...parsed });
      }
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  const writeStorage = (next: StrategySettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — keep in-memory */
    }
  };

  const setStrategy = useCallback((next: StrategySettings) => {
    setStrategyState(next);
    writeStorage(next);
  }, []);

  const updateStrategy = useCallback((patch: Partial<StrategySettings>) => {
    setStrategyState(prev => {
      const next = { ...prev, ...patch };
      writeStorage(next);
      return next;
    });
  }, []);

  const resetStrategy = useCallback(() => {
    setStrategyState(DEFAULT_STRATEGY);
    writeStorage(DEFAULT_STRATEGY);
  }, []);

  return (
    <StrategyContext.Provider value={{ strategy, setStrategy, updateStrategy, resetStrategy }}>
      {children}
    </StrategyContext.Provider>
  );
}

export function useStrategy(): StrategyContextValue {
  const ctx = useContext(StrategyContext);
  if (!ctx) {
    // Graceful fallback so components don't crash if used outside the provider.
    return {
      strategy: DEFAULT_STRATEGY,
      setStrategy: () => {},
      updateStrategy: () => {},
      resetStrategy: () => {},
    };
  }
  return ctx;
}
