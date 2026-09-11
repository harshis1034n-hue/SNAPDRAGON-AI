from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any
from backend.models.schemas import Resource, ResourceUpdate
from backend.services.state_store import state_store
from backend.agents.resource_agent import ResourceAgent

router = APIRouter(prefix="/api/resources", tags=["Resources & Inventory"])
resource_agent = ResourceAgent()

@router.get("", response_model=List[Resource])
def list_resources():
    """Returns inventory status, allocations, available counts, and calculated shortages."""
    return state_store.get_resources()

@router.get("/{resource_id}", response_model=Resource)
def get_resource(resource_id: str):
    r = state_store.get_resource(resource_id)
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found.")
    return r

@router.patch("/{resource_id}", response_model=Resource)
def update_resource(resource_id: str, update_data: ResourceUpdate):
    """Updates total stock or allocated amount."""
    updates = {k: v for k, v in update_data.model_dump().items() if v is not None}
    updated = state_store.update_resource(resource_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Resource not found.")
    return updated

@router.post("/simulate-deficit")
def simulate_deficit(resource_id: str = Body(..., embed=True), deficit: int = Body(3, embed=True)):
    """Simulates a sudden equipment shortage to test AI recommendations."""
    return resource_agent.simulate_resource_deficit(resource_id, deficit)
