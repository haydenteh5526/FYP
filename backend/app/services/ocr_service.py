from abc import ABC, abstractmethod
from io import BytesIO

import pytesseract
from PIL import Image

from app.config import settings


class OCRBackend(ABC):
    @abstractmethod
    def extract_text(self, file_bytes: bytes, content_type: str) -> str:
        ...


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
    if settings.OCR_BACKEND == "textract":
        return TextractBackend()
    return TesseractBackend()


def extract_text(file_bytes: bytes, content_type: str) -> str:
    backend = get_ocr_backend()
    return backend.extract_text(file_bytes, content_type)
