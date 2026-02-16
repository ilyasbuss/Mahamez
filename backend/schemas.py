from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
import datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: str

class UserOut(UserBase):
    id: int
    status: str
    
    class Config:
        from_attributes = True

class TokenUser(BaseModel):
    id: int
    email: str
    name: str
    role: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: TokenUser

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    role: str # 'planer' or 'mitarbeiter'

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class RegisterRequest(BaseModel):
    token: str
    initial_password: str
    new_password: str
    confirm_password: str
