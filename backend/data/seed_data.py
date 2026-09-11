from typing import List, Dict, Any
from backend.models.schemas import (
    Venue, Resource, VolunteerTeam, ScheduleItem, Task, Conflict,
    ApprovalRequest, Notification, SimulationScenario, ParsedEventRequirements,
    ReadinessCategory, ReadinessDashboardData, Event
)

def get_initial_venues() -> List[Venue]:
    return [
        Venue(
            id="venue-main-auditorium",
            name="Main Auditorium",
            capacity=500,
            projectors=1,
            microphones=4,
            computers=0,
            wifi=True,
            accessibility=True,
            location="Academic Block A, Ground Floor",
            status="Available",
            suitability_score=98.0,
            notes="Ideal for large plenaries, opening/closing ceremonies, and multi-track presentations."
        ),
        Venue(
            id="venue-innovation-hall",
            name="Innovation Hall",
            capacity=250,
            projectors=1,
            microphones=3,
            computers=0,
            wifi=True,
            accessibility=True,
            location="Tech Wing, 1st Floor",
            status="Available",
            suitability_score=92.0,
            notes="Equipped with tiered seating, multi-display setup, and high-gain mics."
        ),
        Venue(
            id="venue-convention-hall",
            name="Convention Hall",
            capacity=400,
            projectors=1,
            microphones=4,
            computers=0,
            wifi=True,
            accessibility=True,
            location="Campus Convention Center",
            status="Available",
            suitability_score=95.0,
            notes="Large multi-purpose venue with high acoustic isolation."
        ),
        Venue(
            id="venue-seminar-hall",
            name="Seminar Hall",
            capacity=180,
            projectors=1,
            microphones=2,
            computers=0,
            wifi=True,
            accessibility=True,
            location="Management Block, 2nd Floor",
            status="Available",
            suitability_score=85.0,
            notes="Compact theater style, perfect for breakout and mentor sessions."
        ),
        Venue(
            id="venue-cse-lab-1",
            name="CSE Lab 1",
            capacity=60,
            projectors=1,
            microphones=1,
            computers=60,
            wifi=True,
            accessibility=True,
            location="CS Department, 2nd Floor",
            status="Available",
            suitability_score=90.0,
            notes="Workstation lab with dedicated 1Gbps LAN and uninterruptible power."
        ),
        Venue(
            id="venue-cse-lab-2",
            name="CSE Lab 2",
            capacity=60,
            projectors=1,
            microphones=1,
            computers=60,
            wifi=True,
            accessibility=True,
            location="CS Department, 2nd Floor",
            status="Available",
            suitability_score=90.0,
            notes="Equipped with high-performance desktop rigs and GPU clusters."
        ),
        Venue(
            id="venue-cse-lab-3",
            name="CSE Lab 3",
            capacity=60,
            projectors=1,
            microphones=1,
            computers=60,
            wifi=True,
            accessibility=True,
            location="CS Department, 3rd Floor",
            status="Available",
            suitability_score=88.0,
            notes="Modern hackathon coding pod with dual monitor setups."
        )
    ]

