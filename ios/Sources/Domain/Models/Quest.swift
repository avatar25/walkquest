import Foundation

// MARK: - Core Identifiers
public struct QuestID: Hashable, Codable {
    public let raw: String
    
    public init(raw: String) {
        self.raw = raw
    }
}

public struct ProofID: Hashable, Codable {
    public let raw: String
    
    public init(raw: String) {
        self.raw = raw
    }
}

public struct UserID: Hashable, Codable {
    public let raw: String
    
    public init(raw: String) {
        self.raw = raw
    }
}

// MARK: - Location Models
public struct LatLng: Codable, Equatable {
    public let lat: Double
    public let lng: Double
    
    public init(lat: Double, lng: Double) {
        self.lat = lat
        self.lng = lng
    }
}

public struct GeoFence: Codable, Equatable {
    public let center: LatLng
    public let radiusMeters: Int
    
    public init(center: LatLng, radiusMeters: Int) {
        self.center = center
        self.radiusMeters = radiusMeters
    }
}

// MARK: - Quest Models
public enum QuestKind: String, Codable {
    case landmark       // e.g., "Bandstand at Cubbon Park"
    case ambient        // e.g., "Find a park sign"
}

public struct Quest: Codable, Equatable {
    public let id: QuestID
    public let title: String
    public let kind: QuestKind
    public let geofence: GeoFence
    public let hint: String?
    public let rewardPoints: Int
    public let activeFrom: Date
    public let activeTo: Date
    
    public init(
        id: QuestID,
        title: String,
        kind: QuestKind,
        geofence: GeoFence,
        hint: String?,
        rewardPoints: Int,
        activeFrom: Date,
        activeTo: Date
    ) {
        self.id = id
        self.title = title
        self.kind = kind
        self.geofence = geofence
        self.hint = hint
        self.rewardPoints = rewardPoints
        self.activeFrom = activeFrom
        self.activeTo = activeTo
    }
}
