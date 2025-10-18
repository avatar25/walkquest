from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import enum
from .common import SensorSnapshot

class VerificationStatus(str, enum.Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    PASSED = "passed"
    FAILED = "failed"

class FailReasonCode(str, enum.Enum):
    GPS_OUT_OF_GEOFENCE = "GPS_OUT_OF_GEOFENCE"
    TIMESTAMP_DRIFT = "TIMESTAMP_DRIFT"
    VPS_UNAVAILABLE = "VPS_UNAVAILABLE"
    VPS_LOW_QUALITY = "VPS_LOW_QUALITY"
    VISION_MISMATCH = "VISION_MISMATCH"
    SCREEN_PHOTO_DETECTED = "SCREEN_PHOTO_DETECTED"
    ATTTESTATION_FAILED = "ATTTESTATION_FAILED"
    RATE_LIMIT = "RATE_LIMIT"
    UNKNOWN = "UNKNOWN"

class ProofCreate(BaseModel):
    questId: str
    sensorSnapshot: SensorSnapshot
    exifTimestamp: datetime
    appVersion: str
    device: dict  # {"model": str, "os": str}

class ProofResponse(BaseModel):
    proof: dict  # {"id": str, "createdAt": datetime}
    imageUpload: dict  # {"method": str, "url": str, "headers": dict}

class VerificationResponse(BaseModel):
    status: VerificationStatus
    scoreAwarded: int
    reasons: list[FailReasonCode]
    details: dict[str, str]
    
    class Config:
        from_attributes = True
