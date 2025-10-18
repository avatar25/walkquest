import SwiftUI
import WalkQuestDomain

@MainActor
public final class AppCoordinator: ObservableObject {
    @Published public var route: Route = .home
    
    public enum Route {
        case home
        case capture(Quest)
        case verify(ProofID)
        case leaderboard
        case profile
    }
    
    public init() {}
    
    public func navigate(to route: Route) {
        self.route = route
    }
    
    public func goBack() {
        switch route {
        case .home, .leaderboard, .profile:
            break // Already at root
        case .capture, .verify:
            route = .home
        }
    }
}
