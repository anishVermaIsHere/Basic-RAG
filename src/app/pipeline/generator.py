from openai import AsyncOpenAI

from app.core.config import settings


class Generator:

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def generate(
        self,
        question: str,
        context: str,
    ) -> str:

        prompt = f"""
            You are a helpful AI assistant.

            Answer the user's question using the provided context.

            Rules:
            - Use the context to answer the question.
            - Do not make up information.
            - If the answer is not available in the context, say:
            "I don't have enough information to answer this question."

            Context:
            {context}

            Question:
            {question}
        """

        response = await self.client.responses.create(
            model="gpt-6-luna",
            input=prompt,
        )

        return response.output_text