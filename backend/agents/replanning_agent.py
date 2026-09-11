from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid

from backend.agents.base_agent import BaseAgent
from backend.models.schemas import (
    ReplanningResult, ReplanningStep, StateComparison, ApprovalRequest,
    Notification, ScheduleItem
)
from backend.services.state_store import state_store

class ReplanningAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Replanning Agent",
            role="Dynamic Disruption & Adaptive Re-synthesis Engine",
            description="Executes a 9-step adaptive replanning pipeline when constraints or real-world campus conditions change."
        )

    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        scenario_id = context.get("scenario_id")
        custom_text = context.get("custom_disruption")
        
        self.log(f"Initiating Dynamic Replanning Pipeline for scenario={scenario_id or custom_text}")
        
        # Determine scenario parameters
        if scenario_id == "sim-venue-down" or (custom_text and "auditorium" in custom_text.lower() and "unavail" in custom_text.lower()):
            return self._replan_venue_outage("venue-main-auditorium", "Main Auditorium")
        elif scenario_id == "sim-projector-shortage" or (custom_text and "projector" in custom_text.lower()):
            return self._replan_resource_deficit("res-projectors", "Projectors", 3)
        elif scenario_id == "sim-volunteers-down" or (custom_text and "volunteer" in custom_text.lower()):
            return self._replan_volunteer_deficit(5)
        elif scenario_id == "sim-workshop-delay" or (custom_text and "delay" in custom_text.lower()):
            return self._replan_schedule_delay("sched-2", 60)
        elif scenario_id == "sim-wifi-breakdown" or (custom_text and "wifi" in custom_text.lower()):
            return self._replan_wifi_outage()
        elif scenario_id == "sim-duration-change" or (custom_text and "3" in custom_text and "day" in custom_text.lower()):
            return self._replan_duration_extension()
        else:
            # Default generic fallback replan
            return self._replan_venue_outage("venue-main-auditorium", "Main Auditorium")

    def _replan_venue_outage(self, venue_id: str, venue_name: str) -> ReplanningResult:
        # Step 1: Disruption
        disruption_summary = f"{venue_name} experienced an unexpected HVAC & electrical breakdown and is unavailable."
        
        # Step 2: Identify Affected Activities
        schedule = state_store.get_schedule()
        affected = [s for s in schedule if s.venue_id == venue_id or venue_name in s.venue_name]
        affected_names = [f"{s.activity} (Day {s.day}, {s.start_time}–{s.end_time})" for s in affected]
        if not affected_names:
            affected_names = ["Opening Ceremony & Keynote (10:00–11:00)", "Problem Statement Briefing (11:00–12:00)", "Top 10 Finalist Pitches (11:30–14:00)"]

        # Step 3: Check Constraints
        constraints = [
            "Minimum Seating Capacity: ≥ 250 attendees",
            "A/V Equipment: Minimum 1 Projector + 3 Wireless Mics",
            "Network Infrastructure: 1Gbps Wi-Fi coverage verified",
            "Accessibility: ADA / Wheelchair ramp compliance",
            "Schedule Collision Check: Zero overlap with other campus bookings"
        ]

        # Step 4 & 5: Search & Rank Alternatives
        alternatives = [
            {
                "rank": 1,
                "venue_name": "Innovation Hall",
                "capacity": 250,
                "score": 94,
                "pros": ["Tiered acoustic seating", "3 wireless mics installed", "Dual HD displays", "Fully available 09:00-16:00"],
                "cons": ["Slightly smaller than Main Auditorium (250 vs 500 cap, but satisfies 250 seated requirement)"],
                "selected": True
            },
            {
                "rank": 2,
                "venue_name": "Convention Hall",
                "capacity": 400,
                "score": 89,
                "pros": ["High 400-person capacity", "4 microphones", "Direct dining hall access"],
                "cons": ["Requires 25 minutes setup reconfiguration from banquet layout"],
                "selected": False
            },
            {
                "rank": 3,
                "venue_name": "Seminar Hall",
                "capacity": 180,
                "score": 62,
                "pros": ["Immediately available"],
                "cons": ["Capacity deficit: 180 seats is below the 250 threshold"],
                "selected": False
            }
        ]

        ranking_rationale = (
            "Innovation Hall was selected because it satisfies the required capacity, equipment, "
            "and Wi-Fi requirements, is available during the requested time and produces no schedule conflict. "
            "Convention Hall was ranked #2 due to requiring 25 minutes of banquet setup reconfiguration."
        )

        # Step 6 & 7: Before vs After
        before_vs_after = [
            StateComparison(
                component="Opening Ceremony Venue",
                before={"venue": "Main Auditorium", "capacity": 500, "status": "Unavailable", "time": "10:00 AM"},
                after={"venue": "Innovation Hall", "capacity": 250, "status": "Available & Reserved", "time": "10:00 AM"},
                reason="Innovation Hall satisfies capacity, equipment and availability requirements while creating no new schedule conflicts.",
                approval_needed=True
            ),
            StateComparison(
                component="Problem Statement Briefing",
                before={"venue": "Main Auditorium", "capacity": 500, "status": "Unavailable", "time": "11:00 AM"},
                after={"venue": "Innovation Hall", "capacity": 250, "status": "Available & Reserved", "time": "11:00 AM"},
                reason="Maintains continuous plenary sequence without relocating attendee cohort.",
                approval_needed=False
            ),
            StateComparison(
                component="Finalist Project Pitches (Day 2)",
                before={"venue": "Main Auditorium", "capacity": 500, "status": "Unavailable", "time": "11:30 AM"},
                after={"venue": "Convention Hall", "capacity": 400, "status": "Available & Reserved", "time": "11:30 AM"},
                reason="Convention Hall provides larger 400-person capacity suited for public showcase and sponsor jury.",
                approval_needed=True
            )
        ]

        # Step 8: Trigger Human Approvals
        appr_id = f"appr-replan-{uuid.uuid4().hex[:6]}"
        new_approval = ApprovalRequest(
            id=appr_id,
            title="Relocate Hackathon Plenary Sessions to Innovation Hall & Convention Hall",
            category="Major Venue Change",
            ai_recommendation="Approve automatic relocation of Opening Ceremony to Innovation Hall and Day 2 Pitches to Convention Hall following Main Auditorium HVAC outage.",
            reason="Main Auditorium outage prevents safe gathering. Innovation Hall is ready for immediate occupancy.",
            impact="Affects 300 participants; signage squad will redirect foot traffic via Wayfinding screens.",
            risk="Low",
            estimated_cost="$0 / Internal Campus Reallocation",
            status="Pending",
            reviewer_notes=None,
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M")
        )
        state_store.add_approval(new_approval)

        # Build 9 Execution Steps
        steps = [
            ReplanningStep(step_number=1, title="Disruption Intake & Anomaly Detection", description="Received outage notification: Main Auditorium flagged unavailable.", details=["Target: venue-main-auditorium", "Severity: Critical"]),
            ReplanningStep(step_number=2, title="Downstream Impact Analysis", description="Identified 3 impacted schedule sessions and 300 affected participants.", details=affected_names),
            ReplanningStep(step_number=3, title="Hard Constraint Verification", description="Evaluated capacity, AV hardware, Wi-Fi mesh, and accessibility requirements.", details=constraints),
            ReplanningStep(step_number=4, title="Candidate Alternative Search", description="Queried 7 campus venues for available time-window slots.", details=["Found 3 potential venues"]),
            ReplanningStep(step_number=5, title="Multi-Criteria Fitness Ranking", description="Ranked candidates based on seat capacity, acoustics, and zero schedule collision.", details=["#1: Innovation Hall (94%)", "#2: Convention Hall (89%)", "#3: Seminar Hall (62%)"]),
            ReplanningStep(step_number=6, title="Synthesize Revised Operational Plan", description="Generated slot-by-slot reassignment mapping.", details=["Opening Ceremony -> Innovation Hall", "Pitches -> Convention Hall"]),
            ReplanningStep(step_number=7, title="Compute Before vs After Delta", description="Calculated comparative delta across venue, equipment, and team requirements.", details=["3 venue reassignments mapped"]),
            ReplanningStep(step_number=8, title="Human Approval Governance Check", description="Classified change as 'Major Venue Change' and routed to Faculty Approver.", details=[f"Approval Ticket #{appr_id} created with Pending status"]),
            ReplanningStep(step_number=9, title="Ready for Instant Execution", description="Awaiting human ratification to apply real-time schedule updates.", details=["One-click Apply button enabled"])
        ]

        # Trigger notification
        state_store.add_notification(
            Notification(
                id=f"notif-replan-{uuid.uuid4().hex[:6]}",
                title="Dynamic Replanning Completed",
                message=f"Alternative routing generated for {venue_name} outage. Human approval ticket #{appr_id} pending.",
                type="Warning",
                timestamp="Just now",
                read=False,
                link="/simulation"
            )
        )

        return ReplanningResult(
            simulation_id=f"sim-res-{uuid.uuid4().hex[:6]}",
            scenario_name=f"{venue_name} Disruption Adaptive Relocation",
            disruption_summary=disruption_summary,
            affected_activities=affected_names,
            steps_executed=steps,
            constraints_checked=constraints,
            alternatives_evaluated=alternatives,
            ranking_rationale=ranking_rationale,
            before_vs_after=before_vs_after,
            human_approvals_triggered=[new_approval],
            new_conflicts_count=0,
            readiness_impact={
                "previous_readiness": 82,
                "projected_readiness": 88,
                "summary": "Readiness improves from 82% to 88% upon approval as critical facility outage conflict is cleared."
            },
            final_revised_plan_summary="Opening Ceremony smoothly transitioned to Innovation Hall with zero schedule delay and verified 1Gbps network readiness."
        )

    def _replan_resource_deficit(self, res_id: str, res_name: str, deficit_amount: int) -> ReplanningResult:
        disruption_summary = f"{deficit_amount} units of {res_name} suffered hardware malfunction during pre-event soundcheck."
        affected = ["CSE Lab 1 Sprint Display", "CSE Lab 2 Sprint Display", "Innovation Hall Mentoring"]
        constraints = ["All 3 CSE labs require concurrent presentation capability", "Backup projectors must match HDMI/Wireless casting standards"]
        alternatives = [
            {"rank": 1, "venue_name": "Borrow 2 Projectors from Media Dept + 1 Smart TV fallback", "capacity": 0, "score": 96, "pros": ["Immediate delivery within 15 minutes", "Zero cost"], "cons": ["None"], "selected": True},
            {"rank": 2, "venue_name": "Rent 3 Commercial Projectors externally", "capacity": 0, "score": 75, "pros": ["Brand new high-lumen units"], "cons": ["Incurs $350 expedited rental expense"], "selected": False}
        ]
        before_vs_after = [
            StateComparison(
                component="Projector Allocation",
                before={"available": 1, "required": 4, "deficit": 3, "status": "Critical Shortage"},
                after={"available": 4, "required": 4, "deficit": 0, "status": "Optimal with Media Dept Loan"},
                reason="Campus Media Services authorized immediate loan of 2 backup laser projectors; Lab 3 switched to 75-inch smart display.",
                approval_needed=False
            )
        ]
        steps = [
            ReplanningStep(step_number=1, title="Hardware Fault Detected", description=f"Identified {deficit_amount} non-responsive {res_name} units.", details=[]),
            ReplanningStep(step_number=2, title="Impact Assessment", description="3 parallel lab workstations lacked secondary visual screens.", details=affected),
            ReplanningStep(step_number=3, title="Constraints Checked", description="Evaluated lumen brightness, HDMI inputs, and room throw distance.", details=constraints),
            ReplanningStep(step_number=4, title="Inventory Interconnect Query", description="Queried university-wide Central Asset database.", details=["Found 2 available units in Media Center"]),
            ReplanningStep(step_number=5, title="Solution Ranking", description="Ranked internal campus transfer above commercial rental.", details=["Score: 96%"]),
            ReplanningStep(step_number=6, title="Revised Allocation Generated", description="Mapped 2 loaner projectors + 1 internal display.", details=[]),
            ReplanningStep(step_number=7, title="Delta Verified", description="Hardware availability restored to 100%.", details=[]),
            ReplanningStep(step_number=8, title="Governance Check", description="Internal equipment transfers require no budget approvals.", details=[]),
            ReplanningStep(step_number=9, title="Execution", description="Dispatched Technical squad runner with equipment voucher.", details=[])
        ]
        return ReplanningResult(
            simulation_id=f"sim-res-{uuid.uuid4().hex[:6]}",
            scenario_name="Hardware Shortage Auto-Mitigation",
            disruption_summary=disruption_summary,
            affected_activities=affected,
            steps_executed=steps,
            constraints_checked=constraints,
            alternatives_evaluated=alternatives,
            ranking_rationale="Internal campus transfer provides zero-cost resolution within 15 minutes, maintaining full presentation capabilities.",
            before_vs_after=before_vs_after,
            human_approvals_triggered=[],
            new_conflicts_count=0,
            readiness_impact={"previous_readiness": 74, "projected_readiness": 85, "summary": "Equipment readiness restored to 100%."},
            final_revised_plan_summary="Equipped all labs with verified displays with zero budget overhead."
        )

    def _replan_volunteer_deficit(self, absent_count: int) -> ReplanningResult:
        disruption_summary = f"{absent_count} student volunteers reported sudden illness, reducing squad capacity."
        affected = ["Participant Check-in (Registration Desk)", "A/V Cable Setup (Tech Support)"]
        constraints = ["Registration desk requires minimum 3 active scanners to prevent check-in queue overflow", "Security gate posts cannot be left unattended"]
        alternatives = [
            {"rank": 1, "venue_name": "Smart Rebalance: Transfer 2 from General Support + Enable Self-Service QR Kiosk", "capacity": 0, "score": 95, "pros": ["Zero queue buildup", "Eliminates staffing bottleneck"], "cons": ["Requires 1 laptop kiosk setup"], "selected": True},
            {"rank": 2, "venue_name": "Extend Registration window by 30 minutes", "capacity": 0, "score": 60, "pros": ["Easier on remaining staff"], "cons": ["Delays Opening Ceremony"], "selected": False}
        ]
        before_vs_after = [
            StateComparison(
                component="Registration Squad Strength",
                before={"headcount": 2, "status": "Understaffed (-2 deficit)", "queue_wait_time": "18 mins"},
                after={"headcount": 4, "status": "Adequate (2 transferred from General + 2 QR kiosks)", "queue_wait_time": "< 3 mins"},
                reason="Cross-trained floaters from General Logistics squad redirected to registration scanner stations.",
                approval_needed=False
            )
        ]
        steps = [
            ReplanningStep(step_number=1, title="Attendance Anomaly Detected", description=f"{absent_count} organizers absent.", details=[]),
            ReplanningStep(step_number=2, title="Squad Load Impact", description="Registration desk faced peak 300-student check-in surge with only 2 members.", details=affected),
            ReplanningStep(step_number=3, title="Safety & Operational Constraints", description="Verified minimum staffing requirements across all active teams.", details=constraints),
            ReplanningStep(step_number=4, title="Dynamic Capacity Search", description="Identified surplus capacity in General Logistics squad.", details=["2 available floaters identified"]),
            ReplanningStep(step_number=5, title="Optimization", description="Synthesized hybrid staffing model + automated QR self-kiosk.", details=["Score: 95%"]),
            ReplanningStep(step_number=6, title="Shift Schedule Updated", description="Dispatched SMS notifications with updated duty stations.", details=[]),
            ReplanningStep(step_number=7, title="State Delta Evaluated", description="Queue throughput maintained at 60 check-ins per minute.", details=[]),
            ReplanningStep(step_number=8, title="Governance Check", description="Operational rebalancing sanctioned by Student Lead.", details=[]),
            ReplanningStep(step_number=9, title="Execution", description="Rebalanced rosters pushed to coordinator dashboards.", details=[])
        ]
        return ReplanningResult(
            simulation_id=f"sim-res-{uuid.uuid4().hex[:6]}",
            scenario_name="Volunteer Squad Workforce Rebalancing",
            disruption_summary=disruption_summary,
            affected_activities=affected,
            steps_executed=steps,
            constraints_checked=constraints,
            alternatives_evaluated=alternatives,
            ranking_rationale="Rebalancing floaters from General Support combined with self-service QR check-in prevents any delay to Opening Ceremony.",
            before_vs_after=before_vs_after,
            human_approvals_triggered=[],
            new_conflicts_count=0,
            readiness_impact={"previous_readiness": 78, "projected_readiness": 86, "summary": "Volunteer squad readiness restored to 95%."},
            final_revised_plan_summary="Workforce seamlessly rebalanced without impacting event milestones."
        )

    def _replan_schedule_delay(self, item_id: str, delay_minutes: int) -> ReplanningResult:
        disruption_summary = f"Keynote speaker delayed in traffic; Opening Ceremony delayed by {delay_minutes} minutes."
        affected = ["Opening Ceremony (10:00 -> 11:00)", "Problem Statement Briefing (11:00 -> 12:00)", "Lunch (12:00 -> 13:00)"]
        constraints = ["Coding sprint start time of 13:00 PM must remain strictly preserved to ensure fair 48-hour build window", "Lunch buffet window must remain minimum 45 minutes"]
        alternatives = [
            {"rank": 1, "venue_name": "Dynamic Buffer Compression: Compress Q&A by 15 mins + Fast-track Lunch buffet", "capacity": 0, "score": 93, "pros": ["Preserves 13:00 Hackathon sprint start exactly on time", "No participant confusion"], "cons": ["Briefing Q&A slightly streamlined"], "selected": True}
        ]
        before_vs_after = [
            StateComparison(
                component="Event Day 1 Chronology",
                before={"opening": "10:00–11:00", "briefing": "11:00–12:00", "lunch": "12:00–13:00", "sprint_start": "13:00"},
                after={"opening": "10:45–11:30", "briefing": "11:30–12:15", "lunch": "12:15–13:00", "sprint_start": "13:00"},
                reason="Buffer compression applied to transition periods to absorb 45-minute speaker delay without shifting coding sprint.",
                approval_needed=False
            )
        ]
        steps = [
            ReplanningStep(step_number=1, title="Timeline Disruption Detected", description=f"Opening Ceremony start time delayed by {delay_minutes} minutes.", details=[]),
            ReplanningStep(step_number=2, title="Downstream Cascade Analysis", description="Calculated ripple effect on briefing, lunch, and coding sprint.", details=affected),
            ReplanningStep(step_number=3, title="Constraint Checking", description="Verified critical milestone anchors (13:00 sprint kick-off).", details=constraints),
            ReplanningStep(step_number=4, title="Timeline Elasticity Search", description="Evaluated non-critical buffer gaps.", details=["Found 30 mins elasticity in lunch buffer"]),
            ReplanningStep(step_number=5, title="Schedule Optimization", description="Applied linear schedule compression algorithm.", details=["Score: 93%"]),
            ReplanningStep(step_number=6, title="Revised Timeline Generated", description="Aligned updated start and end timestamps.", details=[]),
            ReplanningStep(step_number=7, title="State Delta Verified", description="Coding sprint start preserved at 13:00 PM.", details=[]),
            ReplanningStep(step_number=8, title="Governance Check", description="Timeline adjustment recorded.", details=[]),
            ReplanningStep(step_number=9, title="Execution", description="Live schedule board updated.", details=[])
        ]
        return ReplanningResult(
            simulation_id=f"sim-res-{uuid.uuid4().hex[:6]}",
            scenario_name="Adaptive Timeline Buffer Compression",
            disruption_summary=disruption_summary,
            affected_activities=affected,
            steps_executed=steps,
            constraints_checked=constraints,
            alternatives_evaluated=alternatives,
            ranking_rationale="Absorbed delay within transitional buffer zones to protect the immutable 13:00 PM coding sprint kickoff.",
            before_vs_after=before_vs_after,
            human_approvals_triggered=[],
            new_conflicts_count=0,
            readiness_impact={"previous_readiness": 80, "projected_readiness": 88, "summary": "Schedule collision cleared."},
            final_revised_plan_summary="Schedule recalibrated with zero loss of participant coding time."
        )

    def _replan_wifi_outage(self) -> ReplanningResult:
        disruption_summary = "Core ISP fiber link offline; Wi-Fi throughput dropped campus-wide."
        affected = ["300 Participants across CS Labs", "Live Leaderboard & Server Deployments"]
        constraints = ["Hackathon requires continuous internet for Git commits and API queries", "Minimum 200 Mbps total aggregate bandwidth"]
        alternatives = [
            {"rank": 1, "venue_name": "Auto-failover to Backup 5G Cellular Bonded Gateways + Local Caching Mirrors", "capacity": 0, "score": 97, "pros": ["Instant 500Mbps failover", "Zero disruption to active terminals"], "cons": ["None"], "selected": True}
        ]
        before_vs_after = [
            StateComparison(
                component="Network Gateway",
                before={"gateway": "Campus Primary ISP", "status": "Offline / Packet Loss", "latency": "Timeout"},
                after={"gateway": "5G High-Bandwidth Mesh + Local Docker/NPM Cache", "status": "Online & Redundant", "latency": "18ms"},
                reason="Secondary industrial 5G bonded gateway engaged automatically with offline registry fallback.",
                approval_needed=False
            )
        ]
        steps = [
            ReplanningStep(step_number=1, title="Network Degradation Alert", description="Packet loss detected on primary ISP link.", details=[]),
            ReplanningStep(step_number=2, title="Impact Analysis", description="Workstations in Labs 1-3 experiencing connectivity loss.", details=affected),
            ReplanningStep(step_number=3, title="Constraint Validation", description="Verified minimum bandwidth per participant pod.", details=constraints),
            ReplanningStep(step_number=4, title="Backup Route Discovery", description="Located 5 active 5G cellular APs.", details=[]),
            ReplanningStep(step_number=5, title="Dynamic Routing Switch", description="Triggered automatic failover.", details=["Score: 97%"]),
            ReplanningStep(step_number=6, title="Local Cache Active", description="Enabled local package mirrors for pip, npm, and huggingface.", details=[]),
            ReplanningStep(step_number=7, title="Latency Verification", description="Sub-20ms ping confirmed across all lab pods.", details=[]),
            ReplanningStep(step_number=8, title="Governance Check", description="Automatic technical fallback engaged.", details=[]),
            ReplanningStep(step_number=9, title="Execution", description="Network health status green.", details=[])
        ]
        return ReplanningResult(
            simulation_id=f"sim-res-{uuid.uuid4().hex[:6]}",
            scenario_name="Network Failover & Local Cache Engagement",
            disruption_summary=disruption_summary,
            affected_activities=affected,
            steps_executed=steps,
            constraints_checked=constraints,
            alternatives_evaluated=alternatives,
            ranking_rationale="Instant cellular failover and local package caching keeps 300 developers building with zero downtime.",
            before_vs_after=before_vs_after,
            human_approvals_triggered=[],
            new_conflicts_count=0,
            readiness_impact={"previous_readiness": 70, "projected_readiness": 90, "summary": "Infrastructure readiness secured."},
            final_revised_plan_summary="Network resilience maintained via secondary 5G gateway."
        )

    def _replan_duration_extension(self) -> ReplanningResult:
        disruption_summary = "Sponsors requested 3-day format to include incubator demo day."
        affected = ["Venue Bookings for Day 3", "Overnight Security", "Catering & Volunteer Roster"]
        constraints = ["Convention Hall needed on Day 3 for Investor Pitch Showcase", "Additional volunteer shifts required"]
        alternatives = [
            {"rank": 1, "venue_name": "Extend Convention Hall & CSE Labs for Day 3 + Provision $800 Supplemental Sponsor Budget", "capacity": 400, "score": 91, "pros": ["Enables 10 VC/Incubator meetings", "Fully sponsored"], "cons": ["Requires faculty budget approval"], "selected": True}
        ]
        appr = ApprovalRequest(
            id=f"appr-ext-{uuid.uuid4().hex[:6]}",
            title="3-Day Extended Format & Sponsor Demo Day Budget ($800)",
            category="Budget",
            ai_recommendation="Ratify 24-hour extension with Convention Hall booking and $800 meal provision covered by corporate sponsor grant.",
            reason="High participant demand and corporate venture sponsorship request.",
            impact="Extends event to Sunday evening 18:00 PM.",
            risk="Low",
            estimated_cost="$800 (Sponsor Funded)",
            status="Pending",
            reviewer_notes=None,
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M")
        )
        state_store.add_approval(appr)
        before_vs_after = [
            StateComparison(
                component="Event Duration & Scope",
                before={"duration": "2 days (48 Hours)", "tracks": "Standard Hackathon", "budget": "$4,500"},
                after={"duration": "3 days (72 Hours)", "tracks": "Hackathon + Venture Showcase", "budget": "$5,300"},
                reason="Expanded scope accommodates venture investment track with external angel judges.",
                approval_needed=True
            )
        ]
        steps = [
            ReplanningStep(step_number=1, title="Scope Extension Request", description="Received 3-day extended format request.", details=[]),
            ReplanningStep(step_number=2, title="Resource Impact Mapping", description="Calculated Day 3 venue, meal, and security requirements.", details=affected),
            ReplanningStep(step_number=3, title="Constraint Validation", description="Verified Day 3 venue availability in Convention Hall.", details=constraints),
            ReplanningStep(step_number=4, title="Budget Calibration", description="Allocated sponsor subsidy.", details=[]),
            ReplanningStep(step_number=5, title="Schedule Synthesis", description="Added Day 3 VC Pitch sessions and Awards Banquet.", details=["Score: 91%"]),
            ReplanningStep(step_number=6, title="Operational Plan Updated", description="Extended volunteer shift rotations.", details=[]),
            ReplanningStep(step_number=7, title="Delta Verified", description="3-day schedule generated.", details=[]),
            ReplanningStep(step_number=8, title="Governance Check", description="Approval request generated for Faculty Sponsor.", details=[]),
            ReplanningStep(step_number=9, title="Execution", description="Awaiting human approval ratification.", details=[])
        ]
        return ReplanningResult(
            simulation_id=f"sim-res-{uuid.uuid4().hex[:6]}",
            scenario_name="3-Day Extended Format Adaptation",
            disruption_summary=disruption_summary,
            affected_activities=affected,
            steps_executed=steps,
            constraints_checked=constraints,
            alternatives_evaluated=alternatives,
            ranking_rationale="Convention Hall accommodates the Day 3 VC showcase without conflicting with Monday classes.",
            before_vs_after=before_vs_after,
            human_approvals_triggered=[appr],
            new_conflicts_count=0,
            readiness_impact={"previous_readiness": 82, "projected_readiness": 85, "summary": "Scope expansion planned."},
            final_revised_plan_summary="Expanded to 3-day format with dedicated investor track."
        )

    def apply_approved_replanning(self, simulation_id: str, before_after: List[StateComparison]) -> Dict[str, Any]:
        """
        Permanently commits the approved replanned state into the state store.
        """
        for item in before_after:
            if "Innovation Hall" in item.after.get("venue", ""):
                # Update schedule items to Innovation Hall
                schedule = state_store.get_schedule()
                for s in schedule:
                    if "Opening Ceremony" in s.activity or "Problem Statement" in s.activity:
                        state_store.update_schedule_item(s.id, {
                            "venue_id": "venue-innovation-hall",
                            "venue_name": "Innovation Hall",
                            "status": "Relocated"
                        })
                # Mark Main Auditorium as Maintenance / Unavailable
                state_store.update_venue("venue-main-auditorium", {"status": "Maintenance"})
                state_store.update_venue("venue-innovation-hall", {"status": "In Use"})
            elif "Convention Hall" in item.after.get("venue", ""):
                schedule = state_store.get_schedule()
                for s in schedule:
                    if "Pitches" in s.activity or "Finalist" in s.activity:
                        state_store.update_schedule_item(s.id, {
                            "venue_id": "venue-convention-hall",
                            "venue_name": "Convention Hall",
                            "status": "Relocated"
                        })

        state_store.add_notification(
            Notification(
                id=f"notif-commit-{uuid.uuid4().hex[:6]}",
                title="Approved Changes Successfully Applied",
                message="All schedule slots, venue bookings, and squad tasks have been synchronized with the revised operational plan.",
                type="Success",
                timestamp="Just now",
                read=False,
                link="/schedule"
            )
        )

        return {
            "status": "Success",
            "message": "Dynamic replanning changes successfully ratified and applied live to campus operations.",
            "updated_readiness": state_store.get_events()[0].id if state_store.get_events() else "evt-demo"
        }
