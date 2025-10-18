from pydantic import BaseModel
from datetime import datetime
from .common import GeoFence

class QuestResponse(BaseModel):
    id: str
    title: str
    kind: str  # 'landmark' | 'ambient'
    geofence: GeoFence
    hint: str | None
    rewardPoints: int
    activeFrom: datetime
    activeTo: datetime
    
    class Config:
        from_attributes = True

class QuestListResponse(BaseModel):
    quests: list[QuestResponse]
