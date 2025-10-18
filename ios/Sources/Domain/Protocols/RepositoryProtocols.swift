import Foundation

// MARK: - Repository Protocols
public protocol QuestRepository {
    func todaysQuests() async throws -> [Quest]
}

public protocol ProofRepository {
    func createProof(for quest: Quest, sensors: SensorSnapshot, exifTime: Date) async throws -> Proof
    func markImageUploaded(proofId: ProofID) async throws
    func verification(for proofId: ProofID) async throws -> VerificationResult
}

public protocol LeaderboardRepository {
    func getLeaderboard(scope: String, window: String, city: String) async throws -> LeaderboardData
}

// MARK: - Service Protocols
public protocol LocationService {
    func start() async
    func stop()
    func latestSamples(seconds: Double) async -> SensorSnapshot
}

public protocol CameraService {
    func takePhoto() async throws -> (data: Data, exifDate: Date)
}

public protocol AttestationService {
    func attestDevice() async throws -> String // token
}

// MARK: - Client Protocols
public protocol VerificationClient {
    func submit(proof: Proof, imageData: Data, idempotencyKey: String) async throws -> VerificationResult
    func poll(proofId: ProofID) async throws -> VerificationResult
}

public protocol ImageUploadClient {
    func upload(imageData: Data, to url: URL) async throws
}

// MARK: - Additional Models
public struct LeaderboardData: Codable {
    public let window: String
    public let user: UserRank
    public let neighbors: [UserRank]
    
    public init(window: String, user: UserRank, neighbors: [UserRank]) {
        self.window = window
        self.user = user
        self.neighbors = neighbors
    }
}

public struct UserRank: Codable {
    public let rank: Int
    public let userId: String?
    public let name: String
    public let points: Int
    
    public init(rank: Int, userId: String? = nil, name: String, points: Int) {
        self.rank = rank
        self.userId = userId
        self.name = name
        self.points = points
    }
}
