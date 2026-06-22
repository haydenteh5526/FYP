import re


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[dict]:
    """Split text into overlapping chunks with section detection."""
    if not text:
        return []

    # Detect sections by splitting on heading-like lines
    sections = _split_into_sections(text)

    chunks = []
    for section_title, section_text in sections:
        if len(section_text) <= chunk_size:
            chunks.append({"text": section_text.strip(), "section_title": section_title})
        else:
            start = 0
            while start < len(section_text):
                end = start + chunk_size
                chunk = section_text[start:end].strip()
                if chunk:
                    chunks.append({"text": chunk, "section_title": section_title})
                start = end - overlap

    return [c for c in chunks if c["text"]]


def _split_into_sections(text: str) -> list[tuple[str | None, str]]:
    """Split text into (heading, content) pairs."""
    lines = text.split("\n")
    sections = []
    current_title = None
    current_lines = []

    for line in lines:
        stripped = line.strip()
        if _is_heading(stripped):
            if current_lines:
                sections.append((current_title, "\n".join(current_lines)))
            current_title = stripped
            current_lines = []
        else:
            current_lines.append(line)

    if current_lines:
        sections.append((current_title, "\n".join(current_lines)))

    return sections if sections else [(None, text)]


def _is_heading(line: str) -> bool:
    """Detect if a line is likely a heading."""
    if not line or len(line) > 80:
        return False
    if line.isupper() and len(line) > 3:
        return True
    if re.match(r"^\d+[\.\)]\s+\w", line):
        return True
    if line.endswith(":") and len(line) < 50:
        return True
    return False
