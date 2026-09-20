# ============================================================
#  Step 5 — Classification Review: industry override rules
#  Source of truth: user-provided list (2026-07-30). Two tiers:
#   - DOWNGRADE: move an existing Card/Premium/Network-match tier
#     down to the equivalent "Basic" tier.
#   - EXCLUDE: remove from card/network targeting entirely, and
#     reuse the Segment label Alteryx itself already uses for
#     that category so behavior stays consistent with upstream.
#  Only rows whose CURRENT Segment doesn't already reflect the
#  target category are changed (idempotent — don't re-flag vendors
#  Alteryx already classified correctly).
# ============================================================

DOWNGRADE_KEYWORDS = {
    "Association": ["ASSOCIATION", "ASSN", " SOCIETY", "COALITION"],
    "Insurance": ["INSURANCE", "INSUR CO", "LIFE INS"],
    "Liquor (manufacture/distribution)": [
        "LIQUOR", "DISTILLERY", "DISTILLERS", "BREWING", "BREWERY", "WINERY", "SPIRITS",
    ],
    "Property management / equipment rental": [
        "PROPERTY MANAGEMENT", "PROPERTY MGMT", "REALTY", "EQUIPMENT RENTAL", "EQUIP RENTAL",
        "RENTAL LLC", "LEASING CO", "LEASING INC",
    ],
    "Telecommunications / utility": [
        "ELECTRIC", "ELECTRIC COOPERATIVE", "ELECTRIC CO-OP", "UTILITY", "UTILITIES",
        "TELECOM", "MOBILITY", "WIRELESS", "COMMUNICATIONS", "GAS COMPANY", "WATER WORKS",
        "WATER DISTRICT", "POWER COOPERATIVE", "POWER CO",
    ],
    "Professional sports team": [
        "SPORTS CLUB", "ATHLETIC CLUB", "BASEBALL CLUB", "FOOTBALL CLUB", "BASKETBALL CLUB",
        "HOCKEY CLUB", "SPORTS FRANCHISE",
    ],
    "Railroad": ["RAILROAD", "RAILWAY", " RR CO", "RAIL LLC"],
}

# Exclusion categories map to the Segment label Alteryx's own taxonomy already
# uses for that bucket (confirmed against real File 6: 'Government', 'Individual',
# 'Foreign', 'Financial Institutions', 'Exclusion' all pre-exist as real values).
EXCLUDE_KEYWORDS = {
    "Financial Institutions": [
        "BANK", "CREDIT UNION", "SAVINGS", "THRIFT", " FCU", "LENDING", "FINANCIAL INC",
        "FINANCIAL CORP",
    ],
    "Government": [
        "CITY OF", "COUNTY OF", "STATE OF", "DEPARTMENT OF", "TREASURY", "COMPTROLLER",
        "INTERNAL REVENUE", "MUNICIPAL", "SCHOOL DISTRICT", "ISD ",
    ],
    "Internal payments": ["PETTY CASH", "PAYROLL", "EMPLOYEE REIMBURSEMENT"],
}

# Segment values that already represent one of the exclusion/downgrade buckets —
# used to skip rows Alteryx already classified correctly (idempotency).
ALREADY_EXCLUDED_SEGMENTS = {"Government", "Individual", "Foreign", "Financial Institutions", "Exclusion"}
ALREADY_BASIC_SEGMENTS_PREFIX = "Basic"

# Company-entity suffixes used by the (best-effort) "Individual" heuristic —
# a vendor name with NONE of these tokens and 2-3 words looks like a person's name.
COMPANY_TOKENS = [
    "INC", "LLC", "CO", "CORP", "LP", "LTD", "COMPANY", "L.P.", "L.L.C.", "PC", "PLLC",
    "GROUP", "ASSOCIATES", "PARTNERS", "SERVICES", "SOLUTIONS", "ENTERPRISES", "HOLDINGS",
]


def _contains_any(name: str, keywords: list) -> bool:
    upper = f" {name.upper()} "
    return any(kw.upper() in upper for kw in keywords)


def classify_override(vendor_name: str, country: str, current_segment: str):
    """Return (new_segment, reason) if an override applies, else (None, None).

    Precedence: exclusion checks first (country/keyword), then downgrade keywords.
    Idempotent: never "changes" a row that's already in its target bucket.
    """
    name = (vendor_name or "").strip()
    country = (country or "USA").strip().upper()
    segment = (current_segment or "").strip()

    if segment in ALREADY_EXCLUDED_SEGMENTS or segment.startswith(ALREADY_BASIC_SEGMENTS_PREFIX):
        return None, None

    # --- Exclusions ---
    if country not in ("USA", ""):
        return "Foreign", f"Non-US country code ({country})"

    for label, keywords in EXCLUDE_KEYWORDS.items():
        if _contains_any(name, keywords):
            return label, f"Vendor name matched {label} keyword rule"

    # --- Downgrades ---
    for label, keywords in DOWNGRADE_KEYWORDS.items():
        if _contains_any(name, keywords):
            target = "Basic Match" if "Match" in segment else "Basic Target"
            return target, f"{label} — downgraded from '{segment}'"

    return None, None
