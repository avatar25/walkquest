import SwiftUI
import WalkQuestDomain
import WalkQuestShared

public struct CaptureView: View {
    let quest: Quest
    @StateObject private var viewModel: CaptureViewModel
    @Environment(\.dismiss) private var dismiss
    
    public init(quest: Quest, viewModel: CaptureViewModel) {
        self.quest = quest
        self._viewModel = StateObject(wrappedValue: viewModel)
    }
    
    public var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button("Cancel") {
                    dismiss()
                }
                .foregroundColor(.primary)
                
                Spacer()
                
                Text(quest.title)
                    .font(Typography.title)
                    .fontWeight(.semibold)
                
                Spacer()
                
                Button("Help") {
                    // Show help
                }
                .foregroundColor(.primary)
            }
            .padding(.horizontal, Spacing.l)
            .padding(.vertical, Spacing.m)
            
            Divider()
            
            // Content based on state
            switch viewModel.state.captureState {
            case .idle:
                idleView
            case .capturing:
                capturingView
            case .uploading(let progress):
                uploadingView(progress: progress)
            case .submitting:
                submittingView
            case .polling(let attempt):
                pollingView(attempt: attempt)
            case .result(let verificationResult):
                resultView(verificationResult)
            }
        }
        .navigationBarHidden(true)
        .task {
            await viewModel.startCapture(for: quest)
        }
    }
    
    private var idleView: some View {
        VStack(spacing: Spacing.l) {
            Image(systemName: "camera")
                .font(.system(size: 64))
                .foregroundColor(.secondary)
            
            Text("Ready to capture")
                .font(Typography.title)
            
            if let hint = quest.hint {
                Text(hint)
                    .font(Typography.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(Spacing.xl)
    }
    
    private var capturingView: some View {
        VStack(spacing: Spacing.l) {
            ProgressView()
                .scaleEffect(1.5)
            
            Text("Capturing photo...")
                .font(Typography.body)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    private func uploadingView(progress: Double) -> some View {
        VStack(spacing: Spacing.l) {
            ProgressView(value: progress)
                .progressViewStyle(LinearProgressViewStyle())
                .scaleEffect(1.2)
            
            Text("Uploading image...")
                .font(Typography.body)
                .foregroundColor(.secondary)
            
            Text("\(Int(progress * 100))%")
                .font(Typography.caption)
                .foregroundColor(.secondary)
        }
        .padding(Spacing.xl)
    }
    
    private var submittingView: some View {
        VStack(spacing: Spacing.l) {
            ProgressView()
                .scaleEffect(1.5)
            
            Text("Submitting for verification...")
                .font(Typography.body)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    private func pollingView(attempt: Int) -> some View {
        VStack(spacing: Spacing.l) {
            ProgressView()
                .scaleEffect(1.5)
            
            Text("Verifying proof...")
                .font(Typography.body)
                .foregroundColor(.secondary)
            
            Text("Attempt \(attempt + 1)")
                .font(Typography.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    private func resultView(_ result: VerificationResult) -> some View {
        VStack(spacing: Spacing.l) {
            Image(systemName: result.status == .passed ? "checkmark.circle.fill" : "xmark.circle.fill")
                .font(.system(size: 64))
                .foregroundColor(result.status == .passed ? AppColors.success : AppColors.error)
            
            Text(result.status == .passed ? "Quest Complete!" : "Verification Failed")
                .font(Typography.titleLarge)
                .foregroundColor(result.status == .passed ? AppColors.success : AppColors.error)
            
            if result.status == .passed {
                Text("You earned \(result.scoreAwarded) points!")
                    .font(Typography.body)
                    .foregroundColor(.secondary)
            } else {
                VStack(spacing: Spacing.s) {
                    Text("Reasons:")
                        .font(Typography.body)
                        .fontWeight(.medium)
                    
                    ForEach(result.reasons, id: \.self) { reason in
                        Text(reason.rawValue)
                            .font(Typography.caption)
                            .foregroundColor(AppColors.error)
                    }
                    
                    if let tip = result.details["tip"] {
                        Text(tip)
                            .font(Typography.body)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                }
            }
            
            PrimaryButton(title: "Done") {
                dismiss()
            }
        }
        .padding(Spacing.xl)
    }
}
