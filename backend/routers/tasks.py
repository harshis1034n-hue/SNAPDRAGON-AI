from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any
from backend.models.schemas import Task, TaskUpdate
from backend.services.state_store import state_store

router = APIRouter(prefix="/api/tasks", tags=["Tasks & Checklists"])

@router.get("", response_model=List[Task])
def list_tasks():
    """Returns all operational tasks and automated checklists."""
    return state_store.get_tasks()

@router.patch("/{task_id}", response_model=Task)
def update_task_status(task_id: str, update_data: TaskUpdate):
    """Updates task status, priority, or assigned team."""
    updates = {k: v for k, v in update_data.model_dump().items() if v is not None}
    updated = state_store.update_task(task_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found.")
    return updated

@router.post("", response_model=Task)
def create_custom_task(task: Task):
    """Adds a new operational task."""
    return state_store.add_task(task)
