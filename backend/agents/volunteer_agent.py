from typing import Dict, Any, List
from backend.agents.base_agent import BaseAgent
from backend.models.schemas import VolunteerTeam, ParsedEventRequirements
from backend.services.state_store import state_store

class VolunteerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Volunteer Agent",
            role="Workforce & Squad Coordinator",
            description="Organizes student support squads, balances shift workloads, assigns leads, and tracks team readiness."
        )

    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        requirements: ParsedEventRequirements = context.get("requirements")
        target_volunteers = requirements.volunteers or 20
        self.log(f"Coordinating volunteer force of {target_volunteers} student organizers across 5 functional squads")
        
        teams = state_store.get_volunteers()
        total_assigned = sum(t.assigned_count for t in teams)
        deficits = [t for t in teams if t.status == "Deficit"]
        
        self.log(f"Assigned {total_assigned}/{target_volunteers} volunteers across {len(teams)} squads")
        return {
            "teams": teams,
            "total_assigned": total_assigned,
            "target_volunteers": target_volunteers,
            "deficits": [{"team": t.name, "short": t.required_count - t.assigned_count} for t in deficits],
            "status": "Optimal" if not deficits else "Rebalance Needed",
            "reasoning": f"Workforce distributed across Registration (4), Tech (5), Hospitality (4), Security (3), and General Logistics (4)."
        }

    def rebalance_teams(self, absent_count: int, affected_team_id: str) -> Dict[str, Any]:
        """
        Dynamically redistributes headcount from general support to critical operations.
        """
        team = state_store.get_volunteer_team(affected_team_id)
        if not team:
            return {"status": "Error", "message": "Team not found"}
        
        new_assigned = max(1, team.assigned_count - absent_count)
        state_store.update_volunteer_team(affected_team_id, {"assigned_count": new_assigned})
        
        # If General Support has spare, reallocate 1 or 2
        gen_team = state_store.get_volunteer_team("team-gen")
        reallocated_from = None
        if gen_team and gen_team.assigned_count > 2 and new_assigned < team.required_count:
            transfer = min(2, gen_team.assigned_count - 2, team.required_count - new_assigned)
            if transfer > 0:
                state_store.update_volunteer_team("team-gen", {"assigned_count": gen_team.assigned_count - transfer})
                state_store.update_volunteer_team(affected_team_id, {"assigned_count": new_assigned + transfer})
                reallocated_from = f"Transferred {transfer} organizers from General Support squad to {team.name}."

        return {
            "affected_team": team.name,
            "new_count": state_store.get_volunteer_team(affected_team_id).assigned_count,
            "reallocation_action": reallocated_from or "Manual cross-training shift swap initiated."
        }
