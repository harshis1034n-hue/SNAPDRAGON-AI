// Campus Orbit Master SPA Router & App Initializer
import { renderNavbar } from './components/navbar.js';
import { renderLanding } from './components/landing.js';
import { renderDashboard } from './components/dashboard.js';
import { renderAIPlanner } from './components/ai_planner.js';
import { renderEventPlan } from './components/event_plan.js';
import { renderVenues } from './components/venues.js';
import { renderResources } from './components/resources.js';
import { renderVolunteers } from './components/volunteers.js';
import { renderSchedule } from './components/schedule.js';
import { renderConflicts } from './components/conflicts.js';
import { renderSimulation } from './components/simulation.js';
import { renderTasks } from './components/tasks.js';
import { renderReadiness } from './components/readiness.js';
import { renderApprovals } from './components/approvals.js';
import { renderNotifications } from './components/notifications.js';
import { renderSettings } from './components/settings.js';

const routes = {
  'landing': renderLanding,
  'dashboard': renderDashboard,
  'ai-planner': renderAIPlanner,
  'event-plan': renderEventPlan,
  'venues': renderVenues,
  'resources': renderResources,
  'volunteers': renderVolunteers,
  'schedule': renderSchedule,
  'conflicts': renderConflicts,
  'simulation': renderSimulation,
  'tasks': renderTasks,
  'readiness': renderReadiness,
  'approvals': renderApprovals,
  'notifications': renderNotifications,
  'settings': renderSettings
};

export async function router() {
  const hash = window.location.hash.slice(1).replace(/^\//, '') || 'landing';
  const cleanRoute = routes[hash] ? hash : 'landing';

  // Update active sidebar state
  document.querySelectorAll('.sidebar-nav-item').forEach(el => {
    const target = el.getAttribute('href')?.replace('#', '');
    if (target === cleanRoute) {
      el.className = 'sidebar-nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold transition';
    } else {
      el.className = 'sidebar-nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent text-xs font-semibold transition';
    }
  });

  // Render top navbar
  await renderNavbar(cleanRoute);

  // Render active component
  const renderer = routes[cleanRoute] || renderLanding;
  renderer();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// Initial Boot
window.addEventListener('DOMContentLoaded', () => {
  router();
});

window.addEventListener('hashchange', () => {
  router();
});