def get_initial_resources() -> List[Resource]:
    return [
        Resource(id="res-projectors", name="Projectors", category="Audio/Visual", total=8, allocated=4, available=4, shortage=0, unit="units", recommendation="Optimal availability. Keep 1 backup unit on standby."),
        Resource(id="res-microphones", name="Microphones", category="Audio/Visual", total=12, allocated=8, available=4, shortage=0, unit="units", recommendation="Battery health verified. 4 wireless headsets reserved."),
        Resource(id="res-laptops", name="Laptops", category="Hardware", total=120, allocated=60, available=60, shortage=0, unit="units", recommendation="Preloaded with developer toolkits and IDEs."),
        Resource(id="res-extension-boards", name="Extension Boards", category="Hardware", total=30, allocated=20, available=10, shortage=0, unit="strips", recommendation="Surge protectors deployed across all lab benches."),
        Resource(id="res-wifi-routers", name="Wi-Fi Routers", category="Network", total=8, allocated=5, available=3, shortage=0, unit="access points", recommendation="Dual-band mesh active across Main Auditorium and CS Labs."),
        Resource(id="res-speakers", name="Speakers", category="Audio/Visual", total=6, allocated=4, available=2, shortage=0, unit="pairs", recommendation="PA amplifier calibrated for Main Auditorium."),
        Resource(id="res-chairs", name="Chairs", category="Furniture", total=500, allocated=350, available=150, shortage=0, unit="chairs", recommendation="Sufficient seating for 300 hackathon participants + staff."),
        Resource(id="res-tables", name="Tables", category="Furniture", total=100, allocated=70, available=30, shortage=0, unit="desks", recommendation="Group work desks arranged in 4-person pods in labs.")
    ]

def get_initial_volunteers() -> List[VolunteerTeam]:
    return [
        VolunteerTeam(
            id="team-reg",
            name="Registration Team",
            required_count=4,
            assigned_count=4,
            leads=["Aarav Sharma (Head)"],
            members=["Priya Nair", "Rohan Gupta", "Ananya Verma"],
            status="Adequate",
            tasks_assigned=["QR check-in desk", "Badge distribution", "Swag kit handover"],
            notes="Stationed at Main Auditorium Foyer 08:30–11:00 AM."
        ),
        VolunteerTeam(
            id="team-tech",
            name="Technical Support",
            required_count=5,
            assigned_count=5,
            leads=["Vikram Mehta (Lead)"],
            members=["Sneha Patel", "Aditya Joshi", "Karan Singh", "Neha Rao"],
            status="Adequate",
            tasks_assigned=["Audio/visual management", "Wi-Fi debugging", "Power extension distribution", "Lab server uptime"],
            notes="Rotating 2-person shifts across CSE Labs 1, 2, and 3."
        ),
        VolunteerTeam(
            id="team-hosp",
            name="Hospitality",
            required_count=4,
            assigned_count=4,
            leads=["Kavita Iyer (Lead)"],
            members=["Rahul Bose", "Divya Menon", "Tanvi Shah"],
            status="Adequate",
            tasks_assigned=["VIP guest reception", "Lunch & dinner queue management", "Refreshment & water station restocking"],
            notes="Coordination with campus catering department."
        ),
        VolunteerTeam(
            id="team-sec",
            name="Security Coordination",
            required_count=3,
            assigned_count=3,
            leads=["Arjun Reddy (Lead)"],
            members=["Deepak Malik", "Harish Kumar"],
            status="Adequate",
            tasks_assigned=["Entry gate pass verification", "Night campus curfew liaison", "Emergency exit clearance"],
            notes="Direct walkie-talkie channel with Campus Chief Security Officer."
        ),
        VolunteerTeam(
            id="team-gen",
            name="General Support",
            required_count=4,
            assigned_count=4,
            leads=["Siddharth Jain (Lead)"],
            members=["Pooja Hegde", "Manoj Tiwari", "Anjali Deshmukh"],
            status="Adequate",
            tasks_assigned=["Signage management", "Crowd flow direction", "Logistics runner", "Photo/video liaison"],
            notes="Floating team on call via Discord coordinator channel."
        )
    ]

