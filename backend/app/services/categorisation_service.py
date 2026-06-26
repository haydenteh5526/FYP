import json

from app.config import settings


class DocumentMetadata:
    def __init__(self, brand: str | None = None, model: str | None = None,
                 document_type: str | None = None, title: str | None = None):
        self.brand = brand
        self.model = model
        self.document_type = document_type
        self.title = title


def categorise_document(text: str) -> DocumentMetadata:
    """Extract brand, model, document type from document text using LLM."""
    if not text or not settings.OPENAI_API_KEY:
        return _fallback_categorise(text)

    from openai import OpenAI
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "Extract metadata from this document text. Return JSON only with these fields: "
                    "brand, model, document_type (e.g. 'User Manual', 'Quick Start Guide', 'Warranty Card'), "
                    "suggested_title. Use null for fields you cannot determine."
                ),
            },
            {"role": "user", "content": text[:1500]},
        ],
        temperature=0,
        response_format={"type": "json_object"},
    )

    try:
        data = json.loads(response.choices[0].message.content)
        return DocumentMetadata(
            brand=data.get("brand"),
            model=data.get("model"),
            document_type=data.get("document_type"),
            title=data.get("suggested_title"),
        )
    except (json.JSONDecodeError, AttributeError):
        return _fallback_categorise(text)


def _fallback_categorise(text: str) -> DocumentMetadata:
    """Simple keyword-based fallback when no LLM available."""
    if not text:
        return DocumentMetadata()

    text_lower = text.lower()

    # Detect common brands (match whole words to avoid false positives)
    brands = ["samsung", "dreo", "bosch", "siemens", "philips", "sony", "apple",
              "dell", "lenovo", "asus", "ikea", "dyson", "nikon", "canon",
              "xiaomi", "huawei", "panasonic", "sharp", "toshiba", "whirlpool", "lg", "hp"]
    import re
    brand = next((b.title() for b in brands if re.search(r'(?<![a-z])' + re.escape(b) + r'(?![a-z])', text_lower)), None)

    # Detect document type
    doc_type = None
    if "manual" in text_lower or "instruction" in text_lower:
        doc_type = "User Manual"
    elif "warranty" in text_lower or "guarantee" in text_lower:
        doc_type = "Warranty Card"
    elif "quick start" in text_lower or "setup" in text_lower:
        doc_type = "Quick Start Guide"
    elif "specification" in text_lower or "spec" in text_lower:
        doc_type = "Specification Sheet"

    return DocumentMetadata(brand=brand, document_type=doc_type)
