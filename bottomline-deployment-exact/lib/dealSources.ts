// ============================================================
//  Where each deal's request and file actually came from.
//
//  Every value below was read out of the real artefacts, not invented:
//   - the email block comes from the inbound request .eml in the deal's
//     POC folder (From / Subject / Date headers and the real attachment),
//   - `salesforceRecordId` is row 3 of the 'Pricing Details for SF' tab of
//     that deal's File 8,
//   - `opportunityId` is only set for JPM, the one deal that actually has
//     a Salesforce opportunity linked.
// ============================================================
import { DEAL_IDS } from './deals';

export type IntakeChannel = 'upload' | 'salesforce' | 'email' | 'teams';

export interface DealSourceContext {
  dealId: string;
  client: string;
  channel: string;
  /** The inbound analysis request, straight from the .eml headers. */
  email: {
    from: string;
    fromName: string;
    to: string;
    subject: string;
    /** ISO timestamp from the mail Date header. */
    receivedAt: string;
    attachment: string;
    attachmentBytes: number;
  };
  salesforceRecordId: string;
  opportunityId: string | null;
}

export const DEAL_SOURCES: DealSourceContext[] = [
  {
    dealId: DEAL_IDS.jpm,
    client: 'Denton County Electric Cooperative, Inc.',
    channel: 'JPMorgan Chase',
    email: {
      from: 'vincent.saia@jpmorgan.com',
      fromName: 'Saia, Vincent',
      to: 'Paymode.Vendor.Analysis.JPM@bottomline.com',
      subject: 'DENTON COUNTY ELECTRIC COOPERATIVE, INC.',
      receivedAt: '2026-01-14T17:09:17Z',
      attachment: 'Vendor Payments 03.2023 thru 02.2024 (1).xlsx',
      attachmentBytes: 749_680,
    },
    salesforceRecordId: 'a9IWy000000a7hJMAQ',
    opportunityId: 'OPP-JPM-DCEC-2026',
  },
  {
    dealId: DEAL_IDS.abg,
    client: 'Authentic Brands Group LLC',
    channel: 'Bank of America',
    email: {
      from: 'lindsey.tsang@bofa.com',
      fromName: 'Tsang, Lindsey',
      to: 'Paymode.BofAML.Network.Analysis@bottomline.com',
      subject: 'RE: Authentic Brands Group LLC AP analysis request',
      receivedAt: '2026-05-18T16:06:57Z',
      attachment: 'Card_Comprehensive Payables AP Supplier Match Template_Update 5.15.26.xlsx',
      attachmentBytes: 177_363,
    },
    salesforceRecordId: 'a9IWy000000dAFdMAM',
    opportunityId: null,
  },
  {
    dealId: DEAL_IDS.illume,
    client: 'Illume Ag',
    channel: 'Fifth Third Bank',
    email: {
      from: 'kristy.panganiban@53.com',
      fromName: 'Panganiban, Kristy',
      to: 'Paymode.53Bank.Network.Analysis@bottomline.com',
      subject: '**Analysis Request** Illume Ag',
      receivedAt: '2025-11-04T17:30:35Z',
      attachment: 'Payables Vendor Match Template 2025 Instruction Tab Included_.xlsx',
      attachmentBytes: 74_266,
    },
    salesforceRecordId: 'a9IWy000000WjBhMAK',
    opportunityId: null,
  },
];

export function sourceForDeal(dealId: string): DealSourceContext | undefined {
  return DEAL_SOURCES.find((s) => s.dealId === dealId);
}

/** Resolve whatever the user typed into the Salesforce box — record id, opportunity id, or a record URL. */
export function resolveSalesforceRef(input: string): DealSourceContext | undefined {
  const raw = input.trim();
  if (!raw) return undefined;
  const id = (raw.split(/[/?#]/).filter(Boolean).pop() ?? raw).toLowerCase();
  return DEAL_SOURCES.find(
    (s) =>
      s.salesforceRecordId.toLowerCase() === id ||
      s.opportunityId?.toLowerCase() === id,
  );
}
