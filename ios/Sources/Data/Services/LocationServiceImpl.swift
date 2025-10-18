import Foundation
import CoreLocation
import WalkQuestDomain

public class LocationServiceImpl: NSObject, LocationService {
    private let locationManager = CLLocationManager()
    private var locationBuffer: [SensorSample] = []
    private var isStarted = false
    
    public override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.distanceFilter = 1.0 // Update every meter
    }
    
    public func start() async {
        guard !isStarted else { return }
        
        await MainActor.run {
            locationManager.requestWhenInUseAuthorization()
            locationManager.startUpdatingLocation()
            isStarted = true
        }
    }
    
    public func stop() {
        locationManager.stopUpdatingLocation()
        isStarted = false
    }
    
    public func latestSamples(seconds: Double) async -> SensorSnapshot {
        let cutoffTime = Date().addingTimeInterval(-seconds)
        let recentSamples = locationBuffer.filter { $0.timestamp >= cutoffTime }
        
        return SensorSnapshot(samples: recentSamples)
    }
}

extension LocationServiceImpl: CLLocationManagerDelegate {
    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        
        let sample = SensorSample(
            timestamp: location.timestamp,
            location: LatLng(lat: location.coordinate.latitude, lng: location.coordinate.longitude),
            horizontalAccuracy: location.horizontalAccuracy,
            speedMps: location.speed >= 0 ? location.speed : nil,
            headingDegrees: location.course >= 0 ? location.course : nil
        )
        
        locationBuffer.append(sample)
        
        // Keep only last 60 seconds of samples
        let cutoffTime = Date().addingTimeInterval(-60)
        locationBuffer.removeAll { $0.timestamp < cutoffTime }
    }
    
    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location error: \(error.localizedDescription)")
    }
    
    public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        switch manager.authorizationStatus {
        case .authorizedWhenInUse, .authorizedAlways:
            if !isStarted {
                Task {
                    await start()
                }
            }
        case .denied, .restricted:
            print("Location access denied")
        case .notDetermined:
            manager.requestWhenInUseAuthorization()
        @unknown default:
            break
        }
    }
}
