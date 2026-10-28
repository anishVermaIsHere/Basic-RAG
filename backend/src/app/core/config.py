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

    class REDIS:
        HOST: str = os.getenv("REDIS_HOST", "localhost")
        PORT: int = os.getenv("REDIS_PORT", 6379)
        ENABLED: bool = os.getenv("REDIS_ENABLED", "false").lower() == "true"

    class JWT:
        SECRET_KEY: str = os.getenv("JWT_SECRET_KEY")
        ALGORITHM: str = os.getenv("JWT_ALGORITHM","HS256")
        ACCESS_TOKEN_EXPIRE_HOURS: int = os.getenv("JWT_ACCESS_TOKEN_LIFETIME_HOURS", 8)
        REFRESH_TOKEN_EXPIRE_DAYS: int = os.getenv("JWT_REFRESH_TOKEN_LIFETIME_DAYS", 4)


    class CLOUDINARY: 
        API_KEY: str = os.getenv("CLOUDINARY_API_KEY")
        SECRET_KEY: str = os.getenv("CLOUDINARY_API_SEC_KEY")
        CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME")
        FOLDER: str = "look-rag/documents"
    



settings = Settings()