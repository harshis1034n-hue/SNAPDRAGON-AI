from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any, Optional
from backend.models.schemas import (
    Event, EventIntakeRequest, ParsedEventRequirements, OperationalPlan
)
from backend.services.state_store import state_store
from backend.services.ai_service import ai_service
from backend.agents.event_manager import EventManagerAgent

router = APIRouter(prefix="/api/events", tags=["Events & AI Intake"])
event_manager = EventManagerAgent()

@router.post("/parse", response_model=ParsedEventRequirements)
def parse_natural_language_event(request: EventIntakeRequest):
    """
    Parses a free-text event prompt (e.g. from the AI Planner) into structured requirements.
    Uses LLM API if configured or deterministic NLP engine in Demo Mode.
    """
    if not request.raw_prompt or len(request.raw_prompt.strip()) < 5:
        raise HTTPException(status_code=400, detail="Prompt must contain at least 5 characters.")
    
    parsed = ai_service.parse_event_prompt(request.raw_prompt)
    if request.event_name:
        parsed.event_name = request.event_name
    if request.participants:
        parsed.participants = request.participants
    if request.duration:
        parsed.duration = request.duration
        
    return parsed

@router.get("", response_model=List[Event])
def get_all_events():
    """Returns all tracked campus events."""
    return state_store.get_events()

@router.get("/{event_id}", response_model=Event)
def get_event_by_id(event_id: str):
    event = state_store.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    return event

@router.post("", response_model=Event)
def create_event(requirements: ParsedEventRequirements):
    """Creates an event from structured requirements and auto-generates the operational plan."""
    plan = event_manager.execute({"requirements": requirements})
    event = state_store.get_event(plan.event_id)
    return event

@router.post("/{event_id}/plan", response_model=OperationalPlan)
def generate_event_plan(event_id: str):
    """Triggers multi-agent coordination to generate or refresh the operational plan."""
    event = state_store.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    
    plan = event_manager.execute({"requirements": event.requirements, "event_id": event.id})
    return plan

@router.post("/system/reset-demo")
def reset_to_demo_state():
    """Resets all data back to the default demo state for a clean hackathon presentation."""
    state_store.reset_to_demo()
    # Re-run master plan for demo event
    demo_evt = state_store.get_events()[0]
    event_manager.execute({"requirements": demo_evt.requirements, "event_id": demo_evt.id})
    return {"status": "Success", "message": "Campus Orbit reset to pristine hackathon demo state."}
