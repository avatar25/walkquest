import Foundation
import WalkQuestDomain
import WalkQuestShared

public class VerificationClientImpl: VerificationClient {
    private let httpClient: HTTPClient
    private let baseURL: URL
    
    public init(httpClient: HTTPClient, baseURL: URL) {
        self.httpClient = httpClient
        self.baseURL = baseURL
    }
    
    public func submit(proof: Proof, imageData: Data, idempotencyKey: String) async throws -> VerificationResult {
        // Mock implementation for MVP
        // In production, this would call the API endpoint
        
        // Simulate processing time
        try await Task.sleep(nanoseconds: 2_000_000_000) // 2 seconds
        
        return VerificationResult(
            proofId: proof.id,
            status: .processing,
            scoreAwarded: 0,
            reasons: [],
            details: ["message": "Verification started"]
        )
    }
    
    public func poll(proofId: ProofID) async throws -> VerificationResult {
        // Mock implementation for MVP
        // In production, this would call the verification status endpoint
        
        // Simulate random verification result
        let shouldPass = Bool.random()
        
        if shouldPass {
            return VerificationResult(
                proofId: proofId,
                status: .passed,
                scoreAwarded: 30,
                reasons: [],
                details: [
                    "vpsQuality": "good",
                    "vision": "matched successfully"
                ]
            )
        } else {
            return VerificationResult(
                proofId: proofId,
                status: .failed,
                scoreAwarded: 0,
                reasons: [.VISION_MISMATCH],
                details: [
                    "tip": "Try getting closer to the landmark"
                ]
            )
        }
    }
}
