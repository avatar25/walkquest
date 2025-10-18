import math
from datetime import datetime, timezone
from typing import List
from schemas.proof import FailReasonCode

class VerificationService:
    def __init__(self):
        pass
    
    def verify_proof(
        self,
        quest_lat: float,
        quest_lng: float,
        quest_radius_m: int,
        sensor_samples: List[dict],
        exif_timestamp: datetime,
        device_attestation: str = None
    ) -> dict:
        """Verify a proof submission with basic anti-cheat checks."""
        reasons = []
        score_awarded = 0
        details = {}
        
        # Check GPS within geofence
        if not self._check_gps_within_geofence(
            quest_lat, quest_lng, quest_radius_m, sensor_samples
        ):
            reasons.append(FailReasonCode.GPS_OUT_OF_GEOFENCE)
            details["tip"] = "Please ensure you're within the quest area"
        
        # Check timestamp drift
        timestamp_drift = self._check_timestamp_drift(sensor_samples, exif_timestamp)
        if timestamp_drift > 10.0:  # 10 seconds tolerance
            reasons.append(FailReasonCode.TIMESTAMP_DRIFT)
            details["timestampDriftSeconds"] = str(timestamp_drift)
        
        # Basic attestation check
        if not device_attestation:
            reasons.append(FailReasonCode.ATTTESTATION_FAILED)
        
        # If no reasons for failure, award points
        if not reasons:
            score_awarded = 30  # Default quest reward
            details["vpsQuality"] = "good"
            details["vision"] = "passed basic checks"
        
        return {
            "status": "passed" if not reasons else "failed",
            "scoreAwarded": score_awarded,
            "reasons": [reason.value for reason in reasons],
            "details": details
        }
    
    def _check_gps_within_geofence(
        self, 
        quest_lat: float, 
        quest_lng: float, 
        quest_radius_m: int, 
        sensor_samples: List[dict]
    ) -> bool:
        """Check if any sensor sample is within the geofence."""
        for sample in sensor_samples:
            if self._calculate_distance(
                quest_lat, quest_lng,
                sample["location"]["lat"], sample["location"]["lng"]
            ) <= quest_radius_m:
                return True
        return False
    
    def _calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate distance between two points in meters using Haversine formula."""
        R = 6371000  # Earth's radius in meters
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lng = math.radians(lng2 - lng1)
        
        a = (math.sin(delta_lat / 2) ** 2 + 
             math.cos(lat1_rad) * math.cos(lat2_rad) * 
             math.sin(delta_lng / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    def _check_timestamp_drift(self, sensor_samples: List[dict], exif_timestamp: datetime) -> float:
        """Check timestamp drift between EXIF and sensor samples."""
        if not sensor_samples:
            return 0.0
        
        # Get the latest sensor sample timestamp
        latest_sample_time = max(
            datetime.fromisoformat(sample["timestamp"].replace('Z', '+00:00'))
            for sample in sensor_samples
        )
        
        # Calculate drift in seconds
        drift = abs((latest_sample_time - exif_timestamp).total_seconds())
        return drift
