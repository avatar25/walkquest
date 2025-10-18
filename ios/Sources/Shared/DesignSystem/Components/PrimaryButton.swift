import SwiftUI

public struct PrimaryButton: View {
    let title: String
    let action: () -> Void
    let isLoading: Bool
    
    public init(
        title: String,
        isLoading: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.isLoading = isLoading
        self.action = action
    }
    
    public var body: some View {
        Button(action: action) {
            HStack {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(0.8)
                }
                Text(title)
                    .font(Typography.button)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, Spacing.m)
            .padding(.horizontal, Spacing.l)
            .background(AppColors.primary)
            .foregroundColor(.white)
            .cornerRadius(Radius.medium)
        }
        .disabled(isLoading)
    }
}
