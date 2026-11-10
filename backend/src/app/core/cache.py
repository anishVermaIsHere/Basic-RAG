from redis.asyncio import Redis

from app.utils.redis import RedisCache, NoOpCache
from app.core.config import REDIS


redis_client: Redis | None = None

async def init_redis() -> Redis | None:
    global redis_client

    if not REDIS['ENABLED']:
        redis_client = None
        return None

    redis_client = RedisCache(
        host=REDIS["HOST"],
        port=REDIS["PORT"],
        decode_responses=True,
        max_connections=10
    )

    print("Redis initialized")
    return redis_client


async def get_redis() -> Redis:
    global redis_client
    if redis_client is None:
        return NoOpCache()
    
    return redis_client

async def close_redis() -> None:
    global redis_client
    if redis_client is None:
        return NoOpCache()

    await redis_client.close()
    print("Redis closed")

