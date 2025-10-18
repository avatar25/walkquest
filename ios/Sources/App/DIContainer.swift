import Foundation
import WalkQuestDomain
import WalkQuestData
import WalkQuestFeatures
import WalkQuestShared

public final class DIContainer {
    public static let shared = DIContainer()
    
    private init() {}
    
    // MARK: - Services
    public lazy var locationService: LocationService = LocationServiceImpl()
    public lazy var cameraService: CameraService = CameraServiceImpl()
    public lazy var attestationService: AttestationService = AttestationServiceImpl()
    
    // MARK: - HTTP Client
    private lazy var httpClient: HTTPClient = {
        let baseURL = URL(string: "https://api.walkquest.app")!
        return APIClient(baseURL: baseURL, authToken: "mock_token")
    }()
    
    private lazy var baseURL = URL(string: "https://api.walkquest.app")!
    
    // MARK: - Repositories
    public lazy var questRepository: QuestRepository = QuestRepositoryImpl(
        httpClient: httpClient,
        baseURL: baseURL
    )
    
    public lazy var proofRepository: ProofRepository = ProofRepositoryImpl(
        httpClient: httpClient,
        baseURL: baseURL
    )
    
    public lazy var leaderboardRepository: LeaderboardRepository = LeaderboardRepositoryImpl(
        httpClient: httpClient,
        baseURL: baseURL
    )
    
    // MARK: - Clients
    public lazy var verificationClient: VerificationClient = VerificationClientImpl(
        httpClient: httpClient,
        baseURL: baseURL
    )
    
    public lazy var imageUploadClient: ImageUploadClient = ImageUploadClientImpl()
    
    // MARK: - Use Cases
    public lazy var fetchTodaysQuests: FetchTodaysQuests = FetchTodaysQuests(
        questRepository: questRepository
    )
    
    public lazy var startCapture: StartCapture = StartCapture(
        proofRepository: proofRepository,
        locationService: locationService,
        cameraService: cameraService,
        attestationService: attestationService
    )
    
    public lazy var submitProof: SubmitProof = SubmitProof(
        verificationClient: verificationClient,
        imageUploadClient: imageUploadClient,
        proofRepository: proofRepository
    )
    
    public lazy var pollVerification: PollVerification = PollVerification(
        verificationClient: verificationClient
    )
    
    // MARK: - ViewModels
    public func makeHomeViewModel() -> HomeViewModel {
        HomeViewModel(fetchTodaysQuests: fetchTodaysQuests)
    }
    
    public func makeCaptureViewModel() -> CaptureViewModel {
        CaptureViewModel(
            location: locationService,
            camera: cameraService,
            attestation: attestationService,
            proofs: proofRepository,
            verifier: verificationClient,
            startCapture: startCapture,
            submitProof: submitProof,
            pollVerification: pollVerification
        )
    }
    
    public func makeLeaderboardViewModel() -> LeaderboardViewModel {
        LeaderboardViewModel(leaderboardRepository: leaderboardRepository)
    }
    
    // MARK: - App Coordinator
    public lazy var appCoordinator: AppCoordinator = AppCoordinator()
}
