import Foundation
import WalkQuestDomain

public enum CaptureState {
    case idle
    case capturing
    case uploading(progress: Double)
    case submitting
    case polling(attempt: Int)
    case result(VerificationResult)
}

@MainActor
public final class CaptureViewModel: ObservableObject {
    public struct UIState {
        public var captureState: CaptureState = .idle
        public var hint: String?
        public var error: String?
    }
    
    @Published public private(set) var state = UIState()
    
    private let location: LocationService
    private let camera: CameraService
    private let attestation: AttestationService
    private let proofs: ProofRepository
    private let verifier: VerificationClient
    private let startCapture: StartCapture
    private let submitProof: SubmitProof
    private let pollVerification: PollVerification
    
    public init(
        location: LocationService,
        camera: CameraService,
        attestation: AttestationService,
        proofs: ProofRepository,
        verifier: VerificationClient,
        startCapture: StartCapture,
        submitProof: SubmitProof,
        pollVerification: PollVerification
    ) {
        self.location = location
        self.camera = camera
        self.attestation = attestation
        self.proofs = proofs
        self.verifier = verifier
        self.startCapture = startCapture
        self.submitProof = submitProof
        self.pollVerification = pollVerification
    }
    
    public func startCapture(for quest: Quest) async {
        state.captureState = .capturing
        state.error = nil
        
        do {
            // Start location tracking
            await location.start()
            
            // Capture photo and create proof
            let proof = try await startCapture.execute(for: quest)
            
            // Simulate image upload with progress
            state.captureState = .uploading(progress: 0)
            for progress in stride(from: 0.0, through: 1.0, by: 0.1) {
                state.captureState = .uploading(progress: progress)
                try await Task.sleep(nanoseconds: 200_000_000) // 0.2 seconds
            }
            
            // Submit for verification
            state.captureState = .submitting
            
            // Mock image data for submission
            let imageData = Data("mock_image_data".utf8)
            let verificationResult = try await submitProof.execute(proof: proof, imageData: imageData)
            
            // Poll for verification result
            let finalResult = try await pollVerification.execute(proofId: proof.id)
            state.captureState = .result(finalResult)
            
        } catch {
            state.error = error.localizedDescription
            state.captureState = .idle
        }
    }
    
    public func reset() {
        state = UIState()
        Task {
            location.stop()
        }
    }
}
