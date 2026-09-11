import { API } from '../api.js';

export async function renderReadiness() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-center py-16 text-slate-400">
      <svg class="animate-spin h-5 w-5 text-indigo-500 mr-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
      Computing calculated event readiness indices...
    </div>
  `;

  try {
    const readiness = await API.getReadiness();

    container.innerHTML = `
      <div class="view-section space-y-6 max-w-5xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono">CALCULATED AUDIT METRIC</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Event Readiness Dashboard</h1>
            <p class="text-sm text-slate-400">Dynamic score calculated from live venue availability, equipment allocations, squad headcount, and statutory approvals.</p>
          </div>
          <div class="text-right">
            <span class="text-xs text-slate-500 font-mono block">Last Calculated:</span>
            <span class="text-xs text-slate-300 font-mono">${readiness.last_updated}</span>
          </div>
        </div>

        <!-- Master Score Hero Card -->
        <div class="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-purple-950/20">
          <div class="flex items-center gap-6">
            <div class="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path class="text-slate-800" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="${readiness.overall_score >= 80 ? 'text-emerald-500' : readiness.overall_score >= 60 ? 'text-amber-500' : 'text-rose-500'}" stroke-dasharray="${readiness.overall_score}, 100" stroke-width="3" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span class="absolute text-2xl font-extrabold text-white font-mono">${readiness.overall_score}%</span>
            </div>
            <div class="space-y-1">
              <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">OVERALL EVENT READINESS</div>
              <h2 class="text-2xl font-extrabold text-white">${readiness.readiness_level} Status</h2>
              <p class="text-xs text-slate-300 max-w-md">Weighted composite of 8 campus functional domains. Resolving pending approvals and shortages will advance score towards 100%.</p>
            </div>
          </div>

          <div class="space-y-2 shrink-0 text-xs font-mono">
            <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
              <span class="text-slate-400">Key Blockers:</span>
              <strong class="text-rose-400">${readiness.key_blockers.length} Items</strong>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
              <span class="text-slate-400">Total Categories:</span>
              <strong class="text-indigo-400">8 Domains</strong>
            </div>
          </div>
        </div>

        <!-- 8 Categories Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${Object.values(readiness.categories).map(cat => `
            <div class="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-white">${cat.category_name}</span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded ${
                    cat.status === 'Good' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                  }">${cat.status}</span>
                </div>
                <span class="text-lg font-mono font-bold ${
                  cat.score >= 80 ? 'text-emerald-400' : cat.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                }">${cat.score}%</span>
              </div>

              <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div class="h-full rounded-full ${
                  cat.score >= 80 ? 'bg-emerald-500' : cat.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                }" style="width: ${cat.score}%"></div>
              </div>

              <div class="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>${cat.details}</span>
                <span class="font-mono text-[10px] text-slate-500">Weight: ${cat.weight}x</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Blockers and Recommendations -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <svg class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Active Blockers (${readiness.key_blockers.length})
            </h3>
            <ul class="space-y-2 text-xs text-slate-300">
              ${readiness.key_blockers.map(b => `
                <li class="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span>${b}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Recommended AI Mitigations
            </h3>
            <ul class="space-y-2 text-xs text-slate-300">
              ${readiness.recommended_actions.map(a => `
                <li class="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                  <span>${a}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;

  } catch (err) {
    console.error('Readiness render error:', err);
    container.innerHTML = `<div class="p-6 text-rose-400">Error loading readiness: ${err.message}</div>`;
  }
}
