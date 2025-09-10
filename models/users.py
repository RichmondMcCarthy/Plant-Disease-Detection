from typing import Optional, Any
from pydantic import BaseModel, EmailStr, constr

# Login Schema
class Login(BaseModel):
    email: EmailStr
    password: constr(min_length=8)

class Register(BaseModel):
    email: EmailStr
    password: constr(min_length=8)
    first_name: Optional[str] = None
    last_name: Optional[str] = None

# Response Schema
class ResponseSchema(BaseModel):
    code: str
    status: str
    message: str
    result: Optional[Any] = None

# Token Schema
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
