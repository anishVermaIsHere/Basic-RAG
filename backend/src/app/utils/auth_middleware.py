from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.utils.jwt import JWTService

PUBLIC_PATHS = {
    "/",
    "/docs",
    "/openapi.json",
    "/redoc",
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/auth/logout",
}


class AuthMiddleware(BaseHTTPMiddleware):
    """Reads the `_at` access-token cookie and exposes the payload as request.state.user."""

    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS" or request.url.path in PUBLIC_PATHS:
            return await call_next(request)

        token = request.cookies.get("_at")
        if not token:
            return JSONResponse(status_code=401, content={"detail": "Not authenticated"})

        try:
            payload = JWTService.verify_token(token)
        except Exception as err:
            return JSONResponse(status_code=401, content={"detail": str(err)})

        if payload.get("type") != "access":
            return JSONResponse(status_code=401, content={"detail": "Invalid token type"})

        request.state.user = payload
        return await call_next(request)
