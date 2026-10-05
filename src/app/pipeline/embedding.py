from openai import OpenAI
from sentence_transformers import SentenceTransformer

from app.core.config import settings




class EmbeddingModel:
    def __init__(self, model_name: str = settings.EMBEDDING_MODEL):
        # Load a lightweight, high-performing local embedding model (runs completely free)
        self.model = SentenceTransformer(model_name)

    def get(self, text: str):
        # Generates the vector array locally
        vector = self.model.encode(text)
        return vector.tolist()  # Convert numpy array to standard Python list
        
    def embed(self, text: str) -> list[float]:
        # Generates the vector array locally
        vector = self.model.encode(text)
        return vector.tolist()  # Convert numpy array to standard Python list

    def embed_many(self, texts: list[str]) -> list[list[float]]:
        embeddings = self.model.encode(texts, batch_size=32, show_progress_bar=True)
        return embeddings.tolist()




# def create_embeddings(texts: list[str]) -> list[list[float]]:

#     if not texts:
#         return []

#     response = client.embeddings.create(
#         model=settings.OPENAI_EMBEDDING_MODEL,
#         input=texts,
#     )

#     return [
#         item.embedding
#         for item in response.data
#     ]