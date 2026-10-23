from redis.asyncio import Redis
from typing import Protocol




class Cache(Protocol):
    async def get(self, key: str):
        ...

    async def set(self, key: str, value: str, expire: int | None = None):
        ...

    async def delete(self, key: str):
        ...


class RedisCache(Redis):
    pass

class NoOpCache:
    async def get(self, key: str):
        return None

    async def set(self, key: str, value: str, expire: int | None = None, **kwargs):
        return True

    async def delete(self, key: str):
        return True