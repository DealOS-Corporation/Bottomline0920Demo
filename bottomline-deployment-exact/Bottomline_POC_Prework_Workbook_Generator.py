from __future__ import annotations

from datetime import date
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
from xml.sax.saxutils import escape


OUTPUT_FILE = Path(__file__).with_name("Bottomline_POC_Data_Request_Template.xlsx")


def cell_ref(column_index: int, row_index: int) -> str:
    name = ""
    column = column_index
    while column:
        column, remainder = divmod(column - 1, 26)
        name = chr(65 + remainder) + name
    return f"{name}{row_index}"


def inline_string(value: object) -> str:
    text = "" if value is None else str(value)
    return f'<is><t xml:space="preserve">{escape(text)}</t></is>'


def worksheet_xml(rows: list[list[object]], widths: list[float] | None = None) -> str:
    max_columns = max((len(row) for row in rows), default=1)
    widths = widths or [18] * max_columns
    cols = "".join(
        f'<col min="{index}" max="{index}" width="{width}" customWidth="1"/>'
        for index, width in enumerate(widths[:max_columns], start=1)
    )
    row_xml = []
    for row_index, row in enumerate(rows, start=1):
        cells = []
        for column_index, value in enumerate(row, start=1):
            style = 1 if row_index == 1 else 0
            cells.append(
                f'<c r="{cell_ref(column_index, row_index)}" t="inlineStr" s="{style}">{inline_string(value)}</c>'
            )
        row_xml.append(f'<row r="{row_index}">{"".join(cells)}</row>')
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        f'<cols>{cols}</cols>'
        f'<sheetData>{"".join(row_xml)}</sheetData>'
        '<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>'
        '</worksheet>'
    )


tabs: list[tuple[str, list[list[object]], list[float]]] = []

tabs.append((
    "README",
    [
        ["Bottomline POC Data Request Workbook"],
        ["Purpose", "Provide a lightweight, client-safe data package for a 5-deal proof of concept."],
        ["Scope", "Five anonymized Salesforce Opportunities plus supporting Account, contact, requirement, and vendor payment data."],
        ["Data Handling", "Please remove or mask customer names, contacts, tax IDs, bank account numbers, and any sensitive financial identifiers before sharing."],
        ["Preferred Delivery", "One completed workbook, or separate Excel/CSV files using the same column headers."],
        ["Timing", "Please return at least 2 business days before the working session so the team can validate field mappings."],
        ["Generated", date.today().isoformat()],
        [],
        ["Tab", "Owner", "Required for POC", "Notes"],
        ["Salesforce_Opportunities", "Salesforce / Revenue Ops", "Yes", "One row per opportunity/deal."],
        ["Salesforce_Accounts", "Salesforce / Revenue Ops", "Yes", "One row per related account/customer."],
        ["Opportunity_Contacts", "Salesforce / Revenue Ops", "Recommended", "Use anonymized names/emails if needed."],
        ["Deal_Requirements", "Sales / Solution Consulting", "Yes", "Use known pain points, timelines, systems, and success criteria."],
        ["Client_Vendor_Payments", "Client AP / Treasury", "Yes", "Mock data is acceptable for the POC; 10-25 vendors per deal is sufficient."],
        ["Field_Definitions", "Bottomline", "Reference", "Explains required fields and acceptable formats."],
        ["Submission_Checklist", "All", "Reference", "Quick completeness checklist before sending."],
    ],
    [34, 28, 22, 78],
))

