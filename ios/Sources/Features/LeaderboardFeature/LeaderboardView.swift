import SwiftUI
import WalkQuestDomain
import WalkQuestShared

public struct LeaderboardView: View {
    @StateObject private var viewModel: LeaderboardViewModel
    
    public init(viewModel: LeaderboardViewModel) {
        self._viewModel = StateObject(wrappedValue: viewModel)
    }
    
    public var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                if viewModel.isLoading {
                    loadingView
                } else if let error = viewModel.error {
                    errorView(error)
                } else if let leaderboardData = viewModel.leaderboardData {
                    leaderboardContentView(leaderboardData)
                } else {
                    emptyStateView
                }
            }
            .navigationTitle("Leaderboard")
            .navigationBarTitleDisplayMode(.large)
            .refreshable {
                await viewModel.loadLeaderboard()
            }
            .task {
                await viewModel.loadLeaderboard()
            }
        }
    }
    
    private var loadingView: some View {
        VStack(spacing: Spacing.l) {
            ProgressView()
                .scaleEffect(1.2)
            Text("Loading leaderboard...")
                .font(Typography.body)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    private func errorView(_ error: String) -> some View {
        VStack(spacing: Spacing.l) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48))
                .foregroundColor(AppColors.error)
            
            Text("Failed to load leaderboard")
                .font(Typography.title)
            
            Text(error)
                .font(Typography.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            PrimaryButton(title: "Try Again") {
                Task {
                    await viewModel.loadLeaderboard()
                }
            }
        }
        .padding(Spacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    private var emptyStateView: some View {
        VStack(spacing: Spacing.l) {
            Image(systemName: "trophy")
                .font(.system(size: 48))
                .foregroundColor(.secondary)
            
            Text("No leaderboard data")
                .font(Typography.title)
            
            Text("Complete quests to see your ranking")
                .font(Typography.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(Spacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    private func leaderboardContentView(_ data: LeaderboardData) -> some View {
        ScrollView {
            VStack(spacing: Spacing.m) {
                // Window info
                VStack(spacing: Spacing.s) {
                    Text("Weekly Leaderboard")
                        .font(Typography.title)
                    
                    Text("Week \(data.window)")
                        .font(Typography.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.vertical, Spacing.m)
                
                // User's rank card
                UserRankCard(user: data.user, isCurrentUser: true)
                    .padding(.horizontal, Spacing.l)
                
                Divider()
                    .padding(.horizontal, Spacing.l)
                
                // Neighbors list
                LazyVStack(spacing: Spacing.s) {
                    ForEach(Array(data.neighbors.enumerated()), id: \.offset) { index, neighbor in
                        UserRankCard(user: neighbor, isCurrentUser: false)
                            .padding(.horizontal, Spacing.l)
                    }
                }
            }
            .padding(.vertical, Spacing.m)
        }
    }
}

struct UserRankCard: View {
    let user: UserRank
    let isCurrentUser: Bool
    
    var body: some View {
        HStack(spacing: Spacing.m) {
            // Rank
            VStack {
                Text("#\(user.rank)")
                    .font(Typography.title)
                    .fontWeight(.bold)
                    .foregroundColor(isCurrentUser ? AppColors.primary : .primary)
            }
            .frame(width: 40)
            
            // Avatar placeholder
            Circle()
                .fill(isCurrentUser ? AppColors.primary : Color.secondary.opacity(0.3))
                .frame(width: 40, height: 40)
                .overlay {
                    if isCurrentUser {
                        Image(systemName: "person.fill")
                            .foregroundColor(.white)
                    } else {
                        Image(systemName: "person")
                            .foregroundColor(.secondary)
                    }
                }
            
            // Name and points
            VStack(alignment: .leading, spacing: Spacing.xs) {
                Text(user.name)
                    .font(Typography.body)
                    .fontWeight(isCurrentUser ? .semibold : .regular)
                    .foregroundColor(isCurrentUser ? AppColors.primary : .primary)
                
                Text("\(user.points) points")
                    .font(Typography.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            // Trophy icon for top 3
            if user.rank <= 3 {
                Image(systemName: trophyIcon)
                    .foregroundColor(trophyColor)
                    .font(.title2)
            }
        }
        .padding(Spacing.m)
        .background(isCurrentUser ? AppColors.primary.opacity(0.1) : AppColors.cardBackground)
        .cornerRadius(Radius.medium)
        .overlay(
            RoundedRectangle(cornerRadius: Radius.medium)
                .stroke(isCurrentUser ? AppColors.primary : Color.clear, lineWidth: 1)
        )
    }
    
    private var trophyIcon: String {
        switch user.rank {
        case 1: return "crown.fill"
        case 2: return "medal.fill"
        case 3: return "medal"
        default: return ""
        }
    }
    
    private var trophyColor: Color {
        switch user.rank {
        case 1: return .yellow
        case 2: return .gray
        case 3: return .orange
        default: return .clear
        }
    }
}
