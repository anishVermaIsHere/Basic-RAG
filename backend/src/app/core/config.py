import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_CHAT_MODEL: str = os.getenv("OPENAI_CHAT_MODEL","openrouter/free") # gpt-4o-mini
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2") # text-embedding-3-small
    OPENROUTER_BASE_URL: str = os.getenv("OPENROUTER_BASE_URL", "")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")


settings = Settings()