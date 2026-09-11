from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any
from backend.models.schemas import Conflict
from backend.services.state_store import state_store
from backend.agents.conflict_agent import ConflictAgent

router = APIRouter(prefix="/api/conflicts", tags=["Conflict Detection & Resolution"])
conflict_agent = ConflictAgent()

@router.get("", response_model=List[Conflict])
def list_conflicts():
    """Returns all active and resolved conflicts."""
    return state_store.get_conflicts()

@router.post("/check")
def run_conflict_check():
    """Triggers the Conflict Agent to run live multi-dimensional collision scans."""
    result = conflict_agent.execute({})
    return result

@router.post("/{conflict_id}/resolve")
def resolve_conflict(conflict_id: str, action: str = Body("apply_recommendation", embed=True)):
    """Applies the AI recommendation to resolve a conflict."""
    return conflict_agent.resolve_conflict(conflict_id, action)

@router.post("/{conflict_id}/dismiss")
def dismiss_conflict(conflict_id: str):
    """Dismisses or acknowledges a warning conflict."""
    updated = state_store.update_conflict(conflict_id, {"status": "Dismissed"})
    if not updated:
        raise HTTPException(status_code=404, detail="Conflict not found.")
    return {"status": "Success", "message": "Conflict dismissed."}
