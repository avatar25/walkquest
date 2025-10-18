# WalkQuest iOS App

Location-based quest verification iOS app built with SwiftUI and Clean Architecture.

## Architecture

The app follows Clean Architecture principles with MVVM pattern:

- **Domain**: Pure Swift types, use cases, and protocol definitions
- **Data**: Repositories, API clients, and services (Location, Camera, etc.)
- **Features**: ViewModels and Views for each feature
- **Shared**: Networking, design system, and utilities

## Features

### 1. Home Feature
- Display nearby quests
- Show quest details and hints
- Calculate distance to quests
- Check if user is within geofence

### 2. Capture Feature
- Photo capture with camera
- Location tracking and sensor data collection
- Image upload to S3
- Verification process with polling

### 3. Leaderboard Feature
- Weekly city leaderboard
- User ranking and points
- Neighbor rankings display

## Setup

1. **Open in Xcode:**
   ```bash
   open ios/WalkQuest.xcodeproj
   ```

2. **Configure permissions:**
   - Location: `NSLocationWhenInUseUsageDescription`
   - Camera: `NSCameraUsageDescription`

3. **Build and run:**
   - Select iOS Simulator or device
   - Build and run the project

## Dependencies

The app uses Swift Package Manager with local packages:
- `WalkQuestDomain` - Domain models and use cases
- `WalkQuestData` - Data layer implementation
- `WalkQuestFeatures` - Feature ViewModels and Views
- `WalkQuestShared` - Shared utilities and design system

## Mock Implementation

For MVP, the app uses mock implementations:
- Mock quest data
- Simulated photo capture
- Mock verification results
- Mock leaderboard data

## Testing

Run tests:
```bash
swift test
```

## Backend Integration

The app is designed to work with the FastAPI backend:
- Base URL: `https://api.walkquest.app`
- Authentication via Bearer tokens
- S3 integration for image uploads
- Real-time verification polling
