
from app.pipeline import chunk_text

def test_chunk_text():
    text = "G" * 1000
    chunks = chunk_text(text, chunk_size=200, overlap=20)

    assert len(chunks) > 1
    assert all(len(chunk) <= 200 for chunk in chunks)


