import SwiftUI
import WalkQuestDomain

public struct QuestCard: View {
    let quest: Quest
    let distance: Double?
    let isWithinGeofence: Bool
    let onGoAction: () -> Void
    
    public init(
        quest: Quest,
        distance: Double? = nil,
        isWithinGeofence: Bool = false,
        onGoAction: @escaping () -> Void
    ) {
        self.quest = quest
        self.distance = distance
        self.isWithinGeofence = isWithinGeofence
        self.onGoAction = onGoAction
    }
    
    public var body: some View {
        VStack(alignment: .leading, spacing: Spacing.m) {
            HStack {
                VStack(alignment: .leading, spacing: Spacing.xs) {
                    Text(quest.title)
                        .font(Typography.title)
                        .foregroundColor(.primary)
                    
                    Text(quest.kind.rawValue.capitalized)
                        .font(Typography.caption)
                        .foregroundColor(.secondary)
                        .padding(.horizontal, Spacing.s)
                        .padding(.vertical, Spacing.xs)
                        .background(AppColors.primary.opacity(0.1))
                        .cornerRadius(Radius.small)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: Spacing.xs) {
                    Text("\(quest.rewardPoints)")
                        .font(Typography.title)
                        .foregroundColor(AppColors.success)
                    punctuations
                        .font(Typography.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            if let hint = quest.hint {
                Text(hint)
                    .font(Typography.body)
                    .foregroundColor(.secondary)
            }
            
            if let distance = distance {
                HStack {
                    Image(systemName: "location")
                        .foregroundColor(.secondary)
                    Text("\(Int(distance))m away")
                        .font(Typography.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            PrimaryButton(
                title: isWithinGeofence ? "Go!" : "Get Directions",
                action: onGoAction
            )
        }
        .padding(Spacing.l)
        .background(AppColors.cardBackground)
        .cornerRadius(Radius.card)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
    
    private var punctuations: some View {
        Text("pts")
            .font(Typography.caption)
            .foregroundColor(.secondary)
    }
}
