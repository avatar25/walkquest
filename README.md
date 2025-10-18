# WalkQuest

Location-based quest verification app with anti-cheat mechanisms. Users complete quests by capturing photos at specific locations, with backend verification ensuring authenticity.

## Architecture

### Backend (FastAPI + PostgreSQL)
- **API**: RESTful endpoints for quests, proofs, and leaderboard
- **Database**: PostgreSQL with PostGIS for geospatial queries
- **Verification**: GPS geofence validation, timestamp drift detection
- **Storage**: S3 integration for proof images
- **Anti-cheat**: Device attestation, location validation

### iOS App (SwiftUI + Clean Architecture)
- **Domain**: Pure Swift types and use cases
- **Data**: Repositories, API clients, and services
- **Features**: MVVM with SwiftUI views
- **Services**: Location tracking, camera capture, attestation

## Features

### Core Functionality
1. **Quest Discovery**: Find active quests near user location
2. **Photo Capture**: Take photos within geofenced areas
3. **Verification**: Backend validates GPS, timestamps, and image authenticity
4. **Scoring**: Points awarded for successful quest completion
5. **Leaderboard**: Weekly rankings with user context

### Anti-Cheat Measures
- GPS geofence validation
- Timestamp drift detection
- Device attestation requirements
- In-app photo capture only (no gallery imports)
- Vision-based landmark verification (placeholder)

## Setup

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Configure database and AWS credentials
alembic upgrade head
uvicorn main:app --reload
```

### iOS Setup
```bash
cd ios
open WalkQuest.xcodeproj
# Build and run in Xcode
```

## API Endpoints

### Quests
- `GET /v1/quests/today` - Get active quests near location

### Proofs
- `POST /v1/proofs` - Create proof record and get S3 upload URL
- `POST /v1/proofs/{id}/submit` - Trigger verification
- `GET /v1/proofs/{id}/verification` - Poll verification status

### Leaderboard
- `GET /v1/leaderboard` - Get rankings with user context

## Database Schema

### Core Tables
- `users` - User accounts
- `quests` - Quest definitions with geofences
- `proofs` - User proof submissions
- `verifications` - Verification results and scores

## Development

### MVP Implementation
The current implementation includes:
- Mock data for rapid development
- Basic verification logic
- Core UI flows for all features
- Dependency injection setup

### Production Considerations
- Real API integration
- Enhanced verification pipeline (VPS, Vision AI)
- Push notifications
- Offline support
- Analytics and monitoring

## Testing

### Backend
```bash
cd backend
pytest
```

### iOS
```bash
cd ios
swift test
```

## Contributing

1. Follow Clean Architecture principles
2. Use SwiftUI for iOS development
3. Implement proper error handling
4. Add unit tests for business logic
5. Follow the established naming conventions

## License

MIT License - see LICENSE file for details.