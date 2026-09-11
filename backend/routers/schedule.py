from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any
from backend.models.schemas import ScheduleItem
from backend.services.state_store import state_store
from backend.agents.schedule_agent import ScheduleAgent

router = APIRouter(prefix="/api/schedule", tags=["Schedule & Timeline"])
schedule_agent = ScheduleAgent()

@router.get("", response_model=List[ScheduleItem])
def get_schedule():
    """Returns chronological schedule items mapped to venues, teams, and resources."""
    return state_store.get_schedule()

@router.get("/{item_id}", response_model=ScheduleItem)
def get_schedule_item(item_id: str):
    item = state_store.get_schedule_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Schedule item not found.")
    return item

@router.patch("/{item_id}", response_model=ScheduleItem)
def update_schedule_item(item_id: str, updates: Dict[str, Any]):
    item = state_store.update_schedule_item(item_id, updates)
    if not item:
        raise HTTPException(status_code=404, detail="Schedule item not found.")
    return item

@router.post("/generate")
def generate_schedule(duration: str = Body("2 days", embed=True)):
    """Re-generates timeline milestones for given duration."""
    return schedule_agent.execute({"requirements": state_store.get_events()[0].requirements})
