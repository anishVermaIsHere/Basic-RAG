from openai import OpenAI
from sentence_transformers import SentenceTransformer

from app.core.config import settings


# Load a lightweight, high-performing local embedding model (runs completely free)
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

def get_embedding(text: str):
    # Generates the vector array locally
    vector = embedding_model.encode(text)
    return vector.tolist()  # Convert numpy array to standard Python list

client = OpenAI(api_key=settings.OPENROUTER_API_KEY)


def create_embedding(text: str) -> list[float]:
    # response = client.embeddings.create(
    #     model=settings.OPENAI_EMBEDDING_MODEL,
    #     input=text,
    # )

    # Generates the vector array locally
    vector = embedding_model.encode(text)
    return vector.tolist()  # Convert numpy array to standard Python list

    # return response.data[0].embedding


def create_embeddings(texts: list[str]) -> list[list[float]]:

    if not texts:
        return []

    response = client.embeddings.create(
        model=settings.OPENAI_EMBEDDING_MODEL,
        input=texts,
    )

    return [
        item.embedding
        for item in response.data
    ]