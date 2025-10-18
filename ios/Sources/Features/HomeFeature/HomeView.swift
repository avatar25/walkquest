import SwiftUI
import WalkQuestDomain
import WalkQuestShared

public struct HomeView: View {
    @StateObject private var viewModel: HomeViewModel
    @State private var selectedQuest: Quest?
    
    public init(viewModel: HomeViewModel) {
        self._viewModel = StateObject(wrappedValue: viewModel)
    }
    
    public var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                if viewModel.isLoading {
                    loadingView
                } else if let error = viewModel.error {
                    errorView(error)
                } else if viewModel.quests.isEmpty {
                    emptyStateView
                } else {
                    questListView
                }
            }
            .navigationTitle("WalkQuest")
            .navigationBarTitleDisplayMode(.large)
            .refreshable {
                await viewModel.loadQuests()
            }
            .task {
                await viewModel.loadQuests()
            }
        }
        .sheet(item: $selectedQuest) { quest in
            QuestDetailView(quest: quest, viewModel: viewModel)
        }
    }
    
    private var loadingView: some View {
        VStack(spacing: Spacing.l) {
            ProgressView()
                .scaleEffect(1.2)
            Text("Finding quests near you...")
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
            
            Text("Oops! Something went wrong")
                .font(Typography.title)
            
            Text(error)
                .font(Typography.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            PrimaryButton(title: "Try Again") {
                Task {
                    await viewModel.loadQuests()
                }
            }
        }
        .padding(Spacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    private var emptyStateView: some View {
        VStack(spacing: Spacing.l) {
            Image(systemName: "map")
                .font(.system(size: 48))
                .foregroundColor(.secondary)
            
            Text("No quests available")
                .font(Typography.title)
            
            Text("Check back later for new quests in your area")
                .font(Typography.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(Spacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    private var questListView: some View {
        ScrollView {
            LazyVStack(spacing: Spacing.m) {
                ForEach(viewModel.quests, id: \.id.raw) { quest in
                    QuestCard(
                        quest: quest,
                        distance: viewModel.userLocation.map { viewModel.calculateDistance(from: $0, to: quest) },
                        isWithinGeofence: viewModel.userLocation.map { viewModel.isWithinGeofence(userLocation: $0, quest: quest) } ?? false
                    ) {
                        selectedQuest = quest
                    }
                }
            }
            .padding(.horizontal, Spacing.l)
            .padding(.vertical, Spacing.m)
        }
    }
}

struct QuestDetailView: View {
    let quest: Quest
    let viewModel: HomeViewModel
    
    var body: some View {
        NavigationView {
            VStack(alignment: .leading, spacing: Spacing.l) {
                VStack(alignment: .leading, spacing: Spacing.m) {
                    Text(quest.title)
                        .font(Typography.titleLarge)
                    
                    Text(quest.kind.rawValue.capitalized)
                        .font(Typography.caption)
                        .foregroundColor(.secondary)
                        .padding(.horizontal, Spacing.s)
                        .padding(.vertical, Spacing.xs)
                        .background(AppColors.primary.opacity(0.1))
                        .cornerRadius(Radius.small)
                }
                
                if let hint = quest.hint {
                    VStack(alignment: .leading, spacing: Spacing.s) {
                        Text("Hint")
                            .font(Typography.title)
                        Text(hint)
                            .font(Typography.body)
                            .foregroundColor(.secondary)
                    }
                }
                
                VStack(alignment: .leading, spacing: Spacing.s) {
                    Text("Reward")
                        .font(Typography.title)
                    Text("\(quest.rewardPoints) points")
                        .font(Typography.body)
                        .foregroundColor(AppColors.success)
                }
                
                Spacer()
                
                PrimaryButton(title: "Start Quest") {
                    // TODO: Navigate to capture view
                }
            }
            .padding(Spacing.l)
            .navigationTitle("Quest Details")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") {
                        // Close sheet
                    }
                }
            }
        }
    }
}