tabs.append((
    "Salesforce_Opportunities",
    [
        ["POC Deal ID", "Opportunity ID", "Opportunity Name", "Anonymized Customer Name", "Account ID", "Owner", "Channel / Bank Partner", "Stage", "Amount / ACV", "ARR", "Close Date", "Probability %", "Priority", "Primary Product", "Current Payment Process", "Source System", "ROI Deck Attached?", "Value Statement Attached?", "Notes"],
        ["POC-001", "006XX000001", "Customer A - AP Automation", "Customer A", "001XX000001", "Sarah Johnson", "Bank of America", "Proposal", "$254,600", "$254,600", "2026-03-15", "72%", "High", "AP Automation / Payer Pricing", "Mix of ACH, check, and wire", "Salesforce", "Yes", "Yes", "Example row; replace with anonymized client deal."],
        ["POC-002", "006XX000002", "Customer B - Cash Management Hub", "Customer B", "001XX000002", "Michael Chen", "US Bank", "Discovery", "$890,000", "$209,600", "2026-04-30", "55%", "High", "Global Cash Management", "Manual daily bank reporting", "Salesforce", "No", "No", "Use real or mock values for POC."],
        ["POC-003", "006XX000003", "Customer C - Business Payments Network", "Customer C", "001XX000003", "Emily Rodriguez", "Wells Fargo", "Business Case", "$1,200,000", "$315,000", "2026-05-20", "64%", "Medium", "Business Payments Network", "Check-heavy vendor payments", "Salesforce", "No", "Yes", "Keep customer anonymized."],
        ["POC-004", "006XX000004", "Customer D - Supplier Enablement", "Customer D", "001XX000004", "David Patel", "JPMorgan Chase", "Solution Review", "$485,000", "$180,000", "2026-06-10", "48%", "Medium", "Supplier Enablement", "Limited supplier card adoption", "Salesforce", "No", "No", "Include only fields available in Salesforce."],
        ["POC-005", "006XX000005", "Customer E - Treasury Automation", "Customer E", "001XX000005", "Nina Brooks", "PNC", "Proposal", "$650,000", "$220,000", "2026-06-28", "68%", "Critical", "Treasury Automation", "Spreadsheet-based cash visibility", "Salesforce", "Yes", "No", "Five deals is enough for the POC."],
    ],
    [14, 18, 34, 26, 18, 20, 24, 18, 16, 14, 14, 14, 12, 30, 34, 18, 18, 22, 44],
))

tabs.append((
    "Salesforce_Accounts",
    [
        ["POC Deal ID", "Account ID", "Anonymized Customer Name", "Industry", "Annual Revenue", "Employee Count", "Billing Country", "Billing State", "ERP / Accounting System", "Treasury System", "Banking Relationships", "Existing Bottomline Product?", "Notes"],
        ["POC-001", "001XX000001", "Customer A", "Manufacturing", "$1.2B", "4,500", "United States", "MA", "Oracle", "Kyriba", "Bank of America", "No", "Use account-level context from Salesforce where available."],
        ["POC-002", "001XX000002", "Customer B", "Technology", "$650M", "1,800", "United States", "CA", "NetSuite", "None", "US Bank; JPMorgan Chase", "No", "Mock values are acceptable for missing fields."],
        ["POC-003", "001XX000003", "Customer C", "Financial Services", "$2.4B", "6,200", "United States", "NY", "SAP", "FIS", "Wells Fargo", "Yes", "Avoid sharing real account hierarchy if sensitive."],
        ["POC-004", "001XX000004", "Customer D", "Retail", "$900M", "3,100", "United States", "IL", "Microsoft Dynamics", "None", "JPMorgan Chase", "No", "Include only what the team can comfortably share."],
        ["POC-005", "001XX000005", "Customer E", "Healthcare", "$1.8B", "8,000", "United States", "PA", "Workday Financials", "Kyriba", "PNC", "No", "Anonymized account context is sufficient."],
    ],
    [14, 18, 28, 22, 16, 16, 18, 14, 24, 18, 28, 24, 48],
))

tabs.append((
    "Opportunity_Contacts",
    [
        ["POC Deal ID", "Contact Role", "Anonymized Name", "Title", "Department", "Email Alias", "Decision Influence", "Known Priorities", "Notes"],
        ["POC-001", "Economic Buyer", "Contact A1", "VP Finance", "Finance", "contact-a1@example.com", "High", "Reduce invoice cycle time; prevent duplicate payments", "Use aliases or role names if names cannot be shared."],
        ["POC-001", "Technical Evaluator", "Contact A2", "Director AP Systems", "IT / Finance Ops", "contact-a2@example.com", "Medium", "Oracle integration; audit controls", "Optional but helpful for value statement language."],
        ["POC-002", "Business Sponsor", "Contact B1", "Treasury Director", "Treasury", "contact-b1@example.com", "High", "Real-time cash visibility; 13-week forecast", "One primary contact per deal is enough."],
        ["POC-003", "Procurement", "Contact C1", "Procurement Lead", "Procurement", "contact-c1@example.com", "Medium", "Supplier enrollment; payment mix", ""],
        ["POC-005", "Executive Sponsor", "Contact E1", "CFO", "Finance", "contact-e1@example.com", "High", "Working capital visibility; bank reporting", ""],
    ],
    [14, 22, 20, 28, 20, 26, 20, 46, 44],
))

