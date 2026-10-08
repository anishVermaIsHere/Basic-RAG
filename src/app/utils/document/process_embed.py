import numpy as np
from app.services import EmbeddingService

embedding_service = EmbeddingService()

def process_embed(texts):
    vecs = []
    for i in range(0, len(texts), 100): # batch of 100
        data = embedding_service.embed_many(texts[i:i+100])
        # vecs += [d.embedding for d in r.data]
        vecs.append(data)

    V = np.array(data, dtype=np.float32)
    res = V / np.linalg.norm(V, axis=1, keepdims=True)
    print("Vectors", res)

    safe_vecs = vecs.tolist() if hasattr(vecs, "tolist") else vecs

    return {
        "original": safe_vecs,
        "V": res
    }

    # return V / np.linalg.norm(V, axis=1, keepdims=True)