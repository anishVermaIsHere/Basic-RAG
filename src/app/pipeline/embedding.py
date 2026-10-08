# from openai import OpenAI
# from sentence_transformers import SentenceTransformer

# from app.core.config import settings




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