def get_initial_schedule() -> List[ScheduleItem]:
    return [
        ScheduleItem(
            id="sched-1",
            day=1,
            start_time="09:00",
            end_time="10:00",
            activity="Participant Registration & Kit Handover",
            venue_id="venue-main-auditorium",
            venue_name="Main Auditorium (Foyer)",
            team="Registration Team",
            resources=["Laptops (4)", "Tables (4)", "Chairs (8)", "Wi-Fi Router (1)"],
            status="Scheduled",
            dependencies=[],
            notes="Fast-track QR code check-in."
        ),
        ScheduleItem(
            id="sched-2",
            day=1,
            start_time="10:00",
            end_time="11:00",
            activity="Opening Ceremony & Keynote Address",
            venue_id="venue-main-auditorium",
            venue_name="Main Auditorium",
            team="Technical Support",
            resources=["Projector (1)", "Microphones (3)", "Speakers (2)"],
            status="Scheduled",
            dependencies=["sched-1"],
            notes="Chief Guest address + Hackathon theme reveal."
        ),
        ScheduleItem(
            id="sched-3",
            day=1,
            start_time="11:00",
            end_time="12:00",
            activity="Problem Statement Briefing & Q&A",
            venue_id="venue-main-auditorium",
            venue_name="Main Auditorium",
            team="Technical Support",
            resources=["Projector (1)", "Microphones (2)", "Wi-Fi Routers (2)"],
            status="Scheduled",
            dependencies=["sched-2"],
            notes="Detailed domain briefings & rubric distribution."
        ),
        ScheduleItem(
            id="sched-4",
            day=1,
            start_time="12:00",
            end_time="13:00",
            activity="Lunch & Team Formation Networking",
            venue_id="venue-convention-hall",
            venue_name="Convention Hall / Dining Block",
            team="Hospitality",
            resources=["Tables (30)", "Chairs (150)"],
            status="Scheduled",
            dependencies=["sched-3"],
            notes="Buffet meal served to all participants and judges."
        ),
        ScheduleItem(
            id="sched-5",
            day=1,
            start_time="13:00",
            end_time="18:00",
            activity="Hackathon Coding Sprint - Round 1",
            venue_id="venue-cse-lab-1",
            venue_name="CSE Labs 1, 2, 3 & Seminar Hall",
            team="Technical Support",
            resources=["Laptops (50)", "Extension Boards (15)", "Wi-Fi Routers (4)"],
            status="Scheduled",
            dependencies=["sched-4"],
            notes="Intensive development sprint. Server monitoring live."
        ),
        ScheduleItem(
            id="sched-6",
            day=1,
            start_time="18:00",
            end_time="19:00",
            activity="Mentoring Round 1 & Checkpoint Review",
            venue_id="venue-seminar-hall",
            venue_name="Seminar Hall & CSE Labs",
            team="General Support",
            resources=["Microphones (2)", "Extension Boards (5)"],
            status="Scheduled",
            dependencies=["sched-5"],
            notes="Industry mentors review architecture diagrams."
        ),
        ScheduleItem(
            id="sched-7",
            day=1,
            start_time="19:00",
            end_time="20:00",
            activity="Dinner & Energy Refreshment",
            venue_id="venue-convention-hall",
            venue_name="Convention Hall / Dining Block",
            team="Hospitality",
            resources=["Tables (30)", "Chairs (150)"],
            status="Scheduled",
            dependencies=["sched-6"],
            notes="Hot dinner and energy drinks distribution."
        ),
        ScheduleItem(
            id="sched-8",
            day=2,
            start_time="09:00",
            end_time="11:00",
            activity="Hackathon Final Polish & Submission",
            venue_id="venue-cse-lab-1",
            venue_name="CSE Labs 1, 2, 3",
            team="Technical Support",
            resources=["Laptops (50)", "Wi-Fi Routers (4)"],
            status="Scheduled",
            dependencies=["sched-7"],
            notes="GitHub repository submission freeze at 11:00 AM sharp."
        ),
        ScheduleItem(
            id="sched-9",
            day=2,
            start_time="11:30",
            end_time="14:00",
            activity="Top 10 Finalist Project Pitches",
            venue_id="venue-main-auditorium",
            venue_name="Main Auditorium",
            team="Technical Support",
            resources=["Projector (1)", "Microphones (4)", "Speakers (2)"],
            status="Scheduled",
            dependencies=["sched-8"],
            notes="Live stage demonstrations before jury."
        ),
        ScheduleItem(
            id="sched-10",
            day=2,
            start_time="14:30",
            end_time="15:30",
            activity="Valedictory Ceremony & Prize Distribution",
            venue_id="venue-main-auditorium",
            venue_name="Main Auditorium",
            team="General Support",
            resources=["Projector (1)", "Microphones (3)", "Speakers (2)"],
            status="Scheduled",
            dependencies=["sched-9"],
            notes="Announcement of winners, trophy handover, and group photo."
        )
    ]

