from typing import Dict, List, Any
from datetime import datetime
from backend.models.schemas import ReadinessCategory, ReadinessDashboardData
from backend.services.state_store import state_store

class ReadinessService:
    @staticmethod
    def calculate_readiness() -> ReadinessDashboardData:
        venues = state_store.get_venues()
        resources = state_store.get_resources()
        volunteers = state_store.get_volunteers()
        tasks = state_store.get_tasks()
        conflicts = state_store.get_conflicts()
        approvals = state_store.get_approvals()

        # 1. Venue Readiness (Weight 1.2)
        total_venues = len(venues)
        avail_venues = sum(1 for v in venues if v.status == "Available")
        venue_conflicts = sum(1 for c in conflicts if c.category == "Venue" and c.status == "Active")
        venue_score = int((avail_venues / total_venues) * 100) if total_venues > 0 else 100
        if venue_conflicts > 0:
            venue_score = max(50, venue_score - (venue_conflicts * 15))
        venue_cat = ReadinessCategory(
            category_name="Venue Planning",
            score=min(100, venue_score),
            weight=1.2,
            status="Good" if venue_score >= 80 else ("Needs Attention" if venue_score >= 60 else "Critical"),
            items_total=total_venues,
            items_ready=avail_venues,
            details=f"{avail_venues}/{total_venues} campus venues available & confirmed."
        )

        # 2. Equipment / Resource Readiness (Weight 1.0)
        total_res_types = len(resources)
        shortage_types = sum(1 for r in resources if r.shortage > 0)
        res_ready = total_res_types - shortage_types
        res_score = int((res_ready / total_res_types) * 100) if total_res_types > 0 else 100
        res_cat = ReadinessCategory(
            category_name="Equipment & Resources",
            score=res_score,
            weight=1.0,
            status="Good" if res_score >= 85 else ("Needs Attention" if res_score >= 65 else "Critical"),
            items_total=total_res_types,
            items_ready=res_ready,
            details=f"{res_ready}/{total_res_types} hardware inventory categories fully allocated."
        )

        # 3. Volunteers / Staffing (Weight 1.0)
        total_teams = len(volunteers)
        adequate_teams = sum(1 for t in volunteers if t.status != "Deficit")
        vol_score = int((adequate_teams / total_teams) * 100) if total_teams > 0 else 100
        total_vol_count = sum(t.assigned_count for t in volunteers)
        req_vol_count = sum(t.required_count for t in volunteers)
        vol_cat = ReadinessCategory(
            category_name="Volunteer Squads",
            score=vol_score,
            weight=1.0,
            status="Good" if vol_score >= 80 else ("Needs Attention" if vol_score >= 60 else "Critical"),
            items_total=req_vol_count,
            items_ready=total_vol_count,
            details=f"{total_vol_count}/{req_vol_count} volunteers assigned across {total_teams} functional squads."
        )

        # 4. Schedule & Timeline (Weight 1.2)
        sched_conflicts = sum(1 for c in conflicts if c.category in ("Schedule", "Venue") and c.status == "Active")
        sched_score = 100 if sched_conflicts == 0 else max(40, 100 - (sched_conflicts * 20))
        sched_cat = ReadinessCategory(
            category_name="Schedule & Timeline",
            score=sched_score,
            weight=1.2,
            status="Good" if sched_score >= 80 else ("Needs Attention" if sched_score >= 60 else "Critical"),
            items_total=10,
            items_ready=10 if sched_conflicts == 0 else (10 - sched_conflicts),
            details="All 10 multi-track sessions mapped without time collisions." if sched_conflicts == 0 else f"{sched_conflicts} unresolved time conflicts detected."
        )

        # 5. Security Coordination (Weight 0.9)
        sec_tasks = [t for t in tasks if t.category == "Security"]
        sec_done = sum(1 for t in sec_tasks if t.status == "Completed")
        sec_total = max(1, len(sec_tasks))
        sec_score = int((sec_done / sec_total) * 100) if sec_tasks else 75
        sec_cat = ReadinessCategory(
            category_name="Security & Access",
            score=sec_score,
            weight=0.9,
            status="Good" if sec_score >= 70 else "Needs Attention",
            items_total=sec_total,
            items_ready=sec_done,
            details=f"{sec_done}/{sec_total} security protocols completed including 24/7 gate permits."
        )

        # 6. Transport & Logistics (Weight 0.6)
        trans_cat = ReadinessCategory(
            category_name="Transport & Logistics",
            score=100,
            weight=0.6,
            status="Good",
            items_total=3,
            items_ready=3,
            details="Campus shuttle and pedestrian flow wayfinding routes marked."
        )

        # 7. Permissions & Approvals (Weight 1.1)
        total_appr = len(approvals)
        approved_cnt = sum(1 for a in approvals if a.status == "Approved")
        appr_score = int((approved_cnt / total_appr) * 100) if total_appr > 0 else 100
        appr_cat = ReadinessCategory(
            category_name="Permissions & Budget",
            score=appr_score,
            weight=1.1,
            status="Good" if appr_score >= 80 else ("Needs Attention" if appr_score >= 50 else "Critical"),
            items_total=total_appr,
            items_ready=approved_cnt,
            details=f"{approved_cnt}/{total_appr} statutory administrative approvals ratified."
        )

        # 8. Communication & Briefings (Weight 0.8)
        comm_tasks = [t for t in tasks if t.category in ("Communication", "Logistics", "Hospitality")]
        comm_done = sum(1 for t in comm_tasks if t.status == "Completed")
        comm_total = max(1, len(comm_tasks))
        comm_score = int((comm_done / comm_total) * 100) if comm_tasks else 80
        comm_cat = ReadinessCategory(
            category_name="Stakeholder Briefings",
            score=comm_score,
            weight=0.8,
            status="Good" if comm_score >= 75 else "Needs Attention",
            items_total=comm_total,
            items_ready=comm_done,
            details=f"{comm_done}/{comm_total} stakeholder briefings & run-of-show handoffs complete."
        )

        categories: Dict[str, ReadinessCategory] = {
            "venue": venue_cat,
            "equipment": res_cat,
            "volunteers": vol_cat,
            "schedule": sched_cat,
            "security": sec_cat,
            "transport": trans_cat,
            "permissions": appr_cat,
            "communication": comm_cat,
        }

        # Calculate weighted average
        total_weight = sum(cat.weight for cat in categories.values())
        weighted_sum = sum(cat.score * cat.weight for cat in categories.values())
        overall_score = int(weighted_sum / total_weight) if total_weight > 0 else 0

        if overall_score >= 80:
            readiness_level = "Ready"
        elif overall_score >= 60:
            readiness_level = "Needs Attention"
        else:
            readiness_level = "At Risk"

        key_blockers = []
        if appr_score < 70:
            key_blockers.append("Pending Midnight Catering Budget Approval ($1,200).")
        if venue_score < 80:
            key_blockers.append("Active Venue double-booking or unavailability.")
        if res_score < 80:
            key_blockers.append("Hardware shortages in AV / Network inventory.")
        if vol_score < 80:
            key_blockers.append("Volunteer headcount deficit in critical squads.")

        recommended_actions = [
            "Review and approve pending budget item in Approvals center.",
            "Verify backup projector standby with Media Services.",
            "Execute final walkie-talkie channel sound check on morning of Day 1."
        ]

        return ReadinessDashboardData(
            overall_score=overall_score,
            readiness_level=readiness_level,
            categories=categories,
            key_blockers=key_blockers,
            recommended_actions=recommended_actions,
            last_updated=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )

readiness_service = ReadinessService()
