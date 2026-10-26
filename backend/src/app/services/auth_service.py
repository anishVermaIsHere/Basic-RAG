
import json

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from uuid import uuid4
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession



from app.db.models import User
from app.utils.security import SecurePassword
from app.utils.jwt import JWTService
from app.utils.redis import Cache
from app.schemas.auth import RegisterRequest, LoginRequest, RegisterResponse, LoginResponse
from app.schemas.users import UserResponse




class AuthService():
    @staticmethod # it rejects self param
    async def register(payload: RegisterRequest, db: AsyncSession) -> RegisterResponse:
        # Check if user already exists
        result = await db.execute(select(User).where(User.email == payload.email))
        user = result.scalar_one_or_none()

        if user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already exist",
            )
        secure_password = SecurePassword()

        # Create new user
        new_user = User(
            first_name=payload.first_name,
            last_name=payload.last_name,
            full_name=f'{payload.first_name} {payload.last_name}',
            email=payload.email,
            password=secure_password.hash_pwd(payload.password)  # setting hash password
        )

        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        return {
            "id": new_user.id,
            "first_name": new_user.first_name,
            "last_name": new_user.last_name,
            "email": new_user.email,
            "password": new_user.password,
            "contact": new_user.contact
        }
    
    async def login(self, payload: LoginRequest, db: AsyncSession) -> LoginResponse:
        # Check user
        # Verify password
        # Generate JWT

        result = await db.execute(select(User).where(User.email == payload.email))
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User does not exist",
            )

        secure_pwd = SecurePassword()
        is_password_matched = secure_pwd.verify_pwd(payload.password, user.password)

        if not is_password_matched:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        jwt_service = JWTService()

        access_token = jwt_service.create_token(user.id, "access")
        refresh_token = jwt_service.create_token(user.id, "refresh")

        return {
            "success": True,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": UserResponse.model_validate(user)
        }

    async def self(self, req: Request, db: AsyncSession, redis: Cache):
        current_user = req.state.user
        user_id = current_user.get('sub')
        user_cache_key = f"user:profile:{user_id}"

        cached_user = await redis.get(user_cache_key)

        if cached_user:
            return { "authenticated": True, "user": json.loads(cached_user) }

        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        user_data = {
            column.name: getattr(user, column.name)
            for column in user.__table__.columns
        }
        user_data.pop("password", None)  
        user_data.pop("created_at", None)
        safe_user_data = jsonable_encoder(user_data)

        await redis.set(user_cache_key, json.dumps(safe_user_data), expire=600)

        return {"authenticated": True, "user": safe_user_data }
        