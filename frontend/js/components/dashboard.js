import { API } from '../api.js';
import { openExplainModal } from '../utils/explain_modal.js';
import { showToast } from '../utils/toast.js';

export async function renderDashboard() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-center py-16">
      <div class="flex items-center gap-3 text-slate-400 text-sm">
        <svg class="animate-spin h-5 w-5 text-indigo-500" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
        Loading Campus Orbit dashboard...
      </div>
    </div>
  `;

  try {
    const [events, readiness, venues, resources, volunteers, conflicts, tasks, status] = await Promise.all([
      API.getAllEvents(),
      API.getReadiness(),
      API.getVenues(),
      API.getResources(),
      API.getVolunteers(),
      API.getConflicts(),
      API.getTasks(),
      API.getSystemStatus()
    ]);

    const activeEvent = events[0] || { name: 'AI Innovation Hackathon 2026', participants: 300, duration: '2 days' };
    const activeConflicts = conflicts.filter(c => c.status === 'Active');
    const criticalConflicts = activeConflicts.filter(c => c.severity === 'Critical');
    const totalVolunteers = volunteers.reduce((acc, t) => acc + t.assigned_count, 0);
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;

    container.innerHTML = `
      <div class="view-section space-y-6">
        <!-- Top Hero Banner -->
        <div class="glass-card relative overflow-hidden rounded-2xl p-6 sm:p-8 border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-purple-950/30">
          <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span> ACTIVE LIVE EVENT
                </span>
                <span class="text-xs text-slate-400 font-mono">Oct 24-25, 2026</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">${activeEvent.name}</h1>
              <p class="text-slate-300 text-sm max-w-2xl">
                Agentic orchestration active across 7 operational sub-agents. Monitoring 300 hackathon participants, 7 venues, and 8 inventory categories in real time.
              </p>
            </div>
            
            <div class="flex flex-wrap items-center gap-3">
              <a href="#simulation" class="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition transform hover:-translate-y-0.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                Simulation Center (What If?)
              </a>
              <a href="#ai-planner" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold flex items-center gap-2 transition">
                <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Plan New Event
              </a>
            </div>
          </div>
        </div>

        <!-- Critical Conflict Warning Bar if Active -->
        ${criticalConflicts.length > 0 ? `
          <div class="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <div>
                <div class="text-xs font-bold text-rose-300 uppercase tracking-wider">Critical Conflict Detected</div>
                <div class="text-sm text-slate-200">${criticalConflicts[0].title}: ${criticalConflicts[0].description}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button class="px-3 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 text-xs font-semibold transition" onclick="window.whyConflict('${criticalConflicts[0].id}')">Why?</button>
              <a href="#conflicts" class="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition">Resolve Now</a>
            </div>
          </div>
        ` : ''}

        <!-- 4 Metric Stats Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="glass-card rounded-xl p-4 border border-slate-800">
            <div class="flex items-center justify-between text-slate-400 mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider">Event Readiness</span>
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-extrabold text-white font-mono">${readiness.overall_score}%</span>
              <span class="text-xs font-semibold text-emerald-400">${readiness.readiness_level}</span>
            </div>
            <div class="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style="width: ${readiness.overall_score}%"></div>
            </div>
          </div>

          <div class="glass-card rounded-xl p-4 border border-slate-800">
            <div class="flex items-center justify-between text-slate-400 mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider">Venues Allocated</span>
              <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-extrabold text-white font-mono">${venues.filter(v => v.status === 'Available').length}/${venues.length}</span>
              <span class="text-xs text-slate-400">Total 1,650 Cap</span>
            </div>
            <a href="#venues" class="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium mt-3 block">View venue matrix →</a>
          </div>

          <div class="glass-card rounded-xl p-4 border border-slate-800">
            <div class="flex items-center justify-between text-slate-400 mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider">Volunteer Force</span>
              <svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-extrabold text-white font-mono">${totalVolunteers}/20</span>
              <span class="text-xs text-emerald-400">5 Squads</span>
            </div>
            <a href="#volunteers" class="text-[11px] text-sky-400 hover:text-sky-300 font-medium mt-3 block">Manage assignments →</a>
          </div>

          <div class="glass-card rounded-xl p-4 border border-slate-800">
            <div class="flex items-center justify-between text-slate-400 mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider">Tasks & Checklists</span>
              <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-extrabold text-white font-mono">${completedTasks}/${tasks.length}</span>
              <span class="text-xs text-purple-400">${Math.round((completedTasks/tasks.length)*100)}% Complete</span>
            </div>
            <a href="#tasks" class="text-[11px] text-purple-400 hover:text-purple-300 font-medium mt-3 block">View checklists →</a>
          </div>
        </div>

        <!-- 2 Column Layout: Readiness Breakdown & Multi-Agent Network -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Readiness Categories (2 Cols) -->
          <div class="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-bold text-white">Calculated Operational Readiness</h3>
                <p class="text-xs text-slate-400">Dynamic weighted score calculated across 8 campus categories</p>
              </div>
              <a href="#readiness" class="text-xs text-indigo-400 hover:text-indigo-300 font-medium">Detailed audit →</a>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              ${Object.values(readiness.categories).map(cat => `
                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-semibold text-slate-200">${cat.category_name}</span>
                      <span class="text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        cat.status === 'Good' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                      }">${cat.status}</span>
                    </div>
                    <p class="text-[11px] text-slate-400 line-clamp-1">${cat.details}</p>
                  </div>
                  <div class="text-right shrink-0 pl-3">
                    <div class="text-base font-mono font-bold ${
                      cat.score >= 80 ? 'text-emerald-400' : cat.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                    }">${cat.score}%</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Multi-Agent Orchestration Visualizer -->
          <div class="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-white">Agentic Orchestration</h3>
              <span class="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">7 Agents</span>
            </div>

            <div class="space-y-2.5">
              ${[
                { name: 'Event Manager Agent', role: 'Master Orchestrator', status: 'Online', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                { name: 'Venue Agent', role: 'Capacity & AV', status: 'Optimal', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16' },
                { name: 'Schedule Agent', role: 'Timeline Sync', status: 'Synced', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                { name: 'Resource Agent', role: 'Inventory Balance', status: 'Allocated', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2' },
                { name: 'Volunteer Agent', role: '5 Squads Active', status: 'Assigned', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857' },
                { name: 'Conflict Agent', role: 'Constraint Engine', status: activeConflicts.length > 0 ? `${activeConflicts.length} Active` : 'Clean', icon: 'M12 9v2m0 4h.01' },
                { name: 'Replanning Agent', role: 'What-If Simulation', status: 'Ready', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9' }
              ].map(ag => `
                <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded bg-purple-900/30 text-purple-400 flex items-center justify-center">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${ag.icon}"></path></svg>
                    </div>
                    <div>
                      <div class="font-semibold text-slate-200">${ag.name}</div>
                      <div class="text-[10px] text-slate-400">${ag.role}</div>
                    </div>
                  </div>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    ag.status.includes('Active') ? 'bg-rose-950 text-rose-300 border border-rose-500/30' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                  }">${ag.status}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    window.whyConflict = (confId) => {
      const conf = conflicts.find(c => c.id === confId);
      if (conf) {
        openExplainModal('relocation', {
          before_venue: 'Main Auditorium',
          after_venue: 'Innovation Hall',
          reason: conf.description,
          fallback: conf.why_explanation
        }, 'Why Relocate to Innovation Hall?');
      }
    };
  } catch (err) {
    console.error('Dashboard render error:', err);
    container.innerHTML = `<div class="p-6 text-rose-400">Failed to load dashboard. ${err.message}</div>`;
  }
}
