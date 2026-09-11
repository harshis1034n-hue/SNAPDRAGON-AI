from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any, Optional
from backend.models.schemas import ApprovalRequest, Notification
from backend.services.state_store import state_store

router = APIRouter(prefix="/api/approvals", tags=["Human Governance & Approvals"])

@router.get("", response_model=List[ApprovalRequest])
def list_approvals():
    """Returns all governance items requiring human-in-the-loop ratification."""
    return state_store.get_approvals()

@router.post("/{approval_id}/approve", response_model=ApprovalRequest)
def approve_request(approval_id: str, reviewer_notes: Optional[str] = Body(None, embed=True)):
    """Ratifies an AI recommendation for budget, permissions, or venue change."""
    appr = state_store.update_approval(approval_id, "Approved", reviewer_notes or "Approved by Campus Authority.")
    if not appr:
        raise HTTPException(status_code=404, detail="Approval request not found.")
    
    state_store.add_notification(
        Notification(
            id=f"notif-appr-{approval_id}",
            title=f"Approval Ratified: {appr.title[:35]}...",
            message=f"Human reviewer ratified '{appr.title}'. Operational changes authorized.",
            type="Success",
            timestamp="Just now",
            read=False,
            link="/approvals"
        )
    )
    return appr

@router.post("/{approval_id}/reject", response_model=ApprovalRequest)
def reject_request(approval_id: str, reviewer_notes: Optional[str] = Body(None, embed=True)):
    """Rejects an approval request."""
    appr = state_store.update_approval(approval_id, "Rejected", reviewer_notes or "Rejected by Campus Authority.")
    if not appr:
        raise HTTPException(status_code=404, detail="Approval request not found.")
    
    state_store.add_notification(
        Notification(
            id=f"notif-appr-rej-{approval_id}",
            title=f"Approval Rejected: {appr.title[:35]}...",
            message=f"Human reviewer rejected '{appr.title}'. AI must generate alternative.",
            type="Warning",
            timestamp="Just now",
            read=False,
            link="/approvals"
        )
    )
    return appr

@router.post("/{approval_id}/request-changes", response_model=ApprovalRequest)
def request_changes(approval_id: str, feedback: str = Body(..., embed=True)):
    """Requests modifications on an approval proposal."""
    appr = state_store.update_approval(approval_id, "Changes Requested", feedback)
    if not appr:
        raise HTTPException(status_code=404, detail="Approval request not found.")
    return appr
