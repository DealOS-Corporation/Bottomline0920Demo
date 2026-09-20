// ============================================================
//  Core intake validation — reads parsed rows, checks each field
//  against backend/rules.ts, and returns metrics + checks in the
//  same shape the frontend already renders (see lib/runData.ts).
//  Pure function, no framework/runtime dependency — easy to test.
// ============================================================
import { ParsedSheet } from './parseVendorFile';
import {
  FieldRule,
  MANDATORY_FIELDS,
  OPTIONAL_FIELDS,
  PAYMENT_DATE_FIELD,
  PAYMENT_TYPE_FIELD,
} from './rules';

export interface Metric {
  label: string;
  value: string;
  sub?: string;
}

export interface EmailDraft {
  to: string;
  subject: string;
  body: string;
}

export interface CheckResult {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
  action?: string;
  emailDraft?: EmailDraft;
}

export interface IntakeValidationResult {
  usable: boolean;
  metrics: Metric[];
  checks: CheckResult[];
}

/**
 * Locate a field by its canonical name or any of the aliases real banks use.
 * Matching ignores case and collapses whitespace, because header cells arrive
 * with stray padding (Fifth Third sends 'PAYMENT TYPE      (Check-ACH-WIRE-CARD)').
 */
function findField(headers: string[], field: FieldRule): string | undefined {
  const squash = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
  const wanted = [field.name, ...(field.aliases ?? [])].map(squash);
  return headers.find((h) => wanted.includes(squash(h)));
}

function countBlank(rows: Record<string, string>[], header: string): number {
  return rows.filter((r) => !r[header] || r[header].trim() === '').length;
}

function looksLikeDate(value: string): boolean {
  if (!value) return false;
  return !Number.isNaN(Date.parse(value));
}

function fieldId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** One check per mandatory field: fail if the column is missing, warn if some rows are blank, pass otherwise. */
function checkMandatoryField(field: FieldRule, headers: string[], rows: Record<string, string>[], issues: string[]): CheckResult {
  const header = findField(headers, field);
  if (!header) {
    issues.push(`"${field.name}" column is missing entirely (mandatory).`);
    return {
      id: fieldId(field.name),
      label: field.name,
      status: 'fail',
      detail: `Column not found in the uploaded file. ${field.rule}.`,
      action: `Ask the bank to resend the file with a "${field.name}" column.`,
    };
  }
  const blanks = countBlank(rows, header);
  if (blanks > 0) {
    issues.push(`"${field.name}" is missing a value on ${blanks} of ${rows.length} rows.`);
    return {
      id: fieldId(field.name),
      label: field.name,
      status: 'warn',
      detail: `${blanks} of ${rows.length} rows are missing a value for this mandatory field.`,
      action: `Ask the bank to fill in the missing "${field.name}" values (${blanks} rows).`,
    };
  }
  return {
    id: fieldId(field.name),
    label: field.name,
    status: 'pass',
    detail: `Present on all ${rows.length} rows.`,
  };
}

function checkPaymentDate(headers: string[], rows: Record<string, string>[]): CheckResult {
  const header = findField(headers, PAYMENT_DATE_FIELD);
  if (!header) {
    return {
      id: 'payment-date',
      label: 'Payment Date',
      status: 'warn',
      detail: 'Column not found — defaulting to a 12-month assumption per the usability rule. Not blocking.',
    };
  }
  const blanks = countBlank(rows, header);
  const nonBlankRows = rows.filter((r) => r[header] && r[header].trim() !== '');
  const badDates = nonBlankRows.filter((r) => !looksLikeDate(r[header])).length;
  if (blanks === 0 && badDates === 0) {
    return { id: 'payment-date', label: 'Payment Date', status: 'pass', detail: `Parses as a date on all ${rows.length} rows.` };
  }
  return {
    id: 'payment-date',
    label: 'Payment Date',
    status: 'warn',
    detail: `${blanks} rows blank, ${badDates} rows don't parse as a date. Not blocking — 12-month assumption still applies where needed.`,
  };
}

