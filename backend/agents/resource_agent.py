from typing import Dict, Any, List
from backend.agents.base_agent import BaseAgent
from backend.models.schemas import Resource, ParsedEventRequirements
from backend.services.state_store import state_store

class ResourceAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Resource Agent",
            role="Hardware & Equipment Logistics Manager",
            description="Manages campus inventory, calculates equipment allocation, computes shortages, and formulates borrowing requests."
        )

    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        requirements: ParsedEventRequirements = context.get("requirements")
        self.log(f"Allocating physical resources & hardware for {requirements.participants} participants")
        
        resources = state_store.get_resources()
        shortages = []
        allocated_summary = []
        
        for r in resources:
            if r.shortage > 0:
                shortages.append({
                    "resource_id": r.id,
                    "name": r.name,
                    "total": r.total,
                    "allocated": r.allocated,
                    "shortage": r.shortage,
                    "recommendation": r.recommendation or f"Borrow {r.shortage} {r.name} from Central Media Services or neighboring department."
                })
            allocated_summary.append({
                "resource_id": r.id,
                "name": r.name,
                "category": r.category,
                "allocated": r.allocated,
                "total": r.total,
                "available": r.available,
                "status": "Shortage" if r.shortage > 0 else "Optimal"
            })
            
        self.log(f"Evaluated {len(resources)} hardware inventory streams. Shortages: {len(shortages)}")
        return {
            "resources": resources,
            "allocated_summary": allocated_summary,
            "shortages": shortages,
            "has_shortages": len(shortages) > 0,
            "recommendation": "All high-demand items (laptops, power strips, routers) calibrated for peak hackathon workload." if not shortages else f"Resolve {len(shortages)} hardware deficits."
        }

    def simulate_resource_deficit(self, resource_id: str, deficit_amount: int) -> Dict[str, Any]:
        res = state_store.get_resource(resource_id)
        if not res:
            return {"status": "Error", "message": "Resource not found"}
        
        # Reduce total stock below allocation to produce simulated deficit
        new_total = max(0, res.allocated - deficit_amount)
        updated = state_store.update_resource(resource_id, {"total": new_total})
        
        return {
            "resource_name": res.name,
            "previous_total": res.total,
            "new_total": new_total,
            "allocated": updated.allocated,
            "shortage": updated.shortage,
            "recommendation": f"Procure or borrow {updated.shortage} additional {res.name} from Campus Media & IT Center."
        }
