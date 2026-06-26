import hashlib

import httpx
from openai import OpenAI

from app.config import settings

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1536

# Simple in-process cache: sha256(text) -> embedding
_cache: dict[str, list[float]] = {}


def _cache_key(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def get_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate embeddings via OpenAI, Ollama, or zero-vector fallback. Caches by content hash."""
    if not texts:
        return []

    # Resolve from cache where possible
    results: list[list[float] | None] = [None] * len(texts)
    uncached_idx: list[int] = []
    uncached_texts: list[str] = []
    for i, t in enumerate(texts):
        key = _cache_key(t)
        if key in _cache:
            results[i] = _cache[key]
        else:
            uncached_idx.append(i)
            uncached_texts.append(t)

    if uncached_texts:
        if settings.OPENAI_API_KEY:
            fresh = _openai_embeddings(uncached_texts)
        elif settings.OLLAMA_URL:
            fresh = _ollama_embeddings(uncached_texts)
        else:
            fresh = [[0.0] * EMBEDDING_DIM for _ in uncached_texts]
        for idx, emb in zip(uncached_idx, fresh):
            results[idx] = emb
            _cache[_cache_key(texts[idx])] = emb

    return [r if r is not None else [0.0] * EMBEDDING_DIM for r in results]


def get_embedding(text: str) -> list[float]:
    return get_embeddings([text])[0]


def _openai_embeddings(texts: list[str]) -> list[list[float]]:
    from app.services.retry import with_retry
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    response = with_retry(
        lambda: client.embeddings.create(input=texts, model=EMBEDDING_MODEL),
        label="openai.embeddings",
    )
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
