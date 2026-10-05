def chunk_text(text: str, chunk_size: int = 100, overlap: int = 50) -> list[str]:
    if not text:
        raise("text is missing")

    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than 0 and it's not acceptable")
    
    if overlap < 0:
        raise ValueError("overlap cannot be negative")
    
    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    chunks = []

    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start = end - overlap
    return chunks