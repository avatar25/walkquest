# WalkQuest Backend

A FastAPI-based backend for location-based quest verification.

## Local Development with Docker

### Prerequisites
- Docker and Docker Compose installed
- Git

### Quick Start

1. **Clone and setup environment:**
   ```bash
   cp env.example .env
   # Edit .env with your actual configuration values
   ```

2. **Start the services:**
   ```bash
   docker-compose up --build
   ```

3. **Run database migrations:**
   ```bash
   docker-compose exec api alembic upgrade head
   ```

4. **Access the API:**
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Database: localhost:5432

### Development Commands

```bash
# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build

# Run migrations
docker-compose exec api alembic upgrade head

# Create new migration
docker-compose exec api alembic revision --autogenerate -m "description"

# Access database shell
docker-compose exec db psql -U walkquest -d walkquest
```

### Local Development (without Docker)

If you prefer to run locally:

1. **Install PostgreSQL locally**
2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On macOS/Linux
   pip install -r requirements.txt
   ```

3. **Setup environment:**
   ```bash
   cp env.example .env
   # Edit .env with local database URL
   ```

4. **Run migrations:**
   ```bash
   alembic upgrade head
   ```

5. **Start the server:**
   ```bash
   uvicorn main:app --reload
   ```

## Project Structure

```
backend/
├── alembic/           # Database migrations
├── models/           # SQLAlchemy models
├── routers/          # FastAPI route handlers
├── schemas/          # Pydantic models
├── services/         # Business logic services
├── database.py       # Database configuration
├── main.py          # FastAPI application
└── requirements.txt  # Python dependencies
```

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation
- Quest-related endpoints under `/quests`
- Proof-related endpoints under `/proofs`
- Leaderboard endpoints under `/leaderboard`