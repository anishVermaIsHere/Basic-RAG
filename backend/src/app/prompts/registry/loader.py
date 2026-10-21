from functools import lru_cache
from pathlib import Path
from app.prompts.registry.definition import PROMPTS


PROMPTS_DIR = Path(__file__).resolve().parents[1] / "templates"


@lru_cache(maxsize=32)
def load_prompt(name: str) -> str:
    definition = PROMPTS.get(name)

    if definition is None:
        raise ValueError(f"Unknown prompt: {name}")

    filename = f"{definition.name}.md"
    prompt_path = (PROMPTS_DIR / filename).resolve()

    # Prevent paths outside the prompts directory.
    resolved_path = prompt_path.resolve()

    if not resolved_path.is_relative_to(PROMPTS_DIR.resolve()):
        raise ValueError("Invalid prompt path")

    if not resolved_path.is_file():
        raise FileNotFoundError(f"Prompt not found: {name}")

    return resolved_path.read_text(encoding="utf-8")