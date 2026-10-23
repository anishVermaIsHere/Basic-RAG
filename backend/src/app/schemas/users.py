from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID, uuid4


# User Schemas

class UserContact(BaseModel):
    phone: str | None = None
    address: str | None = None
    

class UserBase(BaseModel):
    first_name: str
    last_name: str
    # full_name: str
    # contact: UserContact
    email: EmailStr


class CreateUser(UserBase):
    password: str


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
