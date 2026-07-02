from abc import ABC, abstractmethod
from io import BytesIO

import pytesseract
from PIL import Image

from app.config import settings
from app.logging_config import get_logger

logger = get_logger("ocr")


class OCRBackend(ABC):
    @abstractmethod
    def extract_text(self, file_bytes: bytes, content_type: str) -> str:
        ...


class MistralBackend(OCRBackend):
    """Mistral OCR (Pixtral) — LLM-powered document understanding.

    Sends the document to Mistral's vision API which returns structured
    markdown with full text, headings, tables, and layout preserved.
    Dramatically faster and more accurate than Tesseract on complex documents.
    """

    def extract_text(self, file_bytes: bytes, content_type: str) -> str:
        import base64

        import httpx

        from app.services.retry import with_retry

        b64 = base64.standard_b64encode(file_bytes).decode("utf-8")
        mime = content_type or "application/pdf"

        # Use the document/image understanding endpoint
        if mime == "application/pdf":
            data_url = f"data:{mime};base64,{b64}"
        else:
            data_url = f"data:{mime};base64,{b64}"

        def _call():
            resp = httpx.post(
                "https://api.mistral.ai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "pixtral-large-latest",
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "image_url",
                                    "image_url": {"url": data_url},
                                },
                                {
                                    "type": "text",
                                    "text": (
                                        "Extract ALL text from this document. "
                                        "Preserve the structure: headings, paragraphs, tables, lists. "
                                        "Return only the extracted text content, no commentary."
                                    ),
                                },
                            ],
                        }
                    ],
                    "max_tokens": 16384,
                    "temperature": 0.1,
                },
                timeout=120,
            )
            resp.raise_for_status()
            return resp.json()

        logger.info("Mistral OCR: processing %s (%d bytes)", mime, len(file_bytes))
        result = with_retry(_call, label="mistral.ocr", attempts=2)
        text = result["choices"][0]["message"]["content"]
        logger.info("Mistral OCR: extracted %d chars", len(text))
        return text.strip()


class TesseractBackend(OCRBackend):
    def extract_text(self, file_bytes: bytes, content_type: str) -> str:
        if content_type == "application/pdf":
            return self._extract_from_pdf(file_bytes)
        image = Image.open(BytesIO(file_bytes))
        return pytesseract.image_to_string(image).strip()

    def _extract_from_pdf(self, file_bytes: bytes) -> str:
        from pdf2image import convert_from_bytes
        pages = convert_from_bytes(file_bytes)
        texts = [pytesseract.image_to_string(page).strip() for page in pages]
        return "\n\n".join(t for t in texts if t)


class TextractBackend(OCRBackend):
    def extract_text(self, file_bytes: bytes, content_type: str) -> str:
        import boto3
        client = boto3.client("textract", region_name=settings.AWS_REGION)
        response = client.detect_document_text(Document={"Bytes": file_bytes})
        lines = [
            block["Text"]
            for block in response["Blocks"]
            if block["BlockType"] == "LINE"
        ]
        return "\n".join(lines)


def get_ocr_backend() -> OCRBackend:
    if settings.OCR_BACKEND == "mistral" and settings.MISTRAL_API_KEY:
        return MistralBackend()
    if settings.OCR_BACKEND == "textract":
        return TextractBackend()
    return TesseractBackend()


def extract_text(file_bytes: bytes, content_type: str) -> str:
    backend = get_ocr_backend()
    return backend.extract_text(file_bytes, content_type)
