from sqlalchemy import String, Integer, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base
from datetime import datetime
from typing import Optional

class Proof(Base):
    __tablename__ = "proofs"
    
    proof_id: Mapped[str] = mapped_column(String, primary_key=True)
    quest_id: Mapped[str] = mapped_column(String, ForeignKey("quests.quest_id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.user_id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    exif_ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    image_url: Mapped[str] = mapped_column(String, nullable=False)
    device_attestation: Mapped[str] = mapped_column(String, nullable=True)
    state: Mapped[str] = mapped_column(String, nullable=False, default="processing")  # processing|passed|failed
    
    # Relationships
    quest: Mapped["Quest"] = relationship("Quest")
    user: Mapped["User"] = relationship("User")
    verification: Mapped[Optional["Verification"]] = relationship("Verification", back_populates="proof", uselist=False)

class Verification(Base):
    __tablename__ = "verifications"
    
    proof_id: Mapped[str] = mapped_column(String, ForeignKey("proofs.proof_id"), primary_key=True)
    status: Mapped[str] = mapped_column(String, nullable=False)  # passed|failed
    reasons: Mapped[list] = mapped_column(JSON, nullable=False)  # ["VPS_LOW_QUALITY", ...]
    score_awarded: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    vps_quality: Mapped[str] = mapped_column(String, nullable=True)
    heading_delta_deg: Mapped[float] = mapped_column(nullable=True)
    gps_distance_m: Mapped[float] = mapped_column(nullable=True)
    vision_notes: Mapped[str] = mapped_column(String, nullable=True)
    processed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    proof: Mapped["Proof"] = relationship("Proof", back_populates="verification")
