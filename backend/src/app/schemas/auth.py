from uuid import UUID
from pydantic import BaseModel, EmailStr
from app.schemas.users import UserResponse


# ---------- Register ----------
class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str


class RegisterResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: EmailStr


# ---------- Login ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: UserResponse # or create_user.model_dump(exclude={"password"})