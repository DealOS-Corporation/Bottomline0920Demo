// ============================================================
//  Absolute paths to the real deal source files that live outside
//  the repo (the bank's own templates and workbooks). Override the
//  root with DEALOS_POC_DIR when the demo runs on another machine.
// ============================================================
import path from 'path';
import { DEAL_IDS } from './deals';

/** Root that holds one folder per deal. */
const POC_ROOT =
  process.env.DEALOS_POC_DIR ?? path.join(process.cwd(), '..', 'POC Deals');

export interface DealSourceFiles {
  /** Folder under POC_ROOT holding this deal's files. */
  dir: string;
  /** File 1 — the raw vendor file exactly as the bank attached it to the request email. */
  vendorFile: string;
  /** The bank's real ROI deck, used as the template. Null when the deal never produced one. */
  deckTemplate: string | null;
  /**
   * Which verified slide-to-sheet map the deck engine should use. Null means the
   * deck exists but its map has not been derived yet, so we must not generate it —
   * a wrong map silently writes wrong numbers onto a client-facing deck.
   */
  deckSlideMap: string | null;
  /** File 9 — the ROI analysis workbook every deck figure is read from. */
  roiWorkbook: string;
  /** File 8 — the internal value statement model that turns reviewed pricing into bookings. */
  valueStatementTemplate: string;
  /** This bank's tab inside the shared multi-bank value statement model. */
  convertedTab: string;
  /** The tab in this deal's ROI workbook that the converted data is pasted onto. */
  roiInputTab: string;
  /** File 7 — the manually reviewed Alteryx pricing output that feeds the model. */
  reviewedPricing: string;
  /** File 6 — the Alteryx pricing output the classification engine reads. */
  pricingOutput: string;
  /** Deal metadata and the analyst's declared overrides, kept in the repo. */
  dealConfig: string;
  /** Day-one target vendor list, when the deal produced one. */
  top25VendorList: string | null;
  /** Names used for the files handed back to the bank. */
  deliveredValueStatementName: string;
  deliveredRoiWorkbookName: string;
  deliveredDeckName: string | null;
}

const inRepo = (...p: string[]) => path.join(process.cwd(), ...p);

const jpmDir = path.join(POC_ROOT, 'JPM');
const illumeDir = path.join(POC_ROOT, '53');
const abgDir = path.join(POC_ROOT, 'BOA');

