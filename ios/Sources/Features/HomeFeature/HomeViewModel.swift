import Foundation
import WalkQuestDomain

@MainActor
public final class HomeViewModel: ObservableObject {
    @Published public var quests: [Quest] = []
    @Published public var isLoading = false
    @Published public var error: String?
    @Published public var userLocation: LatLng?
    
    private let fetchTodaysQuests: FetchTodaysQuests
    
    public init(fetchTodaysQuests: FetchTodaysQuests) {
        self.fetchTodaysQuests = fetchTodaysQuests
    }
    
    public func loadQuests() async {
        isLoading = true
        error = nil
        
        do {
            quests = try await fetchTodaysQuests.execute()
        } catch {
            self.error = error.localizedDescription
        }
        
        isLoading = false
    }
    
    public func calculateDistance(from location: LatLng, to quest: Quest) -> Double {
        return calculateDistance(
            lat1: location.lat,
            lng1: location.lng,
            lat2: quest.geofence.center.lat,
            lng2: quest.geofence.center.lng
        )
    }
    
    public func isWithinGeofence(userLocation: LatLng, quest: Quest) -> Bool {
        let distance = calculateDistance(from: userLocation, to: quest)
        return distance <= Double(quest.geofence.radiusMeters)
    }
    
    private func calculateDistance(lat1: Double, lng1: Double, lat2: Double, lng2: Double) -> Double {
        let R = 6371000.0 // Earth's radius in meters
        let lat1Rad = lat1 * .pi / 180
        let lat2Rad = lat2 * .pi / 180
        let deltaLat = (lat2 - lat1) * .pi / 180
        let deltaLng = (lng2 - lng1) * .pi / 180
        
        let a = sin(deltaLat / 2) * sin(deltaLat / 2) +
                cos(lat1Rad) * cos(lat2Rad) *
                sin(deltaLng / 2) * sin(deltaLng / 2)
        let c = 2 * atan2(sqrt(a), sqrt(1 - a))
        
        return R * c
    }
}
