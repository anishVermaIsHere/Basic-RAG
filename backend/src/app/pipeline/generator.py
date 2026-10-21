from openai import AsyncOpenAI

from app.core.config import settings
from app.prompts.registry.loader import load_prompt
from app.core.config import settings

class Generator:

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.prompt_template = load_prompt("answer_generation")


    async def generate(self, question: str, context: str) -> str:
        prompt = self.prompt_template.format(context=context, question=question)

        response = await self.client.responses.create(
            model=settings.OPENAI_CHAT_MODEL,
            input=prompt,
        )

        return response.output_text