const SOURCES: Record<string, DealSourceFiles> = {
  [DEAL_IDS.jpm]: {
    dir: jpmDir,
    vendorFile: path.join(
      jpmDir,
      '1_ORIGINAL VENDOR FILE_Vendor Payments 03.2023 thru 02.2024 (1).xlsx',
    ),
    deckTemplate: path.join(
      jpmDir,
      '10_Sales Material_JPM Paymode_ROI Slides_Denton Co Electric Coop_2026_01_16.pptx',
    ),
    deckSlideMap: 'jpm',
    roiWorkbook: path.join(
      jpmDir,
      '9_File to Build Out Slide Deck_JPM_Internal ROI Analysis_Denton Co Electric Coop_2026_01_16.xlsx',
    ),
    valueStatementTemplate: path.join(jpmDir, '8_Bottomline_Internal_Value Statement.xlsx'),
    convertedTab: 'JPM Data Converted (Paymode VC)',
    roiInputTab: 'Bottomline Data Converted',
    reviewedPricing: path.join(
      jpmDir,
      '7_Manually Reviewed Alteryx Output_DCEC_PricingOutput_MR.xlsx',
    ),
    pricingOutput: path.join(jpmDir, '6_Alteryx Pricing Workflow Output_DCEC_PricingOutput.xlsx'),
    dealConfig: inRepo('engine', 'data', 'deal_jpm_dcec.json'),
    top25VendorList: path.join(jpmDir, 'JPM_Top 25 Day 1_Denton Co Electric Coop_2026_01_16.xlsx'),
    deliveredValueStatementName:
      'Bottomline Internal Value Statement - Denton Co Electric Coop.xlsx',
    deliveredRoiWorkbookName: 'JPM Internal ROI Analysis - Denton Co Electric Coop.xlsx',
    deliveredDeckName: 'JPM Paymode ROI Slides - Denton Co Electric Coop.pptx',
  },

  [DEAL_IDS.illume]: {
    dir: illumeDir,
    vendorFile: path.join(
      illumeDir,
      '1_Original Vendor File_Payables Vendor Match Template 2025 Instruction Tab Included_.xlsx',
    ),
    deckTemplate: path.join(
      illumeDir,
      '10_Sales MaterialFifth Third_Paymode_ROI Slides_Illume Ag_2025_11_07_1.pptx',
    ),
    // 19 slides in the reworked deck (was 29); see ILLUME_SLIDES in step7_deck.py.
    deckSlideMap: 'illume',
    roiWorkbook: path.join(
      illumeDir,
      '9_File to build out slide deck_Fifth Third_Internal Value Statement_Illume Ag_2025_11_07.xlsx',
    ),
    valueStatementTemplate: path.join(illumeDir, '8_Bottomline_Internal_Value Statement.xlsx'),
    convertedTab: 'Fifth Third Converted',
    roiInputTab: 'Bottomline Data Converted',
    reviewedPricing: path.join(
      illumeDir,
      '7_Manually Reviewed Alteryx Results_IllumeAg_PricingOutput_MR.xlsx',
    ),
    pricingOutput: path.join(
      illumeDir,
      '6_Alteryx Pricing Workflow Results_IllumeAg_PricingOutput.xlsx',
    ),
    dealConfig: inRepo('engine', 'data', 'deal_53_illume.json'),
    top25VendorList: null,
    deliveredValueStatementName: 'Bottomline Internal Value Statement - Illume Ag.xlsx',
    deliveredRoiWorkbookName: 'Fifth Third Internal Value Statement - Illume Ag.xlsx',
    deliveredDeckName: 'Fifth Third Paymode ROI Slides - Illume Ag.pptx',
  },

  [DEAL_IDS.abg]: {
    dir: abgDir,
    vendorFile: path.join(
      abgDir,
      '1_Original Vendor File_Card_Comprehensive Payables AP Supplier Match Template_Update 5.15.26.xlsx',
    ),
    // This deal was delivered as workbooks only — the folder holds no PowerPoint.
    deckTemplate: null,
    deckSlideMap: null,
    roiWorkbook: path.join(
      abgDir,
      '9_BofA_External Value Model_Authentic Brands Group_2026_05_22_CompPay.xlsx',
    ),
    valueStatementTemplate: path.join(
      abgDir,
      '8_Bottomline_Internal_Value Statement_Authentic Brands Group_2026_05_22_CompPay.xlsx',
    ),
    convertedTab: 'BofA Data Converted',
    // BofA's external value model calls its input tab 'BT Converted'.
    roiInputTab: 'BT Converted',
    reviewedPricing: path.join(abgDir, '7_ABG_PricingOutput_MR.xlsx'),
    pricingOutput: path.join(abgDir, '6_ABG_PricingOutput (2).xlsx'),
    dealConfig: inRepo('engine', 'data', 'deal_bofa_abg.json'),
    top25VendorList: path.join(
      abgDir,
      'BofA+Card+Target+List_Authentic+Brands+Group_2026_05_22_CompPay.xlsx',
    ),
    deliveredValueStatementName:
      'Bottomline Internal Value Statement - Authentic Brands Group.xlsx',
    deliveredRoiWorkbookName: 'BofA External Value Model - Authentic Brands Group.xlsx',
    deliveredDeckName: null,
  },
};

export function getSourceFiles(dealId: string | undefined): DealSourceFiles | undefined {
  if (!dealId) return undefined;
  return SOURCES[dealId];
}

/** Deals whose source files are wired up for real engine runs. */
export const RUNNABLE_DEAL_IDS = Object.keys(SOURCES);

// ------------------------------------------------------------------
// Back-compat: the JPM paths, so existing imports keep working.
// ------------------------------------------------------------------
const jpm = SOURCES[DEAL_IDS.jpm];

export const DECK_TEMPLATE = jpm.deckTemplate as string;
export const ROI_WORKBOOK = jpm.roiWorkbook;
export const VALUE_STATEMENT_TEMPLATE = jpm.valueStatementTemplate;
export const REVIEWED_PRICING = jpm.reviewedPricing;
export const DEAL_CONFIG = jpm.dealConfig;
export const TOP25_VENDOR_LIST = jpm.top25VendorList as string;
export const DELIVERED_VALUE_STATEMENT_NAME = jpm.deliveredValueStatementName;
export const DELIVERED_ROI_WORKBOOK_NAME = jpm.deliveredRoiWorkbookName;
export const DELIVERED_DECK_NAME = jpm.deliveredDeckName as string;
