from typing import List, Dict, Optional, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime

# --- SYSTEM & STATUS ---
class SystemStatus(BaseModel):
    project_name: str
    tagline: str
    description: str
    version: str
    mode: str  # "AI MODE" | "DEMO MODE"
    ai_configured: bool
    ai_provider: str
    timestamp: str

# --- VENUES ---
class Venue(BaseModel):
    id: str
    name: str
    capacity: int
    projectors: int = 0
    microphones: int = 0
    computers: int = 0
    wifi: bool = True
    accessibility: bool = True
    location: str = "Campus Main Block"
    status: str = "Available"  # "Available" | "In Use" | "Maintenance" | "Unavailable"
    suitability_score: float = 100.0
    notes: Optional[str] = None

class VenueUpdate(BaseModel):
    status: Optional[str] = None
    capacity: Optional[int] = None
    notes: Optional[str] = None

# --- RESOURCES ---
class Resource(BaseModel):
    id: str
    name: str
    category: str = "Hardware"  # "Hardware" | "Audio/Visual" | "Furniture" | "Network"
    total: int
    allocated: int = 0
    available: int = 0
    shortage: int = 0
    unit: str = "units"
    recommendation: Optional[str] = None

class ResourceUpdate(BaseModel):
    total: Optional[int] = None
    allocated: Optional[int] = None

# --- VOLUNTEERS ---
class VolunteerTeam(BaseModel):
    id: str
    name: str  # "Registration", "Technical Support", "Hospitality", "Security Coordination", "General Support"
    required_count: int
    assigned_count: int
    leads: List[str] = []
    members: List[str] = []
    status: str = "Adequate"  # "Adequate" | "Deficit" | "Surplus"
    tasks_assigned: List[str] = []
    notes: Optional[str] = None

# --- SCHEDULE ---
class ScheduleItem(BaseModel):
    id: str
    day: int = 1
    start_time: str
    end_time: str
    activity: str
    venue_id: str
    venue_name: str
    team: str
    resources: List[str] = []
    status: str = "Scheduled"  # "Scheduled" | "In Progress" | "Completed" | "Delayed" | "Relocated"
    dependencies: List[str] = []
    notes: Optional[str] = None

# --- TASKS ---
class Task(BaseModel):
    id: str
    title: str
    team: str
    priority: str = "Medium"  # "High" | "Medium" | "Low"
    deadline: str
    status: str = "Pending"  # "Pending" | "In Progress" | "Completed"
    category: str = "General"
    automated: bool = True
    action_url: Optional[str] = None

class TaskUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    team: Optional[str] = None

# --- CONFLICTS ---
class Conflict(BaseModel):
    id: str
    title: str
    severity: str = "Critical"  # "Critical" | "Warning" | "Info"
    category: str = "Venue"  # "Venue" | "Schedule" | "Resource" | "Volunteer" | "Capacity"
    description: str
    affected_components: List[str] = []
    recommendation: str
    why_explanation: str
    status: str = "Active"  # "Active" | "Resolved" | "Dismissed"
    resolution_action: Optional[Dict[str, Any]] = None

# --- APPROVALS ---
class ApprovalRequest(BaseModel):
    id: str
    title: str
    category: str = "Permissions"  # "Budget" | "Permissions" | "Security" | "Major Venue Change" | "External Resource"
    ai_recommendation: str
    reason: str
    impact: str
    risk: str = "Medium"  # "High" | "Medium" | "Low"
    estimated_cost: str = "$0 / None"
    status: str = "Pending"  # "Pending" | "Approved" | "Rejected" | "Changes Requested"
    reviewer_notes: Optional[str] = None
    created_at: str

# --- NOTIFICATIONS ---
class Notification(BaseModel):
    id: str
    title: str
    message: str
    type: str = "Info"  # "Critical" | "Warning" | "Info" | "Success"
    timestamp: str
    read: bool = False
    link: Optional[str] = None

# --- READINESS ---
class ReadinessCategory(BaseModel):
    category_name: str
    score: int  # 0 to 100
    weight: float = 1.0
    status: str = "Good"  # "Good" | "Needs Attention" | "Critical"
    items_total: int
    items_ready: int
    details: str

class ReadinessDashboardData(BaseModel):
    overall_score: int  # percentage
    readiness_level: str  # "Ready" | "Needs Attention" | "At Risk"
    categories: Dict[str, ReadinessCategory]
    key_blockers: List[str] = []
    recommended_actions: List[str] = []
    last_updated: str

# --- EVENT & INTAKE ---
class EventIntakeRequest(BaseModel):
    raw_prompt: str
    event_name: Optional[str] = None
    participants: Optional[int] = None
    duration: Optional[str] = None

class ParsedEventRequirements(BaseModel):
    event_name: str = "AI Innovation Hackathon"
    event_type: str = "Hackathon / Competition"
    participants: int = 300
    duration: str = "2 days"
    date: str = "October 24-25, 2026"
    required_venues: List[str] = ["1 Auditorium", "3 Classrooms/Labs"]
    required_capacity: int = 300
    equipment: List[str] = ["Projectors", "Microphones", "Wi-Fi", "Laptops", "Extension Boards"]
    volunteers: int = 20
    teams_needed: List[str] = ["Registration", "Technical Support", "Hospitality", "Security Coordination", "General Support"]
    security_required: bool = True
    transport_required: bool = False
    food_arrangements: bool = True
    estimated_budget: str = "$4,500"
    special_requirements: List[str] = ["High-speed 1Gbps Wi-Fi", "Backup power supply", "24/7 Security clearance"]
    confidence_score: float = 0.98

class OperationalPlan(BaseModel):
    event_id: str
    event_name: str
    summary: str
    venues_allocated: List[Dict[str, Any]]
    schedule: List[ScheduleItem]
    resources_allocated: List[Dict[str, Any]]
    volunteer_teams: List[VolunteerTeam]
    tasks_generated: List[Task]
    conflicts_detected: List[Conflict]
    approvals_required: List[ApprovalRequest]
    readiness_score: ReadinessDashboardData
    ai_reasoning: Dict[str, str]

class Event(BaseModel):
    id: str
    name: str
    event_type: str
    participants: int
    duration: str
    date: str
    requirements: ParsedEventRequirements
    status: str = "Planned"  # "Draft" | "Planned" | "In Progress" | "Replanned" | "Completed"
    created_at: str
    operational_plan: Optional[OperationalPlan] = None

# --- SIMULATION & REPLANNING ---
class SimulationScenario(BaseModel):
    id: str
    name: str
    icon: str
    description: str
    category: str
    disruption_type: str
    target_entity: str
    severity: str

class DisruptionRequest(BaseModel):
    scenario_id: Optional[str] = None
    custom_disruption: Optional[str] = None

class ReplanningStep(BaseModel):
    step_number: int
    title: str
    description: str
    status: str = "completed"
    details: List[str] = []

class StateComparison(BaseModel):
    component: str
    before: Dict[str, Any]
    after: Dict[str, Any]
    reason: str
    approval_needed: bool = False

class ReplanningResult(BaseModel):
    simulation_id: str
    scenario_name: str
    disruption_summary: str
    affected_activities: List[str]
    steps_executed: List[ReplanningStep]
    constraints_checked: List[str]
    alternatives_evaluated: List[Dict[str, Any]]
    ranking_rationale: str
    before_vs_after: List[StateComparison]
    human_approvals_triggered: List[ApprovalRequest]
    new_conflicts_count: int
    readiness_impact: Dict[str, Any]
    final_revised_plan_summary: str