tabs.append((
    "Deal_Requirements",
    [
        ["POC Deal ID", "Current Pain Points", "Target Outcome", "Systems to Integrate", "Data Available", "Known Constraints", "Timeline / Event Date", "Success Criteria", "Open Questions"],
        ["POC-001", "15,000+ invoices monthly; 40% manual entry; duplicate payments", "Reduce AP processing cost and improve rebate capture", "Oracle ERP; Salesforce", "Vendor payment extract; invoice volumes; Salesforce opp", "Data cleanup needed on vendor names", "Technical deep dive next week", "Quantified ROI and pricing recommendation", "Which transaction-count field is authoritative?"],
        ["POC-002", "12 bank accounts across 5 countries; manual daily cash consolidation", "Real-time cash visibility and forecasting", "NetSuite; bank portals", "Cash positions; bank account summary; Salesforce opp", "Multi-currency normalization", "Q2 go-live target", "Working demo of consolidated cash view", "Can sample balances be mocked?"],
        ["POC-003", "Check-heavy B2B payments; limited supplier segmentation", "Identify card/ACH/premium campaign targets", "SAP; Salesforce", "Vendor master; AP spend; payment method", "Restricted industry exclusions", "Business case review in May", "Vendor classification with confidence scores", "What exclusion rules should apply?"],
        ["POC-004", "Supplier enablement is manual; low card acceptance visibility", "Prioritize suppliers for outreach", "Dynamics; Salesforce", "Supplier list; historical payment method", "Incomplete email/contact fields", "June solution review", "Target supplier list and campaign rationale", "Which suppliers should be excluded?"],
        ["POC-005", "Spreadsheet-based cash visibility; slow bank reporting", "Automate treasury reporting and value statement", "Workday; Kyriba; Salesforce", "Cash reports; opportunity details", "Bank file format variability", "Executive review before quarter-end", "Executive-ready ROI/value statement", "Any legal language constraints?"],
    ],
    [14, 48, 44, 30, 42, 34, 24, 42, 42],
))

tabs.append((
    "Client_Vendor_Payments",
    [
        ["POC Deal ID", "Vendor ID", "Vendor Name Anonymized", "Vendor Category", "Payment Method", "Annual Spend", "Payment Count", "Average Payment Amount", "Payment Terms", "City", "State", "Country", "Tax ID Included?", "Bank Account Included?", "Card Eligible?", "Notes"],
        ["POC-001", "V-10001", "Vendor A", "Office Supplies", "ACH", "$245,000", "156", "$1,571", "Net 30", "Boston", "MA", "US", "No", "No", "Yes", "Example only; do not include bank account or tax ID for POC."],
        ["POC-001", "V-10002", "Vendor B", "Technology", "Wire", "$1,890,000", "89", "$21,236", "Net 45", "San Jose", "CA", "US", "No", "No", "Review", "High-spend vendor."],
        ["POC-002", "V-20001", "Vendor C", "Banking", "Wire", "$4,500,000", "24", "$187,500", "Net 15", "New York", "NY", "US", "No", "No", "No", "May be excluded from supplier campaign."],
        ["POC-003", "V-30001", "Vendor D", "Logistics", "Check", "$2,340,000", "312", "$7,500", "Net 60", "Miami", "FL", "US", "No", "No", "Yes", "Good candidate for payment conversion."],
        ["POC-004", "V-40001", "Vendor E", "Marketing Services", "ACH", "$123,000", "45", "$2,733", "Net 15", "Austin", "TX", "US", "No", "No", "Yes", "Optional sample row."],
        ["POC-005", "V-50001", "Vendor F", "Cloud Services", "ACH", "$456,000", "67", "$6,806", "Net 30", "Seattle", "WA", "US", "No", "No", "Yes", "Optional sample row."],
    ],
    [14, 14, 26, 24, 18, 16, 16, 22, 16, 18, 12, 12, 18, 22, 16, 50],
))

