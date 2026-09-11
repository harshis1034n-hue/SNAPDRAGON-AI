from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any
from backend.models.schemas import VolunteerTeam
from backend.services.state_store import state_store
from backend.agents.volunteer_agent import VolunteerAgent

router = APIRouter(prefix="/api/volunteers", tags=["Volunteers & Squads"])
volunteer_agent = VolunteerAgent()

@router.get("", response_model=List[VolunteerTeam])
def list_volunteers():
    """Returns all volunteer squads, headcount status, leads, and duty allocations."""
    return state_store.get_volunteers()

@router.get("/{team_id}", response_model=VolunteerTeam)
def get_volunteer_team(team_id: str):
    t = state_store.get_volunteer_team(team_id)
    if not t:
        raise HTTPException(status_code=404, detail="Volunteer team not found.")
    return t

@router.patch("/{team_id}", response_model=VolunteerTeam)
def update_volunteer_team(team_id: str, updates: Dict[str, Any]):
    updated = state_store.update_volunteer_team(team_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Volunteer team not found.")
    return updated

@router.post("/rebalance")
def rebalance_workforce(absent_count: int = Body(5, embed=True), affected_team_id: str = Body("team-reg", embed=True)):
    """Simulates volunteer absences and triggers dynamic cross-squad rebalancing."""
    return volunteer_agent.rebalance_teams(absent_count, affected_team_id)
