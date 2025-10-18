import Foundation

public struct SubmitProof {
    private let verificationClient: VerificationClient
    private let imageUploadClient: ImageUploadClient
    private let proofRepository: ProofRepository
    
    public init(
        verificationClient: VerificationClient,
        imageUploadClient: ImageUploadClient,
        proofRepository: ProofRepository
    ) {
        self.verificationClient = verificationClient
        self.imageUploadClient = imageUploadClient
        self.proofRepository = proofRepository
    }
    
    public func execute(proof: Proof, imageData: Data) async throws -> VerificationResult {
        // Upload image to S3
        try await imageUploadClient.upload(imageData: imageData, to: proof.imageUploadUrl)
        
        // Mark image as uploaded in repository
        try await proofRepository.markImageUploaded(proofId: proof.id)
        
        // Submit for verification
        let idempotencyKey = UUID().uuidString
        return try await verificationClient.submit(
            proof: proof,
            imageData: imageData,
            idempotencyKey: idempotencyKey
        )
    }
}
