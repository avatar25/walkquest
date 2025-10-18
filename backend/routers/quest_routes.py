from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime, timezone
import math

from database import get_db
from models.quest import Quest
from schemas.quest import QuestResponse, QuestListResponse
from schemas.common import GeoFence

router = APIRouter(prefix="/v1/quests", tags=["quests"])

@router.get("/today", response_model=QuestListResponse)
async def get_todays_quests(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    radius_km: float = Query(default=10.0, description="Search radius in kilometers"),
    db: AsyncSession = Depends(get_db)
):
    """Fetch active quests near the user location."""
    
    # Calculate search bounds
    lat_delta = radius_km / 111.0  # Rough conversion: 1 degree ≈ 111 km
    lng_delta = radius_km / (111.0 * math.cos(math.radians(lat)))
    
    # Query active quests within bounds
    stmt = select(Quest).where(
        Quest.active_from <= datetime.now(timezone.utc),
        Quest.active_to >= datetime.now(timezone.utc),
        Quest.center_lat >= lat - lat_delta,
        Quest.center_lat <= lat + lat_delta,
        Quest.center_lng >= lng - lng_delta,
        Quest.center_lng <= lng + lng_delta
    )
    
    result = await db.execute(stmt)
    quests = result.scalars().all()
    
    # Convert to response format
    quest_responses = []
    for quest in quests:
        quest_responses.append(QuestResponse(
            id=quest.quest_id,
            title=quest.title,
            kind=quest.kind,
            geofence=GeoFence(
                center={"lat": quest.center_lat, "lng": quest.center_lng},
                radiusMeters=quest.radius_m
            ),
            hint=quest.hint,
            rewardPoints=quest.reward_points,
            activeFrom=quest.active_from,
            activeTo=quest.active_to
        ))
    
    return QuestListResponse(quests=quest_responses)
