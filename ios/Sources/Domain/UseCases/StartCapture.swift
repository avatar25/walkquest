import Foundation

public struct StartCapture {
    private let proofRepository: ProofRepository
    private let locationService: LocationService
    private let cameraService: CameraService
    private let attestationService: AttestationService
    
    public init(
        proofRepository: ProofRepository,
        locationService: LocationService,
        cameraService: CameraService,
        attestationService: AttestationService
    ) {
        self.proofRepository = proofRepository
        self.locationService = locationService
        self.cameraService = cameraService
        self.attestationService = attestationService
    }
    
    public func execute(for quest: Quest) async throws -> Proof {
        // Capture photo and extract EXIF timestamp
        let (photoData, exifDate) = try await cameraService.takePhoto()
        
        // Gather location samples from last 3 seconds
        let sensors = await locationService.latestSamples(seconds: 3.0)
        
        // Create proof record
        let proof = try await proofRepository.createProof(
            for: quest,
            sensors: sensors,
            exifTime: exifDate
        )
        
        return proof
    }
}
