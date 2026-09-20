// ============================================================
//  Send-back email drafts.
//  Recipients, subjects, bodies and attachment lists are taken verbatim
//  from the real .eml files sitting in each deal's POC folder:
//    JPM/  Paymode Quoting Analysis for Denton County Electric Cooperative, Inc.[ INTERNAL].eml
//    53/   Paymode Quoting Analysis for Illume Ag[ (Internal Use Only)].eml
//    BOA/  Value Models for Authentic Brands Group LLC.eml
//          Paymode Quoting Analysis for Authentic Brands Group LLC.eml
//  Every deal sends its own package to its own bank — nothing is shared.
// ============================================================

import { DEAL_IDS } from '@/lib/deals';

/** Which generated artifact an attachment slot resolves to. */
export type AttachmentSource = 'deck' | 'file9' | 'file8' | 'top25';

export interface DraftAttachment {
  source: AttachmentSource;
  /** Filename as it appears on the real sent email. */
  filename: string;
  /** Pipeline reference so the UI can tie it back to a step. */
  ref: string;
  approxBytes: number;
}

export interface EmailDraft {
  id: 'external' | 'internal';
  label: string;
  audience: string;
  from: string;
  to: string[];
  cc: string[];
  subject: string;
  body: string;
  attachments: DraftAttachment[];
}

const SIGNATURE = 'Nolan Mann\nPaymode Quoting Team Lead\nwww.bottomline.com';

// ---------- JPMorgan Chase / Denton County Electric Cooperative ----------

const TEAM_CC = [
  'Paymode.Vendor.Analysis.JPM@bottomline.com',
  'Kristin.Sposato@bottomline.com',
  'Jenn.Taylor@bottomline.com',
  'MaryCatherine.White@bottomline.com',
  'MKutsch@bottomline.com',
  'Rich.Drury@bottomline.com',
  'Emma.Gray@bottomline.com',
];

export const SENDER = 'Paymode.Vendor.Analysis.JPM@bottomline.com';

const jpmDrafts: EmailDraft[] = [
  {
    id: 'external',
    label: 'To the bank',
    audience: 'JPMorgan Chase',
    from: SENDER,
    to: [
      'vincent.saia@jpmorgan.com',
      'julia.lin@jpmorgan.com',
      'lisa.gajjar@jpmchase.com',
      'jack.lipari@jpmorgan.com',
    ],
    cc: TEAM_CC,
    subject:
      'Paymode Quoting Analysis for Denton County Electric Cooperative, Inc.',
    body:
      'Hi Team,\n\n' +
      'Attached please find the JPM ROI slides and supporting workbook for ' +
      'Denton County Electric Cooperative, Inc.\n\n' +
      'Please let me know if you have any questions.\n\n' +
      'Best,\n\n' +
      SIGNATURE,
    attachments: [
      {
        source: 'deck',
        filename: 'JPM Paymode_ROI Slides_Denton Co Electric Coop_2026_01_16.pptx',
        ref: 'File 10',
        approxBytes: 706766,
      },
      {
        source: 'file9',
        filename: 'JPM_Internal ROI Analysis_Denton Co Electric Coop_2026_01_16.xlsx',
        ref: 'File 9',
        approxBytes: 93879,
      },
      {
        source: 'top25',
        filename: 'JPM_Top 25 Day 1_Denton Co Electric Coop_2026_01_16.xlsx',
        ref: 'Target list',
        approxBytes: 847268,
      },
    ],
  },
  {
    id: 'internal',
    label: 'Internal only',
    audience: 'Bottomline pricing team',
    from: SENDER,
    to: [
      'Kristin.Sposato@bottomline.com',
      'MaryCatherine.White@bottomline.com',
      'Jenn.Taylor@bottomline.com',
    ],
    cc: [
      'MKutsch@bottomline.com',
      'Rich.Drury@bottomline.com',
      'Emma.Gray@bottomline.com',
      'Paymode.Vendor.Analysis.JPM@bottomline.com',
    ],
    subject:
      'Paymode Quoting Analysis for Denton County Electric Cooperative, Inc. [INTERNAL]',
    body: 'Please see the attached value statement.\n\n' + SIGNATURE,
    attachments: [
      {
        source: 'file8',
        filename:
          'Bottomline_Internal_Value Statement_Denton Co Electric Coop_2026_01_16.xlsx',
        ref: 'File 8',
        approxBytes: 1445996,
      },
    ],
  },
];

