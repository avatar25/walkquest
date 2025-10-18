from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List

from database import get_db
from models.proof import Proof
from models.proof import Verification

router = APIRouter(prefix="/v1/leaderboard", tags=["leaderboard"])

@router.get("")
async def get_leaderboard(
    scope: str = Query(default="city", description="Scope: city, global"),
    window: str = Query(default="weekly", description="Window: daily, weekly, monthly"),
    city: str = Query(default="BLR", description="City code"),
    db: AsyncSession = Depends(get_db)
):
    """Get leaderboard rankings with user context."""
    
    # Simplified leaderboard implementation for MVP
    # In production, you'd have proper user scoring and ranking logic
    
    # Mock data for demonstration
    mock_leaderboard = {
        "window": "2025-W42",
        "user": {"rank": 14, "points": 210},
        "neighbors": [
            {"rank": 10, "userId": "u_x", "name": "Riya", "points": 340},
            {"rank": 11, "userId": "u_y", "name": "Karthik", "points": 330},
            {"rank": 12, "userId": "u_z", "name": "Priya", "points": 320},
            {"rank": 13, "userId": "u_w", "name": "Arjun", "points": 280},
            {"rank": 14, "userId": "u_123", "name": "You", "points": 210},
            {"rank": 15, "userId": "u_a", "name": "Sara", "points": 190},
            {"rank": 16, "userId": "u_b", "name": "Mike", "points": 180}
        ]
    }
    
    return mock_leaderboard
