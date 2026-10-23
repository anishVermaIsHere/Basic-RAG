import json
import uuid
from fastapi.responses import StreamingResponse



def generate_chat_title(content: str) -> str:
    title = content.strip()

    if len(title) > 50:
        title = title[:50].rsplit(" ", 1)[0] + "..."

    return title


def convert_messages(messages):

    result = []

    for message in messages:

        text = "".join(
            part["text"]
            for part in message["parts"]
            if part["type"] == "text"
        )

        result.append({
            "role": message["role"],
            "content": text
        })

    return result