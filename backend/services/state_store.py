import threading
from typing import List, Dict, Optional, Any
from datetime import datetime

from backend.models.schemas import (
    Event, Venue, Resource, VolunteerTeam, ScheduleItem, Task,
    Conflict, ApprovalRequest, Notification, SimulationScenario,
    ReadinessDashboardData, ParsedEventRequirements
)
from backend.data.seed_data import (
    get_initial_venues, get_initial_resources, get_initial_volunteers,
    get_initial_schedule, get_initial_tasks, get_initial_conflicts,
    get_initial_approvals, get_initial_notifications, get_simulation_scenarios,
    get_demo_event
)

class StateStore:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(StateStore, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self.lock = threading.RLock()
        self.reset_to_demo()
        self._initialized = True

    def reset_to_demo(self):
        with self.lock:
            self.venues: Dict[str, Venue] = {v.id: v for v in get_initial_venues()}
            self.resources: Dict[str, Resource] = {r.id: r for r in get_initial_resources()}
            self.volunteers: Dict[str, VolunteerTeam] = {t.id: t for t in get_initial_volunteers()}
            self.schedule: Dict[str, ScheduleItem] = {s.id: s for s in get_initial_schedule()}
            self.tasks: Dict[str, Task] = {t.id: t for t in get_initial_tasks()}
            self.conflicts: Dict[str, Conflict] = {c.id: c for c in get_initial_conflicts()}
            self.approvals: Dict[str, ApprovalRequest] = {a.id: a for a in get_initial_approvals()}
            self.notifications: List[Notification] = get_initial_notifications()
            self.scenarios: Dict[str, SimulationScenario] = {s.id: s for s in get_simulation_scenarios()}
            
            demo_evt = get_demo_event()
            self.events: Dict[str, Event] = {demo_evt.id: demo_evt}
            self.active_event_id: str = demo_evt.id
            self.simulation_history: List[Dict[str, Any]] = []

    # --- EVENTS ---
    def get_events(self) -> List[Event]:
        with self.lock:
            return list(self.events.values())

    def get_event(self, event_id: str) -> Optional[Event]:
        with self.lock:
            return self.events.get(event_id)

    def save_event(self, event: Event) -> Event:
        with self.lock:
            self.events[event.id] = event
            self.active_event_id = event.id
            return event

    # --- VENUES ---
    def get_venues(self) -> List[Venue]:
        with self.lock:
            return list(self.venues.values())

    def get_venue(self, venue_id: str) -> Optional[Venue]:
        with self.lock:
            return self.venues.get(venue_id)

    def update_venue(self, venue_id: str, updates: Dict[str, Any]) -> Optional[Venue]:
        with self.lock:
            venue = self.venues.get(venue_id)
            if not venue:
                return None
            data = venue.model_dump()
            data.update(updates)
            updated = Venue(**data)
            self.venues[venue_id] = updated
            return updated

    # --- RESOURCES ---
    def get_resources(self) -> List[Resource]:
        with self.lock:
            # Recompute available and shortage
            res_list = []
            for r in self.resources.values():
                r.available = max(0, r.total - r.allocated)
                r.shortage = max(0, r.allocated - r.total) if r.allocated > r.total else 0
                res_list.append(r)
            return res_list

    def get_resource(self, resource_id: str) -> Optional[Resource]:
        with self.lock:
            return self.resources.get(resource_id)

    def update_resource(self, resource_id: str, updates: Dict[str, Any]) -> Optional[Resource]:
        with self.lock:
            res = self.resources.get(resource_id)
            if not res:
                return None
            data = res.model_dump()
            data.update(updates)
            if "total" in updates or "allocated" in updates:
                total = data.get("total", res.total)
                allocated = data.get("allocated", res.allocated)
                data["available"] = max(0, total - allocated)
                data["shortage"] = max(0, allocated - total)
            updated = Resource(**data)
            self.resources[resource_id] = updated
            return updated

    # --- VOLUNTEERS ---
    def get_volunteers(self) -> List[VolunteerTeam]:
        with self.lock:
            return list(self.volunteers.values())

    def get_volunteer_team(self, team_id: str) -> Optional[VolunteerTeam]:
        with self.lock:
            return self.volunteers.get(team_id)

    def update_volunteer_team(self, team_id: str, updates: Dict[str, Any]) -> Optional[VolunteerTeam]:
        with self.lock:
            team = self.volunteers.get(team_id)
            if not team:
                return None
            data = team.model_dump()
            data.update(updates)
            # Recompute status
            assigned = data.get("assigned_count", team.assigned_count)
            req = data.get("required_count", team.required_count)
            if assigned < req:
                data["status"] = "Deficit"
            elif assigned > req:
                data["status"] = "Surplus"
            else:
                data["status"] = "Adequate"
            updated = VolunteerTeam(**data)
            self.volunteers[team_id] = updated
            return updated

    # --- SCHEDULE ---
    def get_schedule(self) -> List[ScheduleItem]:
        with self.lock:
            return sorted(list(self.schedule.values()), key=lambda s: (s.day, s.start_time))

    def get_schedule_item(self, item_id: str) -> Optional[ScheduleItem]:
        with self.lock:
            return self.schedule.get(item_id)

    def save_schedule_item(self, item: ScheduleItem) -> ScheduleItem:
        with self.lock:
            self.schedule[item.id] = item
            return item

    def update_schedule_item(self, item_id: str, updates: Dict[str, Any]) -> Optional[ScheduleItem]:
        with self.lock:
            item = self.schedule.get(item_id)
            if not item:
                return None
            data = item.model_dump()
            data.update(updates)
            updated = ScheduleItem(**data)
            self.schedule[item_id] = updated
            return updated

    # --- TASKS ---
    def get_tasks(self) -> List[Task]:
        with self.lock:
            return list(self.tasks.values())

    def update_task(self, task_id: str, updates: Dict[str, Any]) -> Optional[Task]:
        with self.lock:
            task = self.tasks.get(task_id)
            if not task:
                return None
            data = task.model_dump()
            data.update(updates)
            updated = Task(**data)
            self.tasks[task_id] = updated
            return updated

    def add_task(self, task: Task) -> Task:
        with self.lock:
            self.tasks[task.id] = task
            return task

    # --- CONFLICTS ---
    def get_conflicts(self) -> List[Conflict]:
        with self.lock:
            return list(self.conflicts.values())

    def update_conflict(self, conflict_id: str, updates: Dict[str, Any]) -> Optional[Conflict]:
        with self.lock:
            c = self.conflicts.get(conflict_id)
            if not c:
                return None
            data = c.model_dump()
            data.update(updates)
            updated = Conflict(**data)
            self.conflicts[conflict_id] = updated
            return updated

    def add_conflict(self, conflict: Conflict) -> Conflict:
        with self.lock:
            self.conflicts[conflict.id] = conflict
            return conflict

    # --- APPROVALS ---
    def get_approvals(self) -> List[ApprovalRequest]:
        with self.lock:
            return list(self.approvals.values())

    def update_approval(self, approval_id: str, status: str, notes: Optional[str] = None) -> Optional[ApprovalRequest]:
        with self.lock:
            appr = self.approvals.get(approval_id)
            if not appr:
                return None
            appr.status = status
            if notes:
                appr.reviewer_notes = notes
            self.approvals[approval_id] = appr
            return appr

    def add_approval(self, approval: ApprovalRequest) -> ApprovalRequest:
        with self.lock:
            self.approvals[approval.id] = approval
            return approval

    # --- NOTIFICATIONS ---
    def get_notifications(self) -> List[Notification]:
        with self.lock:
            return list(self.notifications)

    def add_notification(self, notif: Notification) -> Notification:
        with self.lock:
            self.notifications.insert(0, notif)
            return notif

    def mark_all_notifications_read(self):
        with self.lock:
            for n in self.notifications:
                n.read = True

    # --- SIMULATION ---
    def get_scenarios(self) -> List[SimulationScenario]:
        with self.lock:
            return list(self.scenarios.values())

state_store = StateStore()
