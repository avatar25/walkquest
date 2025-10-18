from sqlalchemy import String, Integer, DateTime, Float, func
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base
from datetime import datetime

class Quest(Base):
    __tablename__ = "quests"
    
    quest_id: Mapped[str] = mapped_column(String, primary_key=True)
    kind: Mapped[str] = mapped_column(String, nullable=False)  # 'landmark' | 'ambient'
    center_lat: Mapped[float] = mapped_column(Float, nullable=False)
    center_lng: Mapped[float] = mapped_column(Float, nullable=False)
    radius_m: Mapped[int] = mapped_column(Integer, nullable=False)
    hint: Mapped[str] = mapped_column(String, nullable=True)
    reward_points: Mapped[int] = mapped_column(Integer, nullable=False)
    active_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    active_to: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
