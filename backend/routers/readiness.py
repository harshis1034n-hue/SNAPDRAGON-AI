from fastapi import APIRouter
from backend.models.schemas import ReadinessDashboardData
from backend.services.readiness_service import readiness_service

router = APIRouter(prefix="/api/readiness", tags=["Event Readiness Dashboard"])

@router.get("", response_model=ReadinessDashboardData)
def get_readiness_score():
    """
    Returns calculated overall event readiness score (0-100%) and breakdown
    across 8 core campus operational categories.
    """
    return readiness_service.calculate_readiness()
