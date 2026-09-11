import { API } from '../api.js';
import { openExplainModal } from '../utils/explain_modal.js';
import { showToast } from '../utils/toast.js';

export async function renderVolunteers() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-center py-16 text-slate-400">
      <svg class="animate-spin h-5 w-5 text-indigo-500 mr-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
      Loading volunteer squads & shift roster...
    </div>
  `;

  try {
    const teams = await API.getVolunteers();
    const totalAssigned = teams.reduce((acc, t) => acc + t.assigned_count, 0);
    const totalRequired = teams.reduce((acc, t) => acc + t.required_count, 0);

    container.innerHTML = `
      <div class="view-section space-y-6 max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-950/80 border border-sky-500/40 text-sky-300 font-mono">WORKFORCE COORDINATION</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Volunteer & Support Squads</h1>
            <p class="text-sm text-slate-400">Coordinate 5 specialized operational squads across registration, technical infrastructure, hospitality, and security.</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
              <span class="text-slate-400">Total Workforce:</span> <strong class="text-indigo-400">${totalAssigned}</strong> / ${totalRequired} Organizers
            </div>
            <button id="sim-vol-rebalance-btn" class="px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Simulate 5 Sick & Auto-Rebalance
            </button>
          </div>
        </div>

        <!-- Squad Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${teams.map(t => {
            const isDeficit = t.status === 'Deficit';
            return `
              <div class="glass-card rounded-2xl p-5 border ${isDeficit ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800'} flex flex-col justify-between space-y-4">
                <div>
                  <div class="flex items-start justify-between">
                    <div>
                      <h3 class="text-base font-bold text-white">${t.name}</h3>
                      <span class="text-xs text-indigo-400 font-medium">Lead: ${t.leads.join(', ') || 'Unassigned'}</span>
                    </div>
                    <span class="text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isDeficit ? 'bg-amber-950 text-amber-300 border border-amber-500/30' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    }">${t.assigned_count}/${t.required_count} ${t.status}</span>
                  </div>

                  <div class="mt-4 space-y-2">
                    <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Assigned Members:</div>
                    <div class="flex flex-wrap gap-1.5">
                      ${t.members.map(m => `<span class="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200">${m}</span>`).join('')}
                    </div>
                  </div>

                  <div class="mt-4 space-y-1.5">
                    <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Operational Duties:</div>
                    <ul class="space-y-1">
                      ${t.tasks_assigned.map(task => `
                        <li class="flex items-center gap-1.5 text-xs text-slate-300">
                          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                          <span>${task}</span>
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                </div>

                <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span class="text-slate-400 font-mono text-[10px]">${t.notes || 'Stationed on campus.'}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    document.getElementById('sim-vol-rebalance-btn')?.addEventListener('click', async () => {
      try {
        const res = await API.rebalanceVolunteers(5, 'team-reg');
        showToast(`Dynamic Rebalance: ${res.reallocation_action}`, 'success', 'Volunteer Agent');
        renderVolunteers();
      } catch (e) {
        showToast('Error: ' + e.message, 'error');
      }
    });

  } catch (err) {
    console.error('Volunteers render error:', err);
    container.innerHTML = `<div class="p-6 text-rose-400">Error loading volunteers: ${err.message}</div>`;
  }
}
