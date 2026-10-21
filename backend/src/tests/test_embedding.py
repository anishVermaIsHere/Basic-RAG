
from pathlib import Path

from app.pipeline import chunk_text
from app.pipeline import EmbeddingModel


def test_embed_text():
    file = Path("src/app/data/documents/test-document.txt")
    text = file.read_text(encoding="utf-8") 
    print(text)
    chunks = chunk_text(text)

    embedding_model = EmbeddingModel()
    embeddings = embedding_model.embed_many(chunks)

    assert len(chunks) == len(embeddings)


