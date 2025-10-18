# WalkQuest Backend API

FastAPI backend for the WalkQuest iOS app with PostgreSQL database and S3 integration.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set up PostgreSQL database:**
   - Install PostgreSQL with PostGIS extension
   - Create database: `createdb walkquest`
   - Copy `.env.example` to `.env` and update database URL

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and AWS keys
   ```

4. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

5. **Start the server:**
   ```bash
   uvicorn main:app --reload
   ```

The API will be available at `http://localhost:8000`

## API Endpoints

### Quests
- `GET /v1/quests/today` - Get active quests near user location

### Proofs
- `POST /v1/proofs` - Create proof record and get S3 upload URL
- `POST /v1/proofs/{proof_id}/submit` - Trigger verification
- `GET /v1/proofs/{proof_id}/verification` - Poll verification status

### Leaderboard
- `GET /v1/leaderboard` - Get rankings with user context

## Database Schema

The backend uses PostgreSQL with the following main tables:
- `users` - User accounts
- `quests` - Quest definitions with geofences
- `proofs` - User proof submissions
- `verifications` - Verification results

## Verification Logic

The MVP includes basic anti-cheat measures:
- GPS geofence validation
- Timestamp drift detection
- Device attestation requirement

## Development

Run tests:
```bash
pytest
```

Generate new migration:
```bash
alembic revision --autogenerate -m "description"
```
