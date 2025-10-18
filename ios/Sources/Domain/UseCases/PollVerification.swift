import Foundation

public struct PollVerification {
    private let verificationClient: VerificationClient
    private let maxAttempts: Int
    private let initialDelayMs: UInt64
    
    public init(
        verificationClient: VerificationClient,
        maxAttempts: Int = 10,
        initialDelayMs: UInt64 = 1500
    ) {
        self.verificationClient = verificationClient
        self.maxAttempts = maxAttempts
        self.initialDelayMs = initialDelayMs
    }
    
    public func execute(proofId: ProofID) async throws -> VerificationResult {
        var attempt = 0
        var currentResult: VerificationResult
        
        repeat {
            // Wait before polling (exponential backoff)
            if attempt > 0 {
                let delayMs = initialDelayMs * UInt64(attempt)
                try await Task.sleep(nanoseconds: delayMs * 1_000_000)
            }
            
            currentResult = try await verificationClient.poll(proofId: proofId)
            attempt += 1
            
        } while currentResult.status == .processing && attempt < maxAttempts
        
        return currentResult
    }
}