// ---------- Fifth Third Bank / Illume Ag ----------

const FIFTH_THIRD_SENDER = 'Paymode.53Bank.Network.Analysis@bottomline.com';

const illumeDrafts: EmailDraft[] = [
  {
    id: 'external',
    label: 'To the bank',
    audience: 'Fifth Third Bank',
    from: FIFTH_THIRD_SENDER,
    to: ['kristy.panganiban@53.com'],
    cc: [
      'Paymode.53Bank.Network.Analysis@bottomline.com',
      'andrew.goodman@53.com',
      'PTurpin@bottomline.com',
      'MaryCatherine.White@bottomline.com',
      'Caitlin.Mooney@bottomline.com',
      'Chad.Benson@bottomline.com',
    ],
    subject: 'Paymode Quoting Analysis for Illume Ag',
    body:
      'Hi Team,\n\n' +
      'Attached please find the Paymode quoting analysis for Illume Ag, including the ' +
      'ROI slide deck and the internal value statement from the network match run on 11/7/2025.\n\n' +
      'Please let us know if you have any questions.\n\n' +
      'Thank you,\n\n' +
      SIGNATURE,
    attachments: [
      {
        source: 'deck',
        filename: 'Fifth Third_Paymode_ROI Slides_Illume Ag_2025_11_07.pptx',
        ref: 'File 10',
        approxBytes: 6727616,
      },
      {
        source: 'file9',
        filename: 'Fifth Third_Internal Value Statement_Illume Ag_2025_11_07.xlsx',
        ref: 'File 9',
        approxBytes: 44258,
      },
    ],
  },
  {
    id: 'internal',
    label: 'Internal only',
    audience: 'Bottomline pricing team',
    from: FIFTH_THIRD_SENDER,
    to: ['PTurpin@bottomline.com'],
    cc: [
      'Paymode.53Bank.Network.Analysis@bottomline.com',
      'MaryCatherine.White@bottomline.com',
      'Caitlin.Mooney@bottomline.com',
      'MKutsch@bottomline.com',
      'Margarita.Roxas@bottomline.com',
      'Chad.Benson@bottomline.com',
    ],
    subject: 'Paymode Quoting Analysis for Illume Ag (Internal Use Only)',
    body:
      'Requested by: Kristy Middling\n\n' +
      'Channel Partner: 5th 3rd\n\n' +
      'Please note that this file is for internal use only, and should not be shared with the bank.\n\n' +
      'Thank you,\n\n' +
      SIGNATURE,
    attachments: [
      {
        source: 'file8',
        filename: 'Bottomline_Internal_Illume Ag_2025_11_07.xlsx',
        ref: 'File 8',
        approxBytes: 1157870,
      },
    ],
  },
];

// ---------- Bank of America / Authentic Brands Group ----------
// This deal shipped value models, never a slide deck, so neither draft
// carries a .pptx.

const BOFA_SENDER = 'Paymode.BofAML.Network.Analysis@bottomline.com';

