from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any, Optional
from backend.models.schemas import (
    SimulationScenario, DisruptionRequest, ReplanningResult, StateComparison
)
from backend.services.state_store import state_store
from backend.agents.replanning_agent import ReplanningAgent

router = APIRouter(prefix="/api/simulation", tags=["Simulation Center & Dynamic Replanning"])
replanning_agent = ReplanningAgent()

@router.get("/scenarios", response_model=List[SimulationScenario])
def list_simulation_scenarios():
    """Returns pre-configured 'What If?' disruption scenarios for hackathon demonstration."""
    return state_store.get_scenarios()

@router.post("/replan", response_model=ReplanningResult)
def trigger_dynamic_replanning(request: DisruptionRequest):
    """
    Executes the full 9-step Dynamic Replanning pipeline against a disruption scenario.
    """
    result = replanning_agent.execute({
        "scenario_id": request.scenario_id,
        "custom_disruption": request.custom_disruption
    })
    return result

@router.post("/apply")
def apply_replanning_changes(payload: Dict[str, Any] = Body(...)):
    """
    Commits approved replanning delta into live active campus state (venues, schedule, squads).
    """
    simulation_id = payload.get("simulation_id", "sim-default")
    raw_comparisons = payload.get("before_vs_after", [])
    
    comparisons = []
    for item in raw_comparisons:
        comparisons.append(StateComparison(**item))
        
    return replanning_agent.apply_approved_replanning(simulation_id, comparisons)
