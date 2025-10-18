import Foundation
import WalkQuestDomain

@MainActor
public final class LeaderboardViewModel: ObservableObject {
    @Published public var leaderboardData: LeaderboardData?
    @Published public var isLoading = false
    @Published public var error: String?
    
    private let leaderboardRepository: LeaderboardRepository
    
    public init(leaderboardRepository: LeaderboardRepository) {
        self.leaderboardRepository = leaderboardRepository
    }
    
    public func loadLeaderboard(scope: String = "city", window: String = "weekly", city: String = "BLR") async {
        isLoading = true
        error = nil
        
        do {
            leaderboardData = try await leaderboardRepository.getLeaderboard(scope: scope, window: window, city: city)
        } catch {
            self.error = error.localizedDescription
        }
        
        isLoading = false
    }
}
