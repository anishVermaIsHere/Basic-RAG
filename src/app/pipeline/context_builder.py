

def context_build(chunks):
    parts = []
    print(":DATA:", chunks)
    for chunk in chunks:
        parts.append(
            f"[Source {chunk['chunk_index']}]\n"
            f"{chunk['content']}"
        )

    return "\n\n".join(parts)
