from fastapi import APIRouter
from typing import List
from backend.models.schemas import Notification
from backend.services.state_store import state_store

router = APIRouter(prefix="/api/notifications", tags=["Notifications & Alerts"])

@router.get("", response_model=List[Notification])
def get_notifications():
    """Returns active critical, warning, info, and success notification feeds."""
    return state_store.get_notifications()

@router.post("/mark-all-read")
def mark_all_notifications_as_read():
    state_store.mark_all_notifications_read()
    return {"status": "Success", "message": "All notifications marked as read."}
