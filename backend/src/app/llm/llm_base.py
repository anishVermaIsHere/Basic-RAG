from abc import ABC, abstractmethod


class LLMProvider(ABC):

    @abstractmethod
    def ask(self, message: str) -> str:
        pass

    @abstractmethod
    def stream(self, message: str):
        pass