def get_initial_tasks() -> List[Task]:
    return [
        Task(
            id="task-1",
            title="Book Main Auditorium & Sound System Check",
            team="Technical Support",
            priority="High",
            deadline="2026-10-22 17:00",
            status="Completed",
            category="Venue",
            automated=True,
            action_url="/venues"
        ),
        Task(
            id="task-2",
            title="Arrange & Test 4x High-Lumen Projectors",
            team="Technical Support",
            priority="High",
            deadline="2026-10-23 12:00",
            status="In Progress",
            category="Resource",
            automated=True,
            action_url="/resources"
        ),
        Task(
            id="task-3",
            title="Configure Dedicated 1Gbps Hackathon SSID with IT Dept",
            team="Technical Support",
            priority="High",
            deadline="2026-10-23 15:00",
            status="Pending",
            category="Infrastructure",
            automated=True,
            action_url="/resources"
        ),
        Task(
            id="task-4",
            title="Prepare Registration Desk, QR Scanner & Badges",
            team="Registration Team",
            priority="Medium",
            deadline="2026-10-24 07:30",
            status="Pending",
            category="Logistics",
            automated=True,
            action_url="/volunteers"
        ),
        Task(
            id="task-5",
            title="Brief Campus Security on 24-Hour Overnight Lab Access",
            team="Security Coordination",
            priority="High",
            deadline="2026-10-23 18:00",
            status="Completed",
            category="Security",
            automated=False,
            action_url="/approvals"
        ),
        Task(
            id="task-6",
            title="Confirm Buffet Catering & Refreshment Delivery Slots",
            team="Hospitality",
            priority="High",
            deadline="2026-10-23 16:00",
            status="In Progress",
            category="Hospitality",
            automated=False,
            action_url="/volunteers"
        ),
        Task(
            id="task-7",
            title="Conduct Emergency Power Generator Load Test",
            team="Technical Support",
            priority="High",
            deadline="2026-10-23 10:00",
            status="Completed",
            category="Infrastructure",
            automated=True,
            action_url="/readiness"
        ),
        Task(
            id="task-8",
            title="Distribute Emergency Walkie-Talkies to Team Leads",
            team="General Support",
            priority="Medium",
            deadline="2026-10-24 08:00",
            status="Pending",
            category="Communication",
            automated=True,
            action_url="/volunteers"
        )
    ]

def get_initial_conflicts() -> List[Conflict]:
    return [
        Conflict(
            id="conf-1",
            title="Venue Overlap: Main Auditorium Double-Booking",
            severity="Critical",
            category="Venue",
            description="Opening Ceremony (10:00–12:00) overlaps with pre-scheduled University Guest Lecture (11:00–13:00) in Main Auditorium.",
            affected_components=["Opening Ceremony", "Main Auditorium", "Guest Lecture"],
            recommendation="Move University Guest Lecture to Innovation Hall (Capacity: 250), which is fully vacant and equipped with matching A/V facilities.",
            why_explanation="Innovation Hall satisfies the 250-seat requirement, possesses identical wireless microphone systems, and eliminates the 1-hour schedule collision without altering hackathon timing.",
            status="Active",
            resolution_action={
                "type": "relocate_activity",
                "activity_id": "guest_lecture",
                "target_venue_id": "venue-innovation-hall",
                "target_venue_name": "Innovation Hall"
            }
        ),
        Conflict(
            id="conf-2",
            title="Resource Allocation: High-Lumen Projector Shortage Risk",
            severity="Warning",
            category="Resource",
            description="Concurrent requirement of 4 projectors across CS Labs during Hackathon Sprint leaves 0 reserve units for unexpected hardware failure.",
            affected_components=["Projector Inventory", "CSE Lab 3"],
            recommendation="Request 2 standby projectors from Media Services Dept or enable smart display fallback in CSE Lab 3.",
            why_explanation="A minimum 1-unit safety buffer is recommended for 300+ participant multi-day technical hackathons to prevent stage blackout.",
            status="Active",
            resolution_action={
                "type": "reserve_backup_resource",
                "resource_id": "res-projectors",
                "quantity": 2
            }
        )
    ]

