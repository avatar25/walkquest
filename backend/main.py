from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv

from database import engine
from models.database import Base
from routers import quest_router, proof_router, leaderboard_router
from schemas.common import ErrorResponse

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan events."""
    # Startup
    print("Starting WalkQuest API...")
    
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield
    
    # Shutdown
    print("Shutting down WalkQuest API...")
    await engine.dispose()

# Create FastAPI app
app = FastAPI(
    title="WalkQuest API",
    description="Location-based quest verification API",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(quest_router)
app.include_router(proof_router)
app.include_router(leaderboard_router)

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "WalkQuest API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return {
        "error": {
            "code": "INTERNAL_ERROR",
            "message": str(exc)
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
