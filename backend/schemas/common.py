from pydantic import BaseModel
from typing import Optional

class ErrorResponse(BaseModel):
    error: dict

class GeoFence(BaseModel):
    center: dict  # {"lat": float, "lng": float}
    radiusMeters: int

class LatLng(BaseModel):
    lat: float
    lng: float

class SensorSample(BaseModel):
    timestamp: str  # ISO format
    location: LatLng
    horizontalAccuracy: float
    speedMps: Optional[float] = None
    headingDegrees: Optional[float] = None
    pitch: Optional[float] = None
    roll: Optional[float] = None
    yaw: Optional[float] = None

class SensorSnapshot(BaseModel):
    samples: list[SensorSample]