def get_initial_approvals() -> List[ApprovalRequest]:
    return [
        ApprovalRequest(
            id="appr-1",
            title="24/7 Overnight Lab Access & Security Gate Pass Clearance",
            category="Security",
            ai_recommendation="Approve 24-hour overnight access for CSE Labs 1-3 with 3 assigned security personnel and visitor badge logging.",
            reason="Required to facilitate uninterrupted participant coding sprint through night of Day 1.",
            impact="Enables 300 participants + 20 mentors to remain on campus past regular 20:00 curfew.",
            risk="Medium",
            estimated_cost="$0 / Included in Campus Security Retainer",
            status="Approved",
            reviewer_notes="Approved by Dean of Student Affairs and Chief Security Officer.",
            created_at="2026-10-20 11:30"
        ),
        ApprovalRequest(
            id="appr-2",
            title="Midnight Snacks, Energy Drinks & Catering Budget Allocation",
            category="Budget",
            ai_recommendation="Approve supplemental expenditure of $1,200 for midnight pizza boxes, energy drinks, and coffee stations for 320 individuals.",
            reason="Ensures participant wellbeing and positive hackathon experience during overnight coding.",
            impact="Draws from CSE Department Student Activity Contingency Fund.",
            risk="Low",
            estimated_cost="$1,200",
            status="Pending",
            reviewer_notes=None,
            created_at="2026-10-21 09:15"
        ),
        ApprovalRequest(
            id="appr-3",
            title="External Industry Mentor Special Guest Parking & Wi-Fi Provision",
            category="Permissions",
            ai_recommendation="Issue 12 VIP guest vehicle passes and guest 5GHz Wi-Fi credentials for external corporate mentors.",
            reason="Facilitates smooth arrival and network access for Google, Microsoft, and AWS engineers.",
            impact="VIP parking reserved in Lot B; IT whitelist credentials generated.",
            risk="Low",
            estimated_cost="$0",
            status="Approved",
            reviewer_notes="Approved by IT Operations and Campus Facilities.",
            created_at="2026-10-21 14:00"
        )
    ]

def get_initial_notifications() -> List[Notification]:
    return [
        Notification(
            id="notif-1",
            title="CRITICAL CONFLICT DETECTED",
            message="Main Auditorium double-booking detected between 11:00 AM and 12:00 PM. Automated relocation recommendation available.",
            type="Critical",
            timestamp="10 mins ago",
            read=False,
            link="/conflicts"
        ),
        Notification(
            id="notif-2",
            title="Human Approval Required",
            message="Budget request of $1,200 for midnight catering requires Student Council & Faculty sanction.",
            type="Warning",
            timestamp="25 mins ago",
            read=False,
            link="/approvals"
        ),
        Notification(
            id="notif-3",
            title="AI Plan Generated Successfully",
            message="Event operational plan for 'AI Innovation Hackathon' synthesized across 7 agent domains.",
            type="Success",
            timestamp="1 hour ago",
            read=True,
            link="/event-plan"
        ),
        Notification(
            id="notif-4",
            title="Resource Allocation Calibrated",
            message="8 Resource categories verified with 0 current shortages across 500 chairs and 120 laptops.",
            type="Info",
            timestamp="2 hours ago",
            read=True,
            link="/resources"
        )
    ]

