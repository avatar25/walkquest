import SwiftUI
import WalkQuestFeatures
import WalkQuestDomain

public struct MainAppView: View {
    @StateObject private var coordinator = DIContainer.shared.appCoordinator
    @StateObject private var homeViewModel = DIContainer.shared.makeHomeViewModel()
    @StateObject private var captureViewModel = DIContainer.shared.makeCaptureViewModel()
    @StateObject private var leaderboardViewModel = DIContainer.shared.makeLeaderboardViewModel()
    
    public init() {}
    
    public var body: some View {
        TabView(selection: $coordinator.route) {
            HomeView(viewModel: homeViewModel)
                .tabItem {
                    Image(systemName: "house")
                    Text("Home")
                }
                .tag(AppCoordinator.Route.home)
            
            LeaderboardView(viewModel: leaderboardViewModel)
                .tabItem {
                    Image(systemName: "trophy")
                    Text("Leaderboard")
                }
                .tag(AppCoordinator.Route.leaderboard)
            
            Text("Profile")
                .tabItem {
                    Image(systemName: "person")
                    Text("Profile")
                }
                .tag(AppCoordinator.Route.profile)
        }
        .sheet(item: Binding<Quest?>(
            get: {
                if case .capture(let quest) = coordinator.route {
                    return quest
                }
                return nil
            },
            set: { _ in
                coordinator.route = .home
            }
        )) { quest in
            CaptureView(quest: quest, viewModel: captureViewModel)
        }
    }
}
