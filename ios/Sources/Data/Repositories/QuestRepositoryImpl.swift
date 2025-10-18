import Foundation
import WalkQuestDomain
import WalkQuestShared

public class QuestRepositoryImpl: QuestRepository {
    private let httpClient: HTTPClient
    private let baseURL: URL
    
    public init(httpClient: HTTPClient, baseURL: URL) {
        self.httpClient = httpClient
        self.baseURL = baseURL
    }
    
    public func todaysQuests() async throws -> [Quest] {
        // For MVP, we'll use mock data since we need user location
        // In production, this would fetch from the API with user's current location
        return mockQuests()
    }
    
    private func mockQuests() -> [Quest] {
        return [
            Quest(
                id: QuestID(raw: "q_cubbon_bandstand"),
                title: "Cubbon Park Bandstand",
                kind: .landmark,
                geofence: GeoFence(
                    center: LatLng(lat: 12.9768, lng: 77.6033),
                    radiusMeters: 120
                ),
                hint: "Face the bandstand; include the arch",
                rewardPoints: 30,
                activeFrom: Date().addingTimeInterval(-3600), // 1 hour ago
                activeTo: Date().addingTimeInterval(86400)    // 24 hours from now
            ),
            Quest(
                id: QuestID(raw: "q_lalbagh_flower_show"),
                title: "Lalbagh Flower Show",
                kind: .landmark,
                geofence: GeoFence(
                    center: LatLng(lat: 12.9507, lng: 77.5848),
                    radiusMeters: 100
                ),
                hint: "Find the main flower display area",
                rewardPoints: 25,
                activeFrom: Date().addingTimeInterval(-7200), // 2 hours ago
                activeTo: Date().addingTimeInterval(86400)    // 24 hours from now
            ),
            Quest(
                id: QuestID(raw: "q_park_sign"),
                title: "Find a Park Sign",
                kind: .ambient,
                geofence: GeoFence(
                    center: LatLng(lat: 12.9716, lng: 77.5946),
                    radiusMeters: 200
                ),
                hint: "Look for any park entrance sign",
                rewardPoints: 15,
                activeFrom: Date().addingTimeInterval(-1800), // 30 minutes ago
                activeTo: Date().addingTimeInterval(43200)    // 12 hours from now
            )
        ]
    }
}