function checkPaymentType(headers: string[], rows: Record<string, string>[]): CheckResult {
  const header = findField(headers, PAYMENT_TYPE_FIELD);
  if (!header) {
    return {
      id: 'payment-type',
      label: 'Payment Type',
      status: 'pass',
      detail: 'Column not found — defaulting every row to Check until clarified. Optional, not blocking.',
    };
  }
  const blanks = countBlank(rows, header);
  if (blanks > 0) {
    return {
      id: 'payment-type',
      label: 'Payment Type',
      status: 'warn',
      detail: `${blanks} of ${rows.length} rows are missing a value — those rows default to Check. Optional, not blocking.`,
    };
  }
  return { id: 'payment-type', label: 'Payment Type', status: 'pass', detail: `Present on all ${rows.length} rows.` };
}

/** Optional fields never block usability, but a real gap is still worth flagging with a clarification ask. */
function checkOptionalField(field: FieldRule, headers: string[], rows: Record<string, string>[], issues: string[]): CheckResult {
  const header = findField(headers, field);
  if (!header) {
    return {
      id: fieldId(field.name),
      label: field.name,
      status: 'warn',
      detail: `Column not present. Optional — does not block usability.`,
    };
  }
  const blanks = countBlank(rows, header);
  if (blanks > 0) {
    issues.push(`"${field.name}" is missing a value on ${blanks} of ${rows.length} rows (optional, not blocking).`);
    return {
      id: fieldId(field.name),
      label: field.name,
      status: 'warn',
      detail: `${blanks} of ${rows.length} rows are missing a value. Optional — does not block usability.`,
      action: `Ask the bank to fill in the missing "${field.name}" values (${blanks} rows) — not blocking.`,
    };
  }
  return { id: fieldId(field.name), label: field.name, status: 'pass', detail: `Present on all ${rows.length} rows.` };
}

function periodCovered(headers: string[], rows: Record<string, string>[]): Metric {
  const header = findField(headers, PAYMENT_DATE_FIELD);
  if (!header) return { label: 'Period covered', value: 'Unknown', sub: 'Payment Date column missing — assuming 12 months' };

  const dates = rows
    .map((r) => r[header])
    .filter((v) => v && looksLikeDate(v))
    .map((v) => new Date(v).getTime());
  if (dates.length === 0) return { label: 'Period covered', value: 'Unknown', sub: 'No parseable dates — assuming 12 months' };

  const min = new Date(Math.min(...dates));
  const max = new Date(Math.max(...dates));
  const months = Math.max(1, Math.round((max.getTime() - min.getTime()) / (1000 * 60 * 60 * 24 * 30.4)));
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  return { label: 'Period covered', value: `${months} months`, sub: `${fmt(min)} – ${fmt(max)}` };
}

export function validateIntake(sheet: ParsedSheet): IntakeValidationResult {
  const { headers, rows } = sheet;
  const issues: string[] = [];

  const mandatoryChecks = MANDATORY_FIELDS.map((f) => checkMandatoryField(f, headers, rows, issues));
  const dateCheck = checkPaymentDate(headers, rows);
  const typeCheck = checkPaymentType(headers, rows);
  const optionalChecks = OPTIONAL_FIELDS.map((f) => checkOptionalField(f, headers, rows, issues));

  const checks: CheckResult[] = [...mandatoryChecks, dateCheck, typeCheck, ...optionalChecks];

  const usable = !mandatoryChecks.some((c) => c.status === 'fail');

  // One combined clarification email covering every open issue, attached to the first
  // check that actually needs one — mirrors how a real analyst would send a single email.
  const firstActionable = checks.find((c) => c.action);
  if (firstActionable && issues.length > 0) {
    firstActionable.emailDraft = {
      to: 'operations@jpmorganchase.com',
      subject: `Vendor payment file — ${issues.length} item${issues.length > 1 ? 's' : ''} need clarification`,
      body:
        'Hi team,\n\n' +
        `While processing the vendor payment file, we found ${issues.length} item(s) that need clarification:\n\n` +
        issues.map((i, idx) => `${idx + 1}. ${i}`).join('\n') +
        '\n\nCould you confirm or resend the affected data? Happy to send over the specific row list if useful.\n\n' +
        'Thanks,\nDealOS',
    };
  }

  const metrics: Metric[] = [
    { label: 'Payment rows', value: rows.length.toLocaleString('en-US') },
    { label: 'Columns detected', value: String(headers.length) },
    periodCovered(headers, rows),
  ];

  return { usable, metrics, checks };
}
