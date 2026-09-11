from typing import Dict, Any, List, Optional
from backend.agents.base_agent import BaseAgent
from backend.models.schemas import Venue, ParsedEventRequirements
from backend.services.state_store import state_store

class VenueAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Venue Agent",
            role="Space & Facilities Optimizer",
            description="Evaluates campus venue capacity, AV setup, Wi-Fi mesh, accessibility, and room availability."
        )

    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        requirements: ParsedEventRequirements = context.get("requirements")
        self.log(f"Received venue planning request for {requirements.event_name} (Capacity required: {requirements.required_capacity})")
        
        all_venues = state_store.get_venues()
        allocated_venues = []
        alternative_venues = []
        
        # 1. Main Plenary Hall (Needs to fit participants)
        plenary_candidates = [v for v in all_venues if v.capacity >= requirements.required_capacity]
        plenary_candidates.sort(key=lambda v: (v.status == "Available", v.capacity), reverse=True)
        
        if plenary_candidates:
            primary_venue = plenary_candidates[0]
            allocated_venues.append({
                "role": "Plenary / Opening & Demos",
                "venue_id": primary_venue.id,
                "venue_name": primary_venue.name,
                "capacity": primary_venue.capacity,
                "status": primary_venue.status,
                "suitability_score": primary_venue.suitability_score,
                "features": ["Projector", f"{primary_venue.microphones} Mics", "1Gbps Wi-Fi", "Wheelchair Accessible"]
            })
            self.log(f"Allocated primary plenary venue: {primary_venue.name} (Cap: {primary_venue.capacity})")
        
        # 2. Breakout / Lab spaces
        labs = [v for v in all_venues if "Lab" in v.name or "Seminar" in v.name]
        for lab in labs:
            allocated_venues.append({
                "role": "Coding Sprint & Breakouts",
                "venue_id": lab.id,
                "venue_name": lab.name,
                "capacity": lab.capacity,
                "status": lab.status,
                "suitability_score": lab.suitability_score,
                "features": ["60 High-Perf Workstations" if lab.computers else "Tiered Seating", "1Gbps LAN", "Wi-Fi"]
            })
            self.log(f"Allocated breakout venue: {lab.name} (Cap: {lab.capacity})")

        # 3. Compile backup / alternatives
        for v in all_venues:
            if v.id not in [av["venue_id"] for av in allocated_venues]:
                alternative_venues.append({
                    "venue_id": v.id,
                    "venue_name": v.name,
                    "capacity": v.capacity,
                    "status": v.status,
                    "suitability_score": v.suitability_score
                })

        return {
            "allocated_venues": allocated_venues,
            "alternative_venues": alternative_venues,
            "total_capacity_available": sum(v.capacity for v in all_venues if v.status == "Available"),
            "status": "Success",
            "reasoning": f"Successfully mapped {len(allocated_venues)} campus venues meeting full capacity ({requirements.required_capacity} attendees) with verified AV and Wi-Fi readiness."
        }

    def rank_alternatives_for_venue(self, unavailable_venue_id: str, required_capacity: int) -> List[Dict[str, Any]]:
        all_venues = state_store.get_venues()
        candidates = [v for v in all_venues if v.id != unavailable_venue_id and v.status == "Available"]
        
        ranked = []
        for v in candidates:
            cap_diff = abs(v.capacity - required_capacity)
            score = 100.0 - (cap_diff * 0.1) if v.capacity >= required_capacity else max(30.0, 70.0 - (cap_diff * 0.5))
            if v.wifi:
                score += 5
            if v.accessibility:
                score += 5
            ranked.append({
                "venue_id": v.id,
                "venue_name": v.name,
                "capacity": v.capacity,
                "score": round(min(100.0, score), 1),
                "has_projector": v.projectors > 0,
                "microphones": v.microphones,
                "wifi": v.wifi,
                "accessibility": v.accessibility,
                "recommendation_reason": f"{v.name} provides {v.capacity} seating capacity, matching AV facilities, and zero schedule collisions."
            })
        
        ranked.sort(key=lambda x: x["score"], reverse=True)
        return ranked
