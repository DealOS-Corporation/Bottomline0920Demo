// ============================================================
//  Reference run data — JPMorgan / Denton Co Electric Coop
//  Numbers are taken from the real POC deal files so the UI
//  can be checked against a known-good result.
// ============================================================

import { jpmPreviews, jpmSlides } from '../jpmPreviews';
import type { DealDefinition, DealMeta, StageRun } from './types';

export const DEAL: DealMeta = {
  id: 'deal-001',
  client: 'Denton County Electric Cooperative',
  channel: 'JPMorgan Chase',
  analyst: 'Pricing Ops',
  received: '2026-01-16',
};

export const stageRuns: Record<string, StageRun> = {
  intake: {
    metrics: [
      { label: 'Payment rows', value: '5,982' },
      { label: 'Columns detected', value: '12' },
      { label: 'Period covered', value: '12 months', sub: 'Mar 2023 – Feb 2024' },
    ],
    checks: [
      { id: 'vendor', label: 'Vendor / Vendor Name', status: 'pass', detail: 'Both present; values read as vendor codes and names.' },
      { id: 'ptype', label: 'Payment Type', status: 'pass', detail: 'Values are Check / Direct Deposit / Wire Transfer.' },
      { id: 'pdate', label: 'Payment Date', status: 'pass', detail: 'Parses as dates across all rows.' },
      { id: 'amt', label: 'Payment Amt', status: 'pass', detail: 'Numeric on every row.' },
      { id: 'addr', label: 'Address / City / State / ZIP', status: 'pass', detail: 'Address block complete.' },
      {
        id: 'tin',
        label: 'TIN #',
        status: 'warn',
        detail: '41 vendors have no tax ID. Not blocking — noted for ROC match quality.',
        action: 'Draft a clarifying email in Outlook — ask the bank for the missing TIN on 41 vendors.',
        emailDraft: {
          to: 'operations@jpmorganchase.com',
          subject: 'Denton County Electric Cooperative — missing TIN on 41 vendors',
          body:
            'Hi team,\n\n' +
            'While processing the Denton County Electric Cooperative vendor payment file, we found 41 vendors with no Tax ID (TIN#) on record.\n\n' +
            "This isn't blocking the current run, but it will affect ROC match quality downstream. Could you confirm the correct TIN for these vendors, or let us know if they're expected to be missing?\n\n" +
            'Happy to send over the specific vendor list if useful.\n\n' +
            'Thanks,\nDealOS',
        },
      },
      { id: 'bank', label: 'Bank Account', status: 'warn', detail: 'Column present. Will be dropped before any file leaves DealOS.' },
    ],
    previews: {
      '1_ORIGINAL_VENDOR_FILE.xlsx': jpmPreviews['1_ORIGINAL_VENDOR_FILE.xlsx'],
      'intake_check_report.json': jpmPreviews['intake_check_report.json'],
    },
  },

  'alteryx-clean': {
    metrics: [
      { label: 'Rows in', value: '5,982', sub: 'payment level' },
      { label: 'Vendors out', value: '625', sub: 'one row per vendor' },
      { label: 'Exception flags', value: '2', sub: 'foreign ZIP, country' },
    ],
    transforms: [
      { label: 'Group', detail: 'Rows sharing the same vendor + address block collapse into one row. 5,982 → 625.' },
      { label: 'Rename', detail: 'Address Line 1 → Remittance Line 1, City/State/ZIP → Remittance fields, TIN# → Tax ID.' },
      { label: 'Normalize', detail: 'Direct Deposit → ACH, Wire Transfer → Wire, Check stays Check.' },
      { label: 'Aggregate', detail: 'Spend = sum of Payment Amt in the group. Last Paid Date = newest Payment Date.' },
      { label: 'Drop', detail: 'Bank Account removed entirely and never leaves DealOS.' },
    ],
    checks: [
      { id: 'grain', label: 'Row collapse', status: 'pass', detail: '5,982 payment rows → 625 unique vendors.' },
      { id: 'spend-tie', label: 'Spend ties to source', status: 'pass', detail: 'Sum of vendor Spend = $761,331,684.49, matches the raw file total.' },
      { id: 'ptype-norm', label: 'Payment type normalized', status: 'pass', detail: 'Only ACH / Check / Wire remain.' },
      { id: 'flags', label: 'Review flags', status: 'warn', detail: '2 of 625 vendors flagged: 1 foreign ZIP, 1 country could not be assigned.', action: 'Review the 2 flagged vendors (foreign ZIP / unassigned country) before this file moves to ROC.' },
      { id: 'bank-drop', label: 'Bank Account dropped', status: 'pass', detail: 'Column absent from File 3 and File 4.' },
    ],
    previews: {
      '2_Mapping_Document.xlsx': jpmPreviews['2_Mapping_Document.xlsx'],
      '3_Alteryx_Cleaning_Output.xlsx': jpmPreviews['3_Alteryx_Cleaning_Output.xlsx'],
      '4_ROC_Upload_VHFCleaned.xlsx': jpmPreviews['4_ROC_Upload_VHFCleaned.xlsx'],
    },
  },

  'roc-match': {
    metrics: [
      { label: 'Vendors submitted', value: '625' },
      { label: 'Network matches', value: '170', sub: '27% of vendors' },
      { label: 'Matched spend', value: '$322.1M', sub: '42% of file spend' },
    ],
    checks: [
      { id: 'rowcount', label: 'Row count preserved', status: 'pass', detail: '625 rows in, 625 rows out — ROC enriches 1:1.' },
      { id: 'enrich', label: 'Enrichment columns returned', status: 'pass', detail: '73 new columns added on top of the 12 submitted.' },
      { id: 'visa', label: 'Visa match', status: 'pass', detail: 'Visa detail returned for matched vendors.' },
      { id: 'mc', label: 'Mastercard match', status: 'warn', detail: 'Mastercard fields blank on vendors with no MC match — expected.' },
    ],
    previews: {
      '5_ROC_pricing_export.xlsx': jpmPreviews['5_ROC_pricing_export.xlsx'],
    },
  },

  'alteryx-pricing': {
    metrics: [
      { label: 'Vendors segmented', value: '625' },
      { label: 'Campaign targets', value: '481', sub: '$674.3M spend' },
      { label: 'Card campaign', value: '130 vendors', sub: '$22.3M spend' },
    ],
    checks: [
      { id: 'rowcount', label: 'Row count preserved', status: 'pass', detail: '625 in, 625 out.' },
      { id: 'segment', label: 'Segment assigned', status: 'pass', detail: 'Every vendor carries a pricing segment label.' },
      { id: 'excl', label: 'Card rebate exclusions', status: 'pass', detail: 'Exclusion flag replaces the raw ROC suppression field.' },
      { id: 'cap', label: 'Fee cap fields', status: 'pass', detail: 'Cap Type populated on all rows.' },
    ],
    previews: {
      '6_Alteryx_PricingOutput.xlsx': jpmPreviews['6_Alteryx_PricingOutput.xlsx'],
    },
  },

  classification: {
    metrics: [
      { label: 'Rules applied', value: '3' },
      { label: 'Segments overridden', value: '18' },
      { label: 'Exceptions for review', value: '4' },
    ],
    transforms: [
      { label: 'Rule 1 · Financial institution', detail: 'Override the target segment to Financial Institutions. Example: COBANK moved from Premium Targets.' },
      { label: 'Rule 2 · Strategic network match', detail: 'Strategic Vendor = Yes and Segment = Paymode Network Match → Basic Match.' },
      { label: 'Rule 3 · Utility / energy', detail: 'Confirmed utility or energy vendors move from Premium/Card targets to Basic Target.' },
      { label: 'Rule 4 · Otherwise', detail: 'Keep the Alteryx segment. If entity type is unclear, raise an exception instead of guessing.' },
    ],
    checks: [
      { id: 'rowcount', label: 'Row count preserved', status: 'pass', detail: '625 in, 625 out. No rows added or lost.' },
      { id: 'labels', label: 'Segment labels valid', status: 'pass', detail: 'All values exist in the segment mapping table.' },
      { id: 'exceptions', label: 'Low-confidence rows', status: 'warn', detail: '4 vendors need an analyst decision before File 7 is approved.', action: 'Resolve 4 low-confidence vendor segment exceptions before approving File 7.' },
      { id: 'spend-mix', label: 'Spend mix reasonable', status: 'pass', detail: 'Target spend share moved less than 1pp after overrides.' },
    ],
    previews: {
      '7_Reviewed_PricingOutput_MR.xlsx': jpmPreviews['7_Reviewed_PricingOutput_MR.xlsx'],
    },
  },

  'value-statement': {
    metrics: [
      { label: 'Total file spend', value: '$761.3M', sub: '5,981 transactions' },
      { label: 'Total target spend', value: '$674.3M', sub: '88.6% of file' },
      { label: 'Card campaign spend', value: '$22.3M', sub: '130 vendors' },
      { label: 'Card projection', value: '$6.4M', sub: '68 vendors converted' },
    ],
    checks: [
      { id: 'file-totals', label: 'File totals tie to source', status: 'pass', detail: '625 vendors / 5,981 transactions / $761,331,684.49.' },
      { id: 'split', label: 'Spend split reconciles', status: 'pass', detail: 'Excluded spend + target spend = total spend.' },
      { id: 'formula', label: 'Formula health', status: 'pass', detail: 'No errors on Calculations, Booking Calc or dashboard tabs.' },
      { id: 'projection', label: 'Projection sanity', status: 'pass', detail: 'No negative projections.' },
      { id: 'card-qa', label: 'External card program QA', status: 'warn', detail: 'Bank card figures not yet entered — QA row is zero by default.', action: "Enter the external bank's card-program figures before this QA line can pass." },
    ],
    previews: {
      '8_Internal_Value_Statement.xlsx': jpmPreviews['8_Internal_Value_Statement.xlsx'],
    },
  },

  'external-roi': {
    metrics: [
      { label: 'Slides generated', value: '21' },
      { label: 'Figures traced', value: '100%', sub: 'every number links to a cell' },
      { label: 'Target vendors listed', value: '481' },
    ],
    checks: [
      { id: 'trace', label: 'Slide numbers trace to workbook', status: 'pass', detail: 'Every figure on the deck maps to a source cell.' },
      { id: 'internal', label: 'No internal-only fields', status: 'pass', detail: 'Internal pricing fields excluded from the external workbook and deck.' },
      { id: 'header', label: 'Header consistency', status: 'pass', detail: 'Client name, date and channel identical across workbook, deck and vendor list.' },
      { id: 'brand', label: 'Brand template', status: 'pass', detail: 'JPMorgan template + current disclaimer applied.' },
    ],
    previews: {
      '9_External_ROI_Analysis.xlsx': jpmPreviews['9_External_ROI_Analysis.xlsx'],
      'target_vendor_list.xlsx': jpmPreviews['target_vendor_list.xlsx'],
    },
  },

  sendback: {
    metrics: [
      { label: 'Recipients', value: '11', sub: '4 to · 7 cc' },
      { label: 'Package attached', value: '3 files', sub: '1.6 MB' },
      { label: 'Internal copy', value: 'File 8', sub: 'pricing team only' },
    ],
    checks: [
      { id: 'thread', label: 'Reply matches the request thread', status: 'pass', detail: 'Subject and recipients resolved from the original bank request.' },
      { id: 'package', label: 'Released package complete', status: 'pass', detail: 'ROI slides, ROI analysis workbook and day-one target list all present.' },
      { id: 'internal-split', label: 'Internal statement withheld', status: 'pass', detail: 'File 8 is on the internal note only — it never goes to the bank.' },
      { id: 'send', label: 'Send confirmation', status: 'warn', detail: 'DealOS hands the draft to the mail client. A person still clicks Send.', action: 'Open the drafted reply and send it from your mail client.' },
    ],
    previews: {},
  },

  salesforce: {
    metrics: [
      { label: 'Fields mapped', value: '142' },
      { label: 'Attachments', value: '3' },
      { label: 'Opportunity', value: 'OPP-JPM-DCEC-2026' },
    ],
    checks: [
      { id: 'conn', label: 'Salesforce connection', status: 'pass', detail: 'Authenticated against the pricing sandbox.' },
      { id: 'fields', label: 'Required fields populated', status: 'pass', detail: 'All Calc_* pricing fields written.' },
      { id: 'tie', label: '3-year booking ties to ROI', status: 'pass', detail: 'Booking Calc totals match the ROI summary.' },
      { id: 'attach', label: 'Package attached', status: 'pass', detail: 'External workbook, deck and vendor list attached to the record.' },
    ],
    previews: {
      'salesforce_sync_receipt.json': jpmPreviews['salesforce_sync_receipt.json'],
    },
  },
};

/** Real slide deck extracted from File 10 (10_Paymode_ROI_Slides.pptx). */
export const deckSlides = jpmSlides;

export const jpmDeal: DealDefinition = {
  meta: DEAL,
  stageRuns,
  deckMap: 'jpm',
  deckSlides,
};
