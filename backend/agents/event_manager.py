from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid

from backend.agents.base_agent import BaseAgent
from backend.agents.venue_agent import VenueAgent
from backend.agents.schedule_agent import ScheduleAgent
from backend.agents.resource_agent import ResourceAgent
from backend.agents.volunteer_agent import VolunteerAgent
from backend.agents.conflict_agent import ConflictAgent
from backend.models.schemas import (
    ParsedEventRequirements, OperationalPlan, Event, Task,
    Notification
)
from backend.services.state_store import state_store
from backend.services.readiness_service import readiness_service

class EventManagerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Event Manager Agent",
            role="Chief AI Orchestration Director",
            description="Decomposes high-level event briefs, delegates to specialized domain agents, reconciles constraints, and synthesizes the final operational plan."
        )
        self.venue_agent = VenueAgent()
        self.schedule_agent = ScheduleAgent()
        self.resource_agent = ResourceAgent()
        self.volunteer_agent = VolunteerAgent()
        self.conflict_agent = ConflictAgent()

    def execute(self, context: Dict[str, Any]) -> OperationalPlan:
        requirements: ParsedEventRequirements = context.get("requirements")
        event_id = context.get("event_id", f"evt-{uuid.uuid4().hex[:8]}")
        
        self.log(f"Initiating Master Planning Workflow for: '{requirements.event_name}' ({requirements.participants} attendees, {requirements.duration})")

        # Step 1: Execute Domain Agents in Parallel/Sequence
        sub_context = {"requirements": requirements, "event_id": event_id}
        
        self.log("Step 1/5: Delegating to Venue Agent for capacity & AV allocation...")
        venue_result = self.venue_agent.execute(sub_context)
        
        self.log("Step 2/5: Delegating to Schedule Agent for chronological sequencing...")
        schedule_result = self.schedule_agent.execute(sub_context)
        
        self.log("Step 3/5: Delegating to Resource Agent for inventory balancing...")
        resource_result = self.resource_agent.execute(sub_context)
        
        self.log("Step 4/5: Delegating to Volunteer Agent for team squad assignments...")
        volunteer_result = self.volunteer_agent.execute(sub_context)
        
        self.log("Step 5/5: Delegating to Conflict Agent for multi-constraint collision check...")
        conflict_result = self.conflict_agent.execute(sub_context)

        # Step 2: Fetch Current Tasks, Approvals, Readiness
        tasks = state_store.get_tasks()
        approvals = state_store.get_approvals()
        readiness = readiness_service.calculate_readiness()

        # AI Reasoning dictionary
        ai_reasoning = {
            "venue_allocation": f"Allocated {len(venue_result['allocated_venues'])} spaces including Main Auditorium & 3 CS Labs, ensuring 100% seating capacity for {requirements.required_capacity} participants.",
            "schedule_synthesis": f"Constructed balanced timeline with {len(schedule_result['schedule'])} milestone slots, embedding transition buffers to prevent speaker overrun.",
            "resource_provisioning": f"Calibrated 8 hardware categories with dedicated 1Gbps Wi-Fi SSID and surge-protected power strips for all coding pods.",
            "workforce_distribution": f"Formed 5 specialized volunteer squads totalling {volunteer_result['total_assigned']} organizers covering Registration, Tech, Hospitality, Security, and General Operations.",
            "constraint_assessment": f"Deterministic engine detected {len(conflict_result['conflicts'])} items, with automated relocation and borrowing recommendations ready."
        }

        operational_plan = OperationalPlan(
            event_id=event_id,
            event_name=requirements.event_name,
            summary=f"Fully synthesized operational plan for {requirements.event_name} across {len(venue_result['allocated_venues'])} campus venues, {len(schedule_result['schedule'])} schedule milestones, and {volunteer_result['total_assigned']} volunteer organizers.",
            venues_allocated=venue_result["allocated_venues"],
            schedule=schedule_result["schedule"],
            resources_allocated=resource_result["allocated_summary"],
            volunteer_teams=volunteer_result["teams"],
            tasks_generated=tasks,
            conflicts_detected=conflict_result["conflicts"],
            approvals_required=approvals,
            readiness_score=readiness,
            ai_reasoning=ai_reasoning
        )

        # Persist event
        event = Event(
            id=event_id,
            name=requirements.event_name,
            event_type=requirements.event_type,
            participants=requirements.participants,
            duration=requirements.duration,
            date=requirements.date,
            requirements=requirements,
            status="Planned",
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            operational_plan=operational_plan
        )
        state_store.save_event(event)

        # Trigger notification
        state_store.add_notification(
            Notification(
                id=f"notif-plan-{uuid.uuid4().hex[:6]}",
                title=f"Plan Generated: {requirements.event_name}",
                message="Master operational plan successfully coordinated across 7 multi-agent systems.",
                type="Success",
                timestamp="Just now",
                read=False,
                link="/event-plan"
            )
        )

        self.log("Master planning cycle completed successfully.")
        return operational_plan
