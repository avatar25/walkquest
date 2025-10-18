import Foundation

// MARK: - Sensor Models
public struct SensorSample: Codable, Equatable {
    public let timestamp: Date
    public let location: LatLng
    public let horizontalAccuracy: Double
    public let speedMps: Double?
    public let headingDegrees: Double?
    public let pitch: Double?
    public let roll: Double?
    public let yaw: Double?
    
    public init(
        timestamp: Date,
        location: LatLng,
        horizontalAccuracy: Double,
        speedMps: Double? = nil,
        headingDegrees: Double? = nil,
        pitch: Double? = nil,
        roll: Double? = nil,
        yaw: Double? = nil
    ) {
        self.timestamp = timestamp
        self.location = location
        self.horizontalAccuracy = horizontalAccuracy
        self.speedMps = speedMps
        self.headingDegrees = headingDegrees
        self.pitch = pitch
        self.roll = roll
        self.yaw = yaw
    }
}

public struct SensorSnapshot: Codable, Equatable {
    public let samples: [SensorSample]
    
    public init(samples: [SensorSample]) {
        self.samples = samples
    }
}

// MARK: - Verification Models
public enum VerificationStatus: String, Codable {
    case queued, processing, passed, failed
}

public enum FailReasonCode: String, Codable {
    case GPS_OUT_OF_GEOFENCE
    case TIMESTAMP_DRIFT
    case VPS_UNAVAILABLE
    case VPS_LOW_QUALITY
    case VISION_MISMATCH
    case SCREEN_PHOTO_DETECTED
    case ATTTESTATION_FAILED
    case RATE_LIMIT
    case UNKNOWN
}

public struct VerificationResult: Codable {
    public let proofId: ProofID
    public let status: VerificationStatus
    public let scoreAwarded: Int
    public let reasons: [FailReasonCode]
    public let details: [String: String] // diagnostic crumbs
    
    public init(
        proofId: ProofID,
        status: VerificationStatus,
        scoreAwarded: Int,
        reasons: [FailReasonCode],
        details: [String: String]
    ) {
        self.proofId = proofId
        self.status = status
        self.scoreAwarded = scoreAwarded
        self.reasons = reasons
        self.details = details
    }
}

public struct Proof: Codable {
    public let id: ProofID
    public let questId: QuestID
    public let userId: UserID
    public let createdAt: Date
    public let imageUploadUrl: URL
    public let sensors: SensorSnapshot
    public let exifTimestamp: Date
    
    public init(
        id: ProofID,
        questId: QuestID,
        userId: UserID,
        createdAt: Date,
        imageUploadUrl: URL,
        sensors: SensorSnapshot,
        exifTimestamp: Date
    ) {
        self.id = id
        self.questId = questId
        self.userId = userId
        self.createdAt = createdAt
        self.imageUploadUrl = imageUploadUrl
        self.sensors = sensors
        self.exifTimestamp = exifTimestamp
    }
}
