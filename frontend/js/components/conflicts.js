import { API } from '../api.js';
import { openExplainModal } from '../utils/explain_modal.js';
import { showToast } from '../utils/toast.js';

export async function renderConflicts() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-center py-16 text-slate-400">
      <svg class="animate-spin h-5 w-5 text-indigo-500 mr-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
      Scanning for multi-dimensional schedule & resource conflicts...
    </div>
  `;

  try {
    const conflicts = await API.getConflicts();
    const active = conflicts.filter(c => c.status === 'Active');
    const resolved = conflicts.filter(c => c.status === 'Resolved');

    container.innerHTML = `
      <div class="view-section space-y-6 max-w-5xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 border border-rose-500/40 text-rose-300 font-mono">COLLISION & CONSTRAINT ENGINE</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Conflict Detection & Resolution</h1>
            <p class="text-sm text-slate-400">Deterministic constraint validator continuously auditing venue double-bookings, capacity limits, and inventory shortages.</p>
          </div>
          <div class="flex items-center gap-3">
            <button id="re-check-conflicts-btn" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-2">
              <svg class="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Run Full Constraint Scan
            </button>
          </div>
        </div>

        <!-- Active Conflicts Section -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-bold text-white flex items-center gap-2">
              <span>Active Conflicts</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                active.length > 0 ? 'bg-rose-950 text-rose-300 border border-rose-500/30' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
              }">${active.length}</span>
            </h2>
          </div>

          ${active.length === 0 ? `
            <div class="p-8 text-center glass-card rounded-2xl border border-emerald-500/30 space-y-2">
              <div class="w-10 h-10 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mx-auto">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 class="text-base font-bold text-white">All Clear! No Active Conflicts</h3>
              <p class="text-xs text-slate-400">All venues, schedules, equipment inventory, and squads satisfy hard operational constraints.</p>
            </div>
          ` : `
            <div class="space-y-4">
              ${active.map(c => `
                <div class="glass-card rounded-2xl p-6 border ${
                  c.severity === 'Critical' ? 'border-rose-500/40 bg-rose-950/15' : 'border-amber-500/40 bg-amber-950/15'
                } space-y-4">
                  <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div class="flex items-start gap-3">
                      <div class="w-9 h-9 rounded-xl ${
                        c.severity === 'Critical' ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30' : 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                      } flex items-center justify-center shrink-0">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-mono font-bold px-2 py-0.5 rounded ${
                            c.severity === 'Critical' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'
                          }">${c.severity.toUpperCase()} CONFLICT</span>
                          <span class="text-xs text-slate-400 font-mono">${c.category} Category</span>
                        </div>
                        <h3 class="text-base font-bold text-white mt-1">${c.title}</h3>
                        <p class="text-xs text-slate-300 mt-1 leading-relaxed">${c.description}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Affected Components Chips -->
                  <div class="flex flex-wrap items-center gap-2 pl-12 text-xs">
                    <span class="text-[10px] uppercase font-mono text-slate-500">Affected:</span>
                    ${c.affected_components.map(comp => `<span class="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-xs">${comp}</span>`).join('')}
                  </div>

                  <!-- AI Recommendation Box -->
                  <div class="ml-12 p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        AI Recommended Resolution
                      </span>
                      <button class="why-conflict-btn text-[11px] text-purple-300 hover:text-purple-200 font-semibold underline underline-offset-2" data-id="${c.id}">Why this recommendation?</button>
                    </div>
                    <p class="text-xs text-slate-200 leading-relaxed font-medium">${c.recommendation}</p>
                  </div>

                  <!-- Actions Bar -->
                  <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                    <button class="dismiss-conflict-btn px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold transition" data-id="${c.id}">
                      Dismiss
                    </button>
                    <button class="resolve-conflict-btn px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition" data-id="${c.id}">
                      APPLY RECOMMENDATION
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Resolved History Section -->
        ${resolved.length > 0 ? `
          <div class="pt-6 border-t border-slate-800 space-y-3">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider">Resolved Conflict Log (${resolved.length})</h3>
            <div class="space-y-2">
              ${resolved.map(rc => `
                <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span class="font-semibold text-slate-300 line-through">${rc.title}</span>
                  </div>
                  <span class="text-emerald-400 font-mono">Resolved</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Action listeners
    document.getElementById('re-check-conflicts-btn')?.addEventListener('click', async () => {
      await API.checkConflicts();
      showToast('Multi-agent constraint audit complete.', 'info', 'Conflict Agent');
      renderConflicts();
    });

    document.querySelectorAll('.resolve-conflict-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        try {
          await API.resolveConflict(id);
          showToast('Conflict resolved and recommendation applied live.', 'success', 'Resolved');
          renderConflicts();
        } catch (err) {
          showToast('Error: ' + err.message, 'error');
        }
      });
    });

    document.querySelectorAll('.dismiss-conflict-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        await API.dismissConflict(id);
        showToast('Conflict dismissed.', 'info');
        renderConflicts();
      });
    });

    document.querySelectorAll('.why-conflict-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const c = conflicts.find(item => item.id === id);
        if (c) {
          openExplainModal('relocation', {
            before_venue: 'Main Auditorium',
            after_venue: 'Innovation Hall',
            reason: c.description,
            fallback: c.why_explanation
          }, `Why: ${c.title}`);
        }
      });
    });

  } catch (err) {
    console.error('Conflicts render error:', err);
    container.innerHTML = `<div class="p-6 text-rose-400">Error loading conflicts: ${err.message}</div>`;
  }
}
