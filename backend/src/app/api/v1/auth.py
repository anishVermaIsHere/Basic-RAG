from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.auth import RegisterRequest, LoginRequest
from app.services.auth_service import AuthService
from app.core.config import Settings


JWT = Settings.JWT
    
router = APIRouter(prefix="/auth", tags=["Auth"])


auth_service = AuthService()

@router.post("/register", status_code=201)
async def register(user: RegisterRequest, res: Response, db: AsyncSession = Depends(get_db)):
    return await auth_service.register(user, db)


@router.post("/login")
async def login(user: LoginRequest, res: Response, db: AsyncSession = Depends(get_db)):
    auth_res = await auth_service.login(user, db)
    if not auth_res["success"]:
        return res
    if auth_res["access_token"]:
        res.set_cookie(
            key="_at", 
            value=auth_res["access_token"], 
            httponly=True,   # Protects against XSS attacks
            secure=False,     # Forces HTTPS
            samesite="lax",   # Protects against CSRF attacks
            max_age=int(JWT.ACCESS_TOKEN_EXPIRE_HOURS)*3600,
        )
        res.set_cookie(
            key="_rt", 
            value=auth_res["refresh_token"], 
            httponly=True,   # Protects against XSS attacks
            secure=False,     # Forces HTTPS
            samesite="lax",   # Protects against CSRF attacks
            max_age=int(JWT.REFRESH_TOKEN_EXPIRE_DAYS)*3600*24,
        )
    return { "success": auth_res["success"], "user": auth_res["user"] }


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="_at", path="/")
    response.delete_cookie(key="_rt", path="/")

    return {
        "message": "Logged out successfully",
        "success": True
    }

