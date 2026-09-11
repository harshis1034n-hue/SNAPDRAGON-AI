// Campus Orbit API Client
const API_BASE = '/api';

export const API = {
  // System
  async getSystemStatus() {
    const res = await fetch(`${API_BASE}/system/status`);
    return res.json();
  },
  async explainDecision(topic, context = {}) {
    const res = await fetch(`${API_BASE}/system/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, context })
    });
    return res.json();
  },

  // Events & AI Intake
  async parseEventPrompt(prompt, options = {}) {
    const res = await fetch(`${API_BASE}/events/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_prompt: prompt, ...options })
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to parse prompt');
    return res.json();
  },
  async getAllEvents() {
    const res = await fetch(`${API_BASE}/events`);
    return res.json();
  },
  async getEvent(id) {
    const res = await fetch(`${API_BASE}/events/${id}`);
    return res.json();
  },
  async createEvent(requirements) {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requirements)
    });
    return res.json();
  },
  async generateEventPlan(eventId) {
    const res = await fetch(`${API_BASE}/events/${eventId}/plan`, { method: 'POST' });
    return res.json();
  },
  async resetDemoData() {
    const res = await fetch(`${API_BASE}/events/system/reset-demo`, { method: 'POST' });
    return res.json();
  },

  // Venues
  async getVenues() {
    const res = await fetch(`${API_BASE}/venues`);
    return res.json();
  },
  async updateVenue(id, data) {
    const res = await fetch(`${API_BASE}/venues/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async getVenueAlternatives(id, capacity = 250) {
    const res = await fetch(`${API_BASE}/venues/${id}/alternatives?required_capacity=${capacity}`);
    return res.json();
  },

  // Resources
  async getResources() {
    const res = await fetch(`${API_BASE}/resources`);
    return res.json();
  },
  async updateResource(id, data) {
    const res = await fetch(`${API_BASE}/resources/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async simulateResourceDeficit(resourceId, deficit = 3) {
    const res = await fetch(`${API_BASE}/resources/simulate-deficit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource_id: resourceId, deficit })
    });
    return res.json();
  },

  // Volunteers
  async getVolunteers() {
    const res = await fetch(`${API_BASE}/volunteers`);
    return res.json();
  },
  async rebalanceVolunteers(absentCount = 5, teamId = 'team-reg') {
    const res = await fetch(`${API_BASE}/volunteers/rebalance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ absent_count: absentCount, affected_team_id: teamId })
    });
    return res.json();
  },

  // Schedule
  async getSchedule() {
    const res = await fetch(`${API_BASE}/schedule`);
    return res.json();
  },
  async updateScheduleItem(id, updates) {
    const res = await fetch(`${API_BASE}/schedule/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Conflicts
  async getConflicts() {
    const res = await fetch(`${API_BASE}/conflicts`);
    return res.json();
  },
  async checkConflicts() {
    const res = await fetch(`${API_BASE}/conflicts/check`, { method: 'POST' });
    return res.json();
  },
  async resolveConflict(id) {
    const res = await fetch(`${API_BASE}/conflicts/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'apply_recommendation' })
    });
    return res.json();
  },
  async dismissConflict(id) {
    const res = await fetch(`${API_BASE}/conflicts/${id}/dismiss`, { method: 'POST' });
    return res.json();
  },

  // Tasks
  async getTasks() {
    const res = await fetch(`${API_BASE}/tasks`);
    return res.json();
  },
  async updateTask(id, data) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Readiness
  async getReadiness() {
    const res = await fetch(`${API_BASE}/readiness`);
    return res.json();
  },

  // Approvals
  async getApprovals() {
    const res = await fetch(`${API_BASE}/approvals`);
    return res.json();
  },
  async approveRequest(id, reviewerNotes = '') {
    const res = await fetch(`${API_BASE}/approvals/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewer_notes: reviewerNotes })
    });
    return res.json();
  },
  async rejectRequest(id, reviewerNotes = '') {
    const res = await fetch(`${API_BASE}/approvals/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewer_notes: reviewerNotes })
    });
    return res.json();
  },

  // Simulation & Replanning
  async getSimulationScenarios() {
    const res = await fetch(`${API_BASE}/simulation/scenarios`);
    return res.json();
  },
  async triggerReplanning(scenarioId, customDisruption = '') {
    const res = await fetch(`${API_BASE}/simulation/replan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_id: scenarioId, custom_disruption: customDisruption })
    });
    return res.json();
  },
  async applyReplanning(simulationId, beforeVsAfter) {
    const res = await fetch(`${API_BASE}/simulation/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulation_id: simulationId, before_vs_after: beforeVsAfter })
    });
    return res.json();
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`);
    return res.json();
  },
  async markNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/mark-all-read`, { method: 'POST' });
    return res.json();
  }
};
