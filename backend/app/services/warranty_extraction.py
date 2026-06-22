import re
from datetime import date


def extract_warranty_dates(text: str) -> dict | None:
    """Extract purchase_date and expiry_date from document text using regex patterns."""
    if not text:
        return None

    # Common date patterns
    date_pattern = r"(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})"
    dates = re.findall(date_pattern, text)

    # Look for warranty period keywords
    warranty_years = re.search(r"(\d+)\s*(?:year|yr)s?\s*(?:warranty|guarantee)", text, re.IGNORECASE)
    warranty_months = re.search(r"(\d+)\s*(?:month)s?\s*(?:warranty|guarantee)", text, re.IGNORECASE)

    purchase_date = None
    expiry_date = None

    # Try to parse the first date found as purchase date
    if dates:
        purchase_date = _parse_date(dates[0])

    # Calculate expiry from warranty period
    if purchase_date and warranty_years:
        years = int(warranty_years.group(1))
        expiry_date = date(purchase_date.year + years, purchase_date.month, purchase_date.day)
    elif purchase_date and warranty_months:
        months = int(warranty_months.group(1))
        expiry_date = date(purchase_date.year + months // 12, purchase_date.month + months % 12, purchase_date.day)

    if not purchase_date and not expiry_date:
        return None

    return {"purchase_date": purchase_date, "expiry_date": expiry_date}


def _parse_date(date_str: str) -> date | None:
    """Try common date formats."""
    for fmt in ("%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y", "%d.%m.%Y", "%d/%m/%y"):
        try:
            from datetime import datetime
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None
