import Foundation
import WalkQuestDomain

public class ImageUploadClientImpl: ImageUploadClient {
    
    public init() {}
    
    public func upload(imageData: Data, to url: URL) async throws {
        // Mock implementation for MVP
        // In production, this would upload to S3 using the presigned URL
        
        // Simulate upload time based on image size
        let uploadTime = min(Double(imageData.count) / 1_000_000.0, 5.0) // Max 5 seconds
        try await Task.sleep(nanoseconds: UInt64(uploadTime * 1_000_000_000))
        
        print("Mock upload completed: \(imageData.count) bytes to \(url)")
    }
}

public enum UploadError: Error {
    case invalidURL
    case uploadFailed
    case networkError
    
    public var localizedDescription: String {
        switch self {
        case .invalidURL:
            return "Invalid upload URL"
        case .uploadFailed:
            return "Upload failed"
        case .networkError:
            return "Network error during upload"
        }
    }
}
