from pydantic import BaseModel
from datetime import datetime

class UserCreate(BaseModel):
    display_name: str
    avatar_url: str | None = None

class UserResponse(BaseModel):
    user_id: str
    display_name: str | None
    avatar_url: str | None
    created_at: datetime
    
    class Config:
        from_attributes = True
