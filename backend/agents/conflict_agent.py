from typing import Dict, Any, List
from backend.agents.base_agent import BaseAgent
from backend.models.schemas import Conflict, ParsedEventRequirements, Notification
from backend.services.state_store import state_store

class ConflictAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Conflict Agent",
            role="Hard Constraint & Collision Validator",
            description="Continuously scans multidimensional space for venue overlaps, capacity overshoots, resource deficits, and team shortages."
        )

    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self.log("Running comprehensive hard constraint verification across all subsystems...")
        
        detected_conflicts: List[Conflict] = []
        
        # 1. Check existing recorded conflicts
        existing = state_store.get_conflicts()
        active_conflicts = [c for c in existing if c.status == "Active"]
        detected_conflicts.extend(active_conflicts)
        
        # 2. Check Resource Shortages
        resources = state_store.get_resources()
        for r in resources:
            if r.shortage > 0:
                conf_id = f"conf-res-{r.id}"
                if not any(c.id == conf_id for c in detected_conflicts):
                    detected_conflicts.append(Conflict(
                        id=conf_id,
                        title=f"Resource Shortage: Deficit of {r.shortage} {r.name}",
                        severity="Critical" if r.shortage > 2 else "Warning",
                        category="Resource",
                        description=f"Demand of {r.allocated} {r.name} exceeds available campus stock of {r.total} by {r.shortage} {r.unit}.",
                        affected_components=[r.name, "Parallel Coding Tracks"],
                        recommendation=f"Borrow {r.shortage} {r.name} from Media Services Dept or adjust concurrent session allocation.",
                        why_explanation=f"Maintaining zero deficit ensures all {r.allocated} workstations and demonstration booths operate concurrently.",
                        status="Active",
                        resolution_action={"type": "borrow_resource", "resource_id": r.id, "quantity": r.shortage}
                    ))
        
        # 3. Check Volunteer Squad Deficits
        volunteers = state_store.get_volunteers()
        for v in volunteers:
            if v.status == "Deficit":
                conf_id = f"conf-vol-{v.id}"
                if not any(c.id == conf_id for c in detected_conflicts):
                    deficit_num = v.required_count - v.assigned_count
                    detected_conflicts.append(Conflict(
                        id=conf_id,
                        title=f"Staffing Deficit: {v.name} Understaffed",
                        severity="Warning",
                        category="Volunteer",
                        description=f"{v.name} has only {v.assigned_count} members assigned, which is below the mandatory baseline of {v.required_count}.",
                        affected_components=[v.name, "Participant Check-in / Operations"],
                        recommendation="Reassign 2 floaters from General Support squad to bolster registration desk.",
                        why_explanation="Understaffing at registration causes bottlenecks and delays the 10:00 AM Opening Ceremony.",
                        status="Active",
                        resolution_action={"type": "rebalance_volunteers", "target_team": v.id}
                    ))

        # 4. Check Venue Unavailability
        venues = state_store.get_venues()
        for vn in venues:
            if vn.status in ("Unavailable", "Maintenance"):
                conf_id = f"conf-venue-{vn.id}"
                if not any(c.id == conf_id for c in detected_conflicts):
                    detected_conflicts.append(Conflict(
                        id=conf_id,
                        title=f"Venue Unavailability: {vn.name} Flagged {vn.status}",
                        severity="Critical",
                        category="Venue",
                        description=f"{vn.name} is currently flagged as {vn.status} and cannot host scheduled hackathon sessions.",
                        affected_components=[vn.name, "Opening Ceremony", "Final Pitches"],
                        recommendation="Initiate dynamic replanning simulation to relocate activities to Innovation Hall or Convention Hall.",
                        why_explanation="Main plenary sessions require at least 250 seating capacity with live audio/video projection.",
                        status="Active",
                        resolution_action={"type": "relocate_venue", "source_venue": vn.id}
                    ))

        critical_count = sum(1 for c in detected_conflicts if c.severity == "Critical" and c.status == "Active")
        warning_count = sum(1 for c in detected_conflicts if c.severity == "Warning" and c.status == "Active")
        
        self.log(f"Conflict scan complete. Active conflicts: {len(detected_conflicts)} (Critical: {critical_count}, Warnings: {warning_count})")
        
        return {
            "conflicts": detected_conflicts,
            "critical_count": critical_count,
            "warning_count": warning_count,
            "has_critical": critical_count > 0,
            "status": "Warning" if warning_count > 0 else ("Critical" if critical_count > 0 else "Clean")
        }

    def resolve_conflict(self, conflict_id: str, action: str = "apply_recommendation") -> Dict[str, Any]:
        conflict = state_store.update_conflict(conflict_id, {"status": "Resolved"})
        if not conflict:
            return {"status": "Error", "message": "Conflict not found"}
        
        # Apply deterministic side effects
        if conflict.id == "conf-1":
            # Relocated guest lecture -> Innovation Hall
            state_store.add_notification(
                Notification(
                    id=f"notif-res-{conflict_id}",
                    title="Conflict Resolved: Guest Lecture Relocated",
                    message="University Guest Lecture successfully routed to Innovation Hall (Capacity: 250). Schedule collision eliminated.",
                    type="Success",
                    timestamp="Just now",
                    read=False,
                    link="/schedule"
                )
            )
        elif "conf-res" in conflict_id:
            # Shortage resolved
            state_store.add_notification(
                Notification(
                    id=f"notif-res-{conflict_id}",
                    title="Equipment Deficit Addressed",
                    message="Standby hardware loan request approved and synced with Central Inventory.",
                    type="Success",
                    timestamp="Just now",
                    read=False,
                    link="/resources"
                )
            )
            
        return {
            "status": "Success",
            "message": f"Conflict '{conflict.title}' successfully resolved and recorded.",
            "conflict": conflict
        }
