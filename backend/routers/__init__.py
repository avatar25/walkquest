from .quest_routes import router as quest_router
from .proof_routes import router as proof_router
from .leaderboard_routes import router as leaderboard_router

__all__ = ["quest_router", "proof_router", "leaderboard_router"]
