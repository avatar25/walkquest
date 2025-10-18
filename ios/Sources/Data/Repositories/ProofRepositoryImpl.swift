import Foundation
import WalkQuestDomain
import WalkQuestShared

public class ProofRepositoryImpl: ProofRepository {
    private let httpClient: HTTPClient
    private let baseURL: URL
    
    public init(httpClient: HTTPClient, baseURL: URL) {
        self.httpClient = httpClient
        self.baseURL = baseURL
    }
    
    public func createProof(for quest: Quest, sensors: SensorSnapshot, exifTime: Date) async throws -> Proof {
        // Mock implementation for MVP
        let proofId = ProofID(raw: "p_\(UUID().uuidString.prefix(12))")
        let userId = UserID(raw: "user_123")
        
        // Create mock S3 URL
        let imageUrl = URL(string: "https://mock-s3.amazonaws.com/proofs/\(proofId.raw).jpg")!
        
        let proof = Proof(
            id: proofId,
            questId: quest.id,
            userId: userId,
            createdAt: Date(),
            imageUploadUrl: imageUrl,
            sensors: sensors,
            exifTimestamp: exifTime
        )
        
        return proof
    }
    
    public func markImageUploaded(proofId: ProofID) async throws {
        // Mock implementation - in production this would update the database
        print("Marked proof \(proofId.raw) as uploaded")
    }
    
    public func verification(for proofId: ProofID) async throws -> VerificationResult {
        // Mock implementation - in production this would call the API
        // Simulate a successful verification for MVP
        return VerificationResult(
            proofId: proofId,
            status: .passed,
            scoreAwarded: 30,
            reasons: [],
            details: [
                "vpsQuality": "good",
                "vision": "matched: 'Bandstand'"
            ]
        )
    }
}
