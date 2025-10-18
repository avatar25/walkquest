from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
import uuid

from database import get_db
from models.proof import Proof, Verification
from models.quest import Quest
from models.user import User
from schemas.proof import ProofCreate, ProofResponse, VerificationResponse
from services.s3_service import S3Service
from services.verification_service import VerificationService

router = APIRouter(prefix="/v1/proofs", tags=["proofs"])

# Initialize services
s3_service = S3Service()
verification_service = VerificationService()

@router.post("", response_model=ProofResponse)
async def create_proof(
    proof_data: ProofCreate,
    authorization: str = Header(..., alias="Authorization"),
    x_device_attestation: str = Header(default=None, alias="X-Device-Attestation"),
    db: AsyncSession = Depends(get_db)
):
    """Create a proof record and return signed upload URL."""
    
    # Extract user ID from Bearer token (simplified for MVP)
    # In production, you'd validate the JWT token
    user_id = "user_123"  # Placeholder
    
    # Generate proof ID
    proof_id = f"p_{uuid.uuid4().hex[:12]}"
    
    # Get quest details
    quest_stmt = select(Quest).where(Quest.quest_id == proof_data.questId)
    quest_result = await db.execute(quest_stmt)
    quest = quest_result.scalar_one_or_none()
    
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    
    # Generate S3 presigned URL
    upload_info = s3_service.generate_presigned_upload_url(proof_id)
    
    # Create proof record
    proof = Proof(
        proof_id=proof_id,
        quest_id=proof_data.questId,
        user_id=user_id,
        exif_ts=proof_data.exifTimestamp,
        image_url=upload_info["image_url"],
        device_attestation=x_device_attestation,
        state="processing"
    )
    
    db.add(proof)
    await db.commit()
    
    return ProofResponse(
        proof={
            "id": proof_id,
            "createdAt": proof.created_at.isoformat()
        },
        imageUpload={
            "method": upload_info["method"],
            "url": upload_info["url"],
            "headers": upload_info["headers"]
        }
    )

@router.post("/{proof_id}/submit")
async def submit_proof(
    proof_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Trigger verification pipeline for a proof."""
    
    # Get proof record
    proof_stmt = select(Proof).where(Proof.proof_id == proof_id)
    proof_result = await db.execute(proof_stmt)
    proof = proof_result.scalar_one_or_none()
    
    if not proof:
        raise HTTPException(status_code=404, detail="Proof not found")
    
    # Update proof state to processing
    proof.state = "processing"
    await db.commit()
    
    # Start verification process (simplified for MVP)
    # In production, this would queue a background job
    await process_verification(proof_id, db)
    
    return {
        "status": "processing",
        "nextPollAfterMs": 1500
    }

@router.get("/{proof_id}/verification", response_model=VerificationResponse)
async def get_verification_status(
    proof_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get verification status for a proof."""
    
    # Get verification record
    verification_stmt = select(Verification).where(Verification.proof_id == proof_id)
    verification_result = await db.execute(verification_stmt)
    verification = verification_result.scalar_one_or_none()
    
    if not verification:
        # If no verification record exists, return processing status
        return VerificationResponse(
            status="processing",
            scoreAwarded=0,
            reasons=[],
            details={"message": "Verification in progress"}
        )
    
    return VerificationResponse(
        status=verification.status,
        scoreAwarded=verification.score_awarded,
        reasons=verification.reasons,
        details={
            "vpsQuality": verification.vps_quality or "unknown",
            "vision": verification.vision_notes or "pending"
        }
    )

async def process_verification(proof_id: str, db: AsyncSession):
    """Process verification for a proof (simplified implementation)."""
    
    # Get proof with quest details
    proof_stmt = select(Proof).join(Quest).where(Proof.proof_id == proof_id)
    proof_result = await db.execute(proof_stmt)
    proof = proof_result.scalar_one_or_none()
    
    if not proof:
        return
    
    # Simulate sensor samples from the proof creation request
    # In production, you'd store and retrieve actual sensor data
    sensor_samples = [
        {
            "timestamp": proof.exif_ts.isoformat(),
            "location": {"lat": proof.quest.center_lat, "lng": proof.quest.center_lng},
            "horizontalAccuracy": 5.0
        }
    ]
    
    # Run verification
    verification_result = verification_service.verify_proof(
        quest_lat=proof.quest.center_lat,
        quest_lng=proof.quest.center_lng,
        quest_radius_m=proof.quest.radius_m,
        sensor_samples=sensor_samples,
        exif_timestamp=proof.exif_ts,
        device_attestation=proof.device_attestation
    )
    
    # Create verification record
    verification = Verification(
        proof_id=proof_id,
        status=verification_result["status"],
        reasons=verification_result["reasons"],
        score_awarded=verification_result["scoreAwarded"],
        vps_quality=verification_result["details"].get("vpsQuality"),
        vision_notes=verification_result["details"].get("vision")
    )
    
    # Update proof state
    proof.state = verification_result["status"]
    
    db.add(verification)
    await db.commit()
