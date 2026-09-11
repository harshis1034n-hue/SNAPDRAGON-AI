from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any
from backend.models.schemas import Venue, VenueUpdate
from backend.services.state_store import state_store
from backend.agents.venue_agent import VenueAgent

router = APIRouter(prefix="/api/venues", tags=["Venues"])
venue_agent = VenueAgent()

@router.get("", response_model=List[Venue])
def list_venues():
    """Returns all campus venues with current status, capacity, and AV equipment."""
    return state_store.get_venues()

@router.get("/{venue_id}", response_model=Venue)
def get_venue(venue_id: str):
    v = state_store.get_venue(venue_id)
    if not v:
        raise HTTPException(status_code=404, detail="Venue not found.")
    return v

@router.patch("/{venue_id}", response_model=Venue)
def update_venue(venue_id: str, update_data: VenueUpdate):
    """Allows updating venue status (e.g. toggle Available / Maintenance / In Use) during live demo."""
    updates = {k: v for k, v in update_data.model_dump().items() if v is not None}
    updated = state_store.update_venue(venue_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Venue not found.")
    return updated

@router.get("/{venue_id}/alternatives")
def get_venue_alternatives(venue_id: str, required_capacity: int = 250):
    """Ranks alternative campus venues if the specified venue is unavailable."""
    alternatives = venue_agent.rank_alternatives_for_venue(venue_id, required_capacity)
    return {"venue_id": venue_id, "required_capacity": required_capacity, "alternatives": alternatives}
