from app.llm.llm_base import LLMProvider 


class LLMService():
    def __init__(self, provider: LLMProvider):
       self.provider = provider

    def ask(self, message: str) -> str:
        return self.provider.ask(message)

    def stream(self, message: str):
        return self.provider.stream(message)
