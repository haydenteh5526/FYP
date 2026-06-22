import httpx
from openai import OpenAI

from app.config import settings

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1536


def get_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate embeddings via OpenAI, Ollama, or zero-vector fallback."""
    if not texts:
        return []

    if settings.OPENAI_API_KEY:
        return _openai_embeddings(texts)
    elif settings.OLLAMA_URL:
        return _ollama_embeddings(texts)
    else:
        return [[0.0] * EMBEDDING_DIM for _ in texts]


def get_embedding(text: str) -> list[float]:
    return get_embeddings([text])[0]


def _openai_embeddings(texts: list[str]) -> list[list[float]]:
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    response = client.embeddings.create(input=texts, model=EMBEDDING_MODEL)
    return [item.embedding for item in response.data]


def _ollama_embeddings(texts: list[str]) -> list[list[float]]:
    results = []
    for text in texts:
        resp = httpx.post(f"{settings.OLLAMA_URL}/api/embeddings", json={
            "model": "nomic-embed-text", "prompt": text
        }, timeout=30)
        if resp.status_code == 200:
            embedding = resp.json().get("embedding", [0.0] * EMBEDDING_DIM)
            # Pad/truncate to EMBEDDING_DIM
            embedding = (embedding + [0.0] * EMBEDDING_DIM)[:EMBEDDING_DIM]
            results.append(embedding)
        else:
            results.append([0.0] * EMBEDDING_DIM)
    return results
