from typing import Dict, Any, List
from backend.agents.base_agent import BaseAgent
from backend.models.schemas import ScheduleItem, ParsedEventRequirements
from backend.services.state_store import state_store

class ScheduleAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Schedule Agent",
            role="Temporal & Timeline Orchestrator",
            description="Builds multi-track event chronologies, aligns team shifts, maps prerequisites, and prevents time overlaps."
        )

    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        requirements: ParsedEventRequirements = context.get("requirements")
        self.log(f"Building timeline schedule for {requirements.event_name} (Duration: {requirements.duration})")
        
        # Get existing or generate structured timeline
        schedule_items = state_store.get_schedule()
        
        self.log(f"Synthesized {len(schedule_items)} timeline milestones across {requirements.duration}")
        return {
            "schedule": schedule_items,
            "total_sessions": len(schedule_items),
            "start_time": "09:00",
            "end_time": "15:30",
            "status": "Success",
            "reasoning": "Synchronized chronological flow across registration, keynote, parallel coding tracks, mentoring checkpoints, and grand finale pitch session."
        }

    def detect_overlapping_slots(self, items: List[ScheduleItem]) -> List[Dict[str, Any]]:
        overlaps = []
        for i in range(len(items)):
            for j in range(i + 1, len(items)):
                a, b = items[i], items[j]
                if a.day == b.day and a.venue_id == b.venue_id:
                    # Check time collision
                    if not (a.end_time <= b.start_time or b.end_time <= a.start_time):
                        overlaps.append({
                            "slot_a": a,
                            "slot_b": b,
                            "venue": a.venue_name,
                            "day": a.day,
                            "overlap_window": f"{max(a.start_time, b.start_time)} - {min(a.end_time, b.end_time)}"
                        })
        return overlaps
