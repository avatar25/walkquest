from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    user_id: Mapped[str] = mapped_column(String, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    display_name: Mapped[str] = mapped_column(String, nullable=True)
    avatar_url: Mapped[str] = mapped_column(String, nullable=True)
