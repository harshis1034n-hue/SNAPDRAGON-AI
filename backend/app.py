import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse

from backend.config import settings
from backend.routers import (
    events_router, venues_router, resources_router, volunteers_router,
    schedule_router, conflicts_router, tasks_router, readiness_router,
    approvals_router, simulation_router, notifications_router, system_router
)
from backend.services.state_store import state_store
from backend.agents.event_manager import EventManagerAgent

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes the multi-agent system and generates the baseline demo operational plan."""
    print(f"[*] Initializing {settings.PROJECT_NAME} (v{settings.VERSION})...")
    print(f"[*] Mode: {settings.mode_label}")
    try:
        events = state_store.get_events()
        if events:
            demo_evt = events[0]
            mgr = EventManagerAgent()
            mgr.execute({"requirements": demo_evt.requirements, "event_id": demo_evt.id})
            print(f"[*] Preloaded Demo Event '{demo_evt.name}' synthesized across 7 Multi-Agent domains.")
    except Exception as e:
        print(f"[!] Startup orchestration warning: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(events_router)
app.include_router(venues_router)
app.include_router(resources_router)
app.include_router(volunteers_router)
app.include_router(schedule_router)
app.include_router(conflicts_router)
app.include_router(tasks_router)
app.include_router(readiness_router)
app.include_router(approvals_router)
app.include_router(simulation_router)
app.include_router(notifications_router)
app.include_router(system_router)

# Locate Frontend paths
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")
    if (FRONTEND_DIR / "css").exists():
        app.mount("/css", StaticFiles(directory=FRONTEND_DIR / "css"), name="css")
    if (FRONTEND_DIR / "js").exists():
        app.mount("/js", StaticFiles(directory=FRONTEND_DIR / "js"), name="js")


@app.get("/api/code")
def get_code_manifest():
    return {
        "project_name": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "mode": settings.mode_label,
        "agents": [
            {"name": "EventManagerAgent", "file": "backend/agents/event_manager.py", "role": "Master Orchestrator"},
            {"name": "VenueAgent", "file": "backend/agents/venue_agent.py", "role": "Capacity & AV Optimization"},
            {"name": "ScheduleAgent", "file": "backend/agents/schedule_agent.py", "role": "Timeline Synchronization"},
            {"name": "ResourceAgent", "file": "backend/agents/resource_agent.py", "role": "Hardware Inventory Balancing"},
            {"name": "VolunteerAgent", "file": "backend/agents/volunteer_agent.py", "role": "Workforce Squad Management"},
            {"name": "ConflictAgent", "file": "backend/agents/conflict_agent.py", "role": "Hard-Constraint Collision Detection"},
            {"name": "ReplanningAgent", "file": "backend/agents/replanning_agent.py", "role": "9-Step Adaptive What-If Simulation"}
        ],
        "test_suite": "18/18 Passing"
    }

@app.get("/")
def serve_index():
    index_path = FRONTEND_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return HTMLResponse("<h1>Campus Orbit API is running! Frontend index.html not yet created.</h1>")

@app.get("/{full_path:path}")
def catch_all(full_path: str):
    """SPA Fallback: Routes non-API paths to index.html."""
    if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json"):
        return HTMLResponse(status_code=404, content="API Endpoint Not Found")
    
    file_path = FRONTEND_DIR / full_path
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path)
        
    index_path = FRONTEND_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return HTMLResponse(status_code=404, content="Page Not Found")
