from dataclasses import dataclass


@dataclass(frozen=True)
class PromptDefinition:
    name: str
    version: str
    required_variables: tuple[str, ...]


PROMPTS = {
    "answer_generation": PromptDefinition(
        name="answer_generation",
        version="v1",
        required_variables=("context", "question"),
    ),
    "query_rewriting": PromptDefinition(
        name="query_rewriting",
        version="v1",
        required_variables=("question",),
    ),
}