const abgDrafts: EmailDraft[] = [
  {
    id: 'external',
    label: 'To the bank',
    audience: 'Bank of America — requestors',
    from: BOFA_SENDER,
    to: ['lindsey.tsang@bofa.com', 'ozoda.jovliyeva@bofa.com'],
    cc: [
      'Paymode.BofAML.Network.Analysis@bottomline.com',
      'BofAChannelTeam@bottomline.com',
      'Joe.Lane@bottomline.com',
      'Wesley.Krupp@bottomline.com',
    ],
    subject: 'Value Models for Authentic Brands Group LLC',
    body:
      'Attached is the Comprehensive Payables Value Model for Authentic Brands Group LLC.\n\n' +
      '*ACTION REQUIRED*: Review the "Dashboard" tab to ensure minimum spend thresholds for ' +
      'both Virtual Payables AND Paymode Connect are met.\n\n' +
      '  1. The spend volume for Virtual Payables must exceed $5MM for GCBK/GCB clients; ' +
      '$2MM for Gov\u2019t/PSB clients.\n' +
      '  2. The spend volume to Paymode Premium Suppliers must exceed $5MM for all clients.\n\n' +
      'If program estimations fall below the minimums for the product, product manager approval ' +
      'is required before presenting the results to the prospective client.\n\n' +
      'Thank you,\n\n' +
      SIGNATURE,
    attachments: [
      {
        source: 'file9',
        filename: 'BofA_External Value Model_Authentic Brands Group_2026_05_22_CompPay.xlsx',
        ref: 'File 9 · Comp Pay',
        approxBytes: 153021,
      },
      {
        source: 'file9',
        filename: 'BofA_External Value Model_Authentic Brands Group_2026_05_22_PM Only.xlsx',
        ref: 'File 9 · PM Only',
        approxBytes: 149273,
      },
      {
        source: 'top25',
        filename: 'BofA+Card+Target+List_Authentic+Brands+Group_2026_05_22_CompPay.xlsx',
        ref: 'Target list',
        approxBytes: 15974,
      },
    ],
  },
  {
    id: 'internal',
    label: 'To Intelligent Payables',
    audience: 'Bank of America — Intelligent Payables',
    from: BOFA_SENDER,
    to: ['intelligent_payables@bofa.com'],
    cc: [
      'Paymode.BofAML.Network.Analysis@bottomline.com',
      'holly.tennent@bofa.com',
      'BofAChannelTeam@bottomline.com',
      'Joe.Lane@bottomline.com',
    ],
    subject: 'Paymode Quoting Analysis for Authentic Brands Group LLC',
    body:
      'Please see attached analysis for Authentic Brands Group LLC.\n\n' +
      'Any questions on the results or need support during the sales process? ' +
      'Please contact your Paymode Solution Consultant.\n\n' +
      'Thank you,\n\n' +
      SIGNATURE,
    attachments: [
      {
        source: 'file8',
        filename: 'BofA_Internal Value Model_Authentic Brands Group_2026_05_22_CompPay.xlsx',
        ref: 'File 8 · Comp Pay',
        approxBytes: 371585,
      },
      {
        source: 'file8',
        filename: 'BofA_Internal Value Model_Authentic Brands Group_2026_05_22_PM Only.xlsx',
        ref: 'File 8 · PM Only',
        approxBytes: 369011,
      },
      {
        source: 'file9',
        filename: 'BofA_External Value Model_Authentic Brands Group_2026_05_22_CompPay.xlsx',
        ref: 'File 9 · Comp Pay',
        approxBytes: 153021,
      },
      {
        source: 'top25',
        filename: 'BofA+Card+Target+List_Authentic+Brands+Group_2026_05_22_CompPay.xlsx',
        ref: 'Target list',
        approxBytes: 15974,
      },
    ],
  },
];

export const emailDraftsByDeal: Record<string, EmailDraft[]> = {
  [DEAL_IDS.jpm]: jpmDrafts,
  [DEAL_IDS.illume]: illumeDrafts,
  [DEAL_IDS.abg]: abgDrafts,
};

/** The send-back drafts belonging to one deal. */
export function draftsForDeal(dealId: string | undefined): EmailDraft[] {
  if (!dealId) return [];
  return emailDraftsByDeal[dealId] ?? [];
}

export const getDraft = (dealId: string | undefined, id: string) =>
  draftsForDeal(dealId).find((d) => d.id === id);

/** Which API route serves the real bytes for each attachment slot. */
export const ATTACHMENT_ROUTE: Record<AttachmentSource, string> = {
  deck: '/api/generate/deck',
  file8: '/api/generate/workbook?file=8',
  file9: '/api/generate/workbook?file=9',
  top25: '/api/generate/vendor-list',
};

/** Route for one attachment, scoped to the deal it belongs to. */
export function attachmentRoute(source: AttachmentSource, dealId: string): string {
  const base = ATTACHMENT_ROUTE[source];
  return `${base}${base.includes('?') ? '&' : '?'}deal=${encodeURIComponent(dealId)}`;
}

/** Same mailto: convention already used for the intake clarification emails. */
export function mailtoHref(draft: EmailDraft): string {
  const params = new URLSearchParams({
    cc: draft.cc.join(','),
    subject: draft.subject,
    body: draft.body,
  });
  return `mailto:${draft.to.join(',')}?${params.toString()}`;
}
