
from openai import OpenAI, AuthenticationError
from fastapi import HTTPException

from app.llm.llm_base import LLMProvider
from app.core.config import settings


class OpenAIProvider(LLMProvider):
    def __init__(self, model: str = "gpt-6-luna"):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = model

    def ask(self, message: str) -> str:
        try:
            response = self.client.responses.create(
                model=self.model,  # Make sure model name is correct (e.g. gpt-4o-mini)
                input=[
                    { 
                        "role": "user", 
                        "content": [
                            {
                                "type": "input_text",
                                "text": message
                            },
                        ] 
                    }
                ]
            )
            return response.output_text

        except AuthenticationError:
            raise HTTPException(
                status_code=502,
                detail="LLM provider authentication failed"
            )

    def stream(self, messages):
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                stream=True
            )

            for chunk in response:

                if not chunk.choices:
                    continue

                content = chunk.choices[0].delta.content

                if content:
                    yield content

        except AuthenticationError:
            raise HTTPException(
                status_code=502,
                detail="LLM provider authentication failed"
            )