tabs.append((
    "Field_Definitions",
    [
        ["Tab", "Field", "Requirement", "Format / Example", "Why We Need It", "If Unavailable"],
        ["Salesforce_Opportunities", "Opportunity ID", "Required", "006XXXXXXXXXXXX", "Links Salesforce opportunity data to outputs and sync manifest.", "Use POC-001 style placeholder ID."],
        ["Salesforce_Opportunities", "Opportunity Name", "Required", "Customer A - AP Automation", "Names the deal in the POC workflow.", "Use anonymized descriptive name."],
        ["Salesforce_Opportunities", "Stage", "Required", "Discovery / Proposal / Business Case", "Controls deal context and next-step language.", "Use current best-known stage."],
        ["Salesforce_Opportunities", "Amount / ACV", "Required", "$254,600", "Feeds pricing, value statement, and Salesforce sync example.", "Use estimated amount."],
        ["Salesforce_Opportunities", "Close Date", "Required", "YYYY-MM-DD", "Used in Salesforce sync and timeline views.", "Use estimated close date."],
        ["Salesforce_Accounts", "Industry", "Recommended", "Manufacturing", "Supports classification, benchmark language, and pricing peer context.", "Use broad industry."],
        ["Deal_Requirements", "Current Pain Points", "Required", "Manual AP, duplicate payments", "Generates value statement and executive summary content.", "Use notes from discovery call."],
        ["Deal_Requirements", "Systems to Integrate", "Recommended", "Oracle; Salesforce", "Supports implementation assumptions.", "Mark Unknown."],
        ["Client_Vendor_Payments", "Annual Spend", "Required", "$245,000", "Feeds spend analysis, card opportunity, rebate, and ROI calculations.", "Use mock but realistic values."],
        ["Client_Vendor_Payments", "Payment Method", "Required", "ACH / Check / Wire / Card", "Supports payment conversion and campaign classification.", "Use Unknown if missing."],
        ["Client_Vendor_Payments", "Tax ID Included?", "Required", "No", "Confirms sensitive data has been excluded.", "Default to No for POC."],
        ["Client_Vendor_Payments", "Bank Account Included?", "Required", "No", "Confirms no banking details are shared for mock POC.", "Default to No for POC."],
    ],
    [28, 28, 18, 28, 70, 36],
))

tabs.append((
    "Submission_Checklist",
    [
        ["Checklist Item", "Required?", "Status", "Owner", "Notes"],
        ["Five Salesforce opportunities included", "Yes", "", "Salesforce / Revenue Ops", "One row per POC deal."],
        ["Customer/account names anonymized", "Yes", "", "All", "Use Customer A, Customer B, etc."],
        ["No tax IDs included", "Yes", "", "Client AP / Treasury", "Do not include EIN/TIN for POC."],
        ["No bank account or routing numbers included", "Yes", "", "Client AP / Treasury", "Use Yes/No indicator only."],
        ["Opportunity amount, stage, close date present", "Yes", "", "Salesforce / Revenue Ops", "Needed for Salesforce sync mockup."],
        ["Deal requirements / pain points completed", "Yes", "", "Sales / Solution Consulting", "Needed for value statement generation."],
        ["Vendor payment sample included", "Yes", "", "Client AP / Treasury", "Mock data acceptable; 10-25 vendors per deal is enough."],
        ["Files shared in Excel or CSV format", "Yes", "", "All", "Keep original headers where possible if using exports."],
        ["Known gaps listed", "Recommended", "", "All", "Unknowns are fine; call them out."],
    ],
    [46, 14, 14, 28, 70],
))


def build_workbook() -> None:
    workbook_sheets = "".join(
        f'<sheet name="{escape(name)}" sheetId="{index}" r:id="rId{index}"/>'
        for index, (name, _, _) in enumerate(tabs, start=1)
    )
    workbook_relationships = "".join(
        f'<Relationship Id="rId{index}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{index}.xml"/>'
        for index in range(1, len(tabs) + 1)
    )
    content_types = "".join(
        f'<Override PartName="/xl/worksheets/sheet{index}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        for index in range(1, len(tabs) + 1)
    )

    styles = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>
  <fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF16345E"/><bgColor indexed="64"/></patternFill></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>'''

    with ZipFile(OUTPUT_FILE, "w", ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  {content_types}
</Types>''')
        archive.writestr("_rels/.rels", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>''')
        archive.writestr("xl/workbook.xml", f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>{workbook_sheets}</sheets>
</workbook>''')
        archive.writestr("xl/_rels/workbook.xml.rels", f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  {workbook_relationships}
  <Relationship Id="rId{len(tabs) + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>''')
        archive.writestr("xl/styles.xml", styles)
        archive.writestr("docProps/core.xml", f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Bottomline POC Data Request Template</dc:title>
  <dc:creator>Bottomline</dc:creator>
  <cp:lastModifiedBy>Bottomline</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">{date.today().isoformat()}T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">{date.today().isoformat()}T00:00:00Z</dcterms:modified>
</cp:coreProperties>''')
        archive.writestr("docProps/app.xml", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Excel</Application>
</Properties>''')
        for index, (_, rows, widths) in enumerate(tabs, start=1):
            archive.writestr(f"xl/worksheets/sheet{index}.xml", worksheet_xml(rows, widths))


if __name__ == "__main__":
    build_workbook()
    print(f"Created {OUTPUT_FILE}")