from openai import OpenAI

from app.config import settings

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1536


def get_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a list of texts via OpenAI API."""
    if not texts or not settings.OPENAI_API_KEY:
        return [[0.0] * EMBEDDING_DIM for _ in texts]

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    response = client.embeddings.create(input=texts, model=EMBEDDING_MODEL)
    return [item.embedding for item in response.data]


def get_embedding(text: str) -> list[float]:
    """Generate embedding for a single text."""
    return get_embeddings([text])[0]
