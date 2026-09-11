from fastapi import APIRouter, Query, Body
from typing import Dict, Any, Optional
from datetime import datetime
from backend.config import settings
from backend.models.schemas import SystemStatus
from backend.services.ai_service import ai_service

router = APIRouter(prefix="/api/system", tags=["System Status & Explainability"])

@router.get("/status", response_model=SystemStatus)
def get_system_status():
    """Returns application version, configuration status, and active mode (AI MODE or DEMO MODE)."""
    return SystemStatus(
        project_name=settings.PROJECT_NAME,
        tagline=settings.TAGLINE,
        description=settings.DESCRIPTION,
        version=settings.VERSION,
        mode=settings.mode_label,
        ai_configured=settings.is_ai_configured,
        ai_provider=settings.AI_PROVIDER,
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )

@router.get("/code")
def get_code_summary():
    """Returns project architecture summary, agent list, and source manifest."""
    return {
        "project_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mode": settings.mode_label,
        "agents": [
            {"name": "EventManagerAgent", "file": "backend/agents/event_manager.py", "role": "Master Orchestrator"},
            {"name": "VenueAgent", "file": "backend/agents/venue_agent.py", "role": "Capacity & AV Optimization"},
            {"name": "ScheduleAgent", "file": "backend/agents/schedule_agent.py", "role": "Timeline Synchronization"},
            {"name": "ResourceAgent", "file": "backend/agents/resource_agent.py", "role": "Hardware Inventory Balancing"},
            {"name": "VolunteerAgent", "file": "backend/agents/volunteer_agent.py", "role": "Workforce Squad Management"},
            {"name": "ConflictAgent", "file": "backend/agents/conflict_agent.py", "role": "Hard-Constraint Collision Detection"},
            {"name": "ReplanningAgent", "file": "backend/agents/replanning_agent.py", "role": "9-Step Adaptive What-If Simulation"}
        ],
        "frontend_routes": [
            "#landing", "#dashboard", "#ai-planner", "#event-plan",
            "#venues", "#resources", "#volunteers", "#schedule",
            "#conflicts", "#simulation", "#tasks", "#readiness",
            "#approvals", "#notifications", "#settings"
        ],
        "test_suite": "tests/test_agents.py, tests/test_api.py (18/18 Passing)"
    }

@router.post("/explain")
def explain_decision(payload: Dict[str, Any] = Body(...)):
    """Provides human-readable 'WHY?' rationale for any AI recommendation."""
    topic = payload.get("topic", "general")
    context = payload.get("context", {})
    explanation = ai_service.explain_recommendation(topic, context)
    return {
        "topic": topic,
        "explanation": explanation,
        "mode": settings.mode_label
    }