def get_simulation_scenarios() -> List[SimulationScenario]:
    return [
        SimulationScenario(
            id="sim-venue-down",
            name="Main Auditorium Becomes Unavailable",
            icon="building-alert",
            description="Main Auditorium undergoes unexpected HVAC or power breakdown immediately before the Opening Ceremony.",
            category="Venue Disruption",
            disruption_type="venue_unavailable",
            target_entity="venue-main-auditorium",
            severity="Critical"
        ),
        SimulationScenario(
            id="sim-projector-shortage",
            name="Critical Projector Hardware Shortage",
            icon="projector-off",
            description="3 out of 8 projectors malfunction during morning diagnostics, leaving an active deficit for multi-lab presentations.",
            category="Resource Disruption",
            disruption_type="resource_shortage",
            target_entity="res-projectors",
            severity="Warning"
        ),
        SimulationScenario(
            id="sim-volunteers-down",
            name="5 Volunteers Become Unavailable",
            icon="user-x",
            description="Flu outbreak causes 5 student volunteers to call in sick across Registration and Technical teams.",
            category="Workforce Disruption",
            disruption_type="volunteer_deficit",
            target_entity="team-reg",
            severity="Warning"
        ),
        SimulationScenario(
            id="sim-workshop-delay",
            name="Opening Keynote Delayed by 60 Minutes",
            icon="clock-alert",
            description="Keynote speaker's flight is delayed by 1 hour, cascading downstream timing into lunch and problem statement briefing.",
            category="Schedule Disruption",
            disruption_type="schedule_delay",
            target_entity="sched-2",
            severity="Medium"
        ),
        SimulationScenario(
            id="sim-duration-change",
            name="Event Extended to 3-Day Extended Format",
            icon="calendar-plus",
            description="Sponsors request an additional 24-hour incubation track for investor demos and venture pitches.",
            category="Scope Expansion",
            disruption_type="scope_change",
            target_entity="event_duration",
            severity="Info"
        ),
        SimulationScenario(
            id="sim-wifi-breakdown",
            name="Campus Core Wi-Fi Gateway Outage",
            icon="wifi-off",
            description="Primary ISP fiber cut impacts Main Block; system must redirect to backup 5G cellular bonded routers.",
            category="Infrastructure Disruption",
            disruption_type="resource_shortage",
            target_entity="res-wifi-routers",
            severity="Critical"
        )
    ]

def get_demo_event() -> Event:
    requirements = ParsedEventRequirements(
        event_name="AI Innovation Hackathon",
        event_type="Hackathon / 48-Hour Build Sprint",
        participants=300,
        duration="2 days",
        date="October 24-25, 2026",
        required_venues=["1 Auditorium (500 Cap)", "3 CSE Labs (180 Cap combined)", "1 Seminar Hall (180 Cap)"],
        required_capacity=300,
        equipment=["8 Projectors", "12 Microphones", "120 Laptops", "30 Extension Boards", "8 Wi-Fi APs"],
        volunteers=20,
        teams_needed=["Registration (4)", "Technical Support (5)", "Hospitality (4)", "Security Coordination (3)", "General Support (4)"],
        security_required=True,
        transport_required=False,
        food_arrangements=True,
        estimated_budget="$4,500",
        special_requirements=[
            "High-speed 1Gbps dedicated Wi-Fi SSID",
            "Continuous 24/7 power backup with DG generator",
            "Overnight campus security & lab access passes"
        ],
        confidence_score=0.99
    )
    
    return Event(
        id="evt-demo-hackathon-2026",
        name="AI Innovation Hackathon 2026",
        event_type="Hackathon",
        participants=300,
        duration="2 days",
        date="October 24-25, 2026",
        requirements=requirements,
        status="Planned",
        created_at="2026-10-21 09:00:00",
        operational_plan=None
    )
