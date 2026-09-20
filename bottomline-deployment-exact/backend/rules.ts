// ============================================================
//  Step 1 — Intake & File Check business rules
//  Mirrors the "Is the file usable?" node in Paymode_Process_Map.html:
//  a file is usable when the mandatory fields below are present,
//  Payment Date can fall back to a 12-month assumption, and a
//  missing Payment Type defaults to "Check" until clarified.
// ============================================================

export interface FieldRule {
  /** Canonical field name as it appears in the real vendor file header row. */
  name: string;
  action: 'Mandatory' | 'Optional';
  rule: string;
  /**
   * Other header names that mean the same thing. Every bank labels its columns
   * differently, so these were taken from the real File 1 of each POC deal
   * rather than invented: JPM sends 'Vendor Name', BofA sends 'Merchant Name',
   * Fifth Third sends 'MERCHANT NAME'. Matching is case-insensitive.
   */
  aliases?: string[];
}

export const MANDATORY_FIELDS: FieldRule[] = [
  {
    name: 'Vendor Name',
    action: 'Mandatory',
    rule: 'Field exists, and the values look like vendor names rather than IDs, dates, or comments',
    aliases: ['Merchant Name', 'Supplier Name', 'Payee Name'],
  },
  {
    name: 'Payment Amt',
    action: 'Mandatory',
    rule: 'Field exists, and the values are numeric payment amounts',
    aliases: ['Total Spend', 'Spend (rolling 12 months)', 'Spend', 'Annual Spend', 'Payment Amount'],
  },
  {
    name: 'Address Line 1',
    action: 'Mandatory',
    rule: 'Field exists, and the values look like a street or remittance line',
    aliases: ['Address', 'Street Address', 'Remit Address', 'Remittance Line 1'],
  },
  {
    name: 'City',
    action: 'Mandatory',
    rule: 'Field exists, and the values look like city names',
    aliases: ['Remit City'],
  },
  {
    name: 'State',
    action: 'Mandatory',
    rule: 'Field exists, and the values look like state codes or state names',
    aliases: ['State Codes', 'State Code', 'Remit State'],
  },
];

/** Special-cased: missing entirely is allowed if a clear 12-month period can be assumed. */
export const PAYMENT_DATE_FIELD: FieldRule = {
  name: 'Payment Date',
  action: 'Mandatory',
  rule: 'Field exists, and the values behave like real dates, or there is a clear 12-month assumption if missing',
  aliases: ['Last Date Paid', 'Payment Dt'],
};

/** Special-cased: missing entirely defaults to "Check" rather than blocking. */
export const PAYMENT_TYPE_FIELD: FieldRule = {
  name: 'Payment Type',
  action: 'Optional',
  rule: 'Field exists, and the values look like real payment methods such as Check, ACH, or Wire Transfer. If the field is missing, default to Check until clarified',
  aliases: ['Payment Type      (Check-ACH-WIRE-CARD)', 'Payment Method'],
};

export const OPTIONAL_FIELDS: FieldRule[] = [
  {
    name: 'Vendor',
    action: 'Optional',
    rule: 'Field exists, and the values look like a client-side vendor ID or vendor code',
    aliases: ['Vendor ID', 'Vendor ID                 (FROM YOUR ERP)  IF USED'],
  },
  { name: 'Bank Account', action: 'Optional', rule: 'If this column is present, the values should look like an internal bank account field and not be mixed with other data' },
  {
    name: 'ZIP',
    action: 'Optional',
    rule: 'Field exists, and the values look like postal codes',
    aliases: ['Postal Code', 'Zip Code'],
  },
  {
    name: 'TIN#',
    action: 'Optional',
    rule: 'If this column is present, the values should look like a tax identifier',
    aliases: ['Tax ID', 'TIN', 'Federal Tax ID'],
  },
];

/** Every field name we know how to check — used to pick the right sheet out of a multi-sheet workbook. */
export const KNOWN_FIELD_NAMES: string[] = [
  ...MANDATORY_FIELDS,
  PAYMENT_DATE_FIELD,
  PAYMENT_TYPE_FIELD,
  ...OPTIONAL_FIELDS,
].flatMap((f) => [f.name, ...(f.aliases ?? [])]);
