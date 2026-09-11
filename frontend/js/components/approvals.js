import { API } from '../api.js';
import { showToast } from '../utils/toast.js';

export async function renderApprovals() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-center py-16 text-slate-400">
      <svg class="animate-spin h-5 w-5 text-indigo-500 mr-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
      Loading human-in-the-loop governance requests...
    </div>
  `;

  try {
    const approvals = await API.getApprovals();
    const pending = approvals.filter(a => a.status === 'Pending');
    const decided = approvals.filter(a => a.status !== 'Pending');

    container.innerHTML = `
      <div class="view-section space-y-6 max-w-5xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 border border-amber-500/40 text-amber-300 font-mono">HUMAN-IN-THE-LOOP GOVERNANCE</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Approvals & Sanctions</h1>
            <p class="text-sm text-slate-400">Statutory review required for departmental budgets, night permits, security protocols, and major venue changes.</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1.5 rounded-xl bg-amber-950 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">${pending.length} Pending Review</span>
          </div>
        </div>

        <!-- Pending Approvals Section -->
        <div class="space-y-4">
          <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider">Pending Action Items (${pending.length})</h2>

          ${pending.length === 0 ? `
            <div class="p-8 text-center glass-card rounded-2xl border border-slate-800 space-y-2">
              <div class="w-10 h-10 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mx-auto">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 class="text-base font-bold text-white">All Governance Requests Ratified</h3>
              <p class="text-xs text-slate-400">Zero pending approval tickets awaiting administrative decision.</p>
            </div>
          ` : `
            <div class="space-y-4">
              ${pending.map(a => `
                <div class="glass-card rounded-2xl p-6 border border-amber-500/40 bg-amber-950/10 space-y-4">
                  <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">${a.category.toUpperCase()}</span>
                        <span class="text-xs text-slate-400 font-mono">ID: ${a.id}</span>
                        <span class="text-xs font-mono px-2 py-0.5 rounded ${
                          a.risk === 'High' ? 'bg-rose-950 text-rose-300' : a.risk === 'Medium' ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-300'
                        }">Risk: ${a.risk}</span>
                      </div>
                      <h3 class="text-base font-bold text-white mt-1">${a.title}</h3>
                    </div>
                    <div class="text-right shrink-0">
                      <span class="text-xs font-mono text-slate-400 block">Est. Cost:</span>
                      <strong class="text-sm font-mono text-emerald-400">${a.estimated_cost}</strong>
                    </div>
                  </div>

                  <!-- Details Grid -->
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <span class="text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono">AI Recommendation</span>
                      <p class="text-slate-200 leading-snug">${a.ai_recommendation}</p>
                    </div>
                    <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Justification & Reason</span>
                      <p class="text-slate-300 leading-snug">${a.reason}</p>
                    </div>
                    <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">Operational Impact</span>
                      <p class="text-slate-300 leading-snug">${a.impact}</p>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/80">
                    <button class="reject-btn px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-xs font-bold transition" data-id="${a.id}">
                      REJECT
                    </button>
                    <button class="req-change-btn px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition" data-id="${a.id}">
                      REQUEST CHANGES
                    </button>
                    <button class="approve-btn px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5" data-id="${a.id}">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                      APPROVE & SANCTION
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Decided Approvals Section -->
        ${decided.length > 0 ? `
          <div class="pt-6 border-t border-slate-800 space-y-3">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider">Historical Decision Log (${decided.length})</h3>
            <div class="space-y-2">
              ${decided.map(da => `
                <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-slate-200">${da.title}</span>
                      <span class="text-[10px] font-mono px-2 py-0.5 rounded ${
                        da.status === 'Approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      }">${da.status}</span>
                    </div>
                    <p class="text-[11px] text-slate-400 mt-0.5">${da.reviewer_notes || 'Decided by Campus Authority.'}</p>
                  </div>
                  <div class="text-right font-mono text-slate-400">${da.estimated_cost}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    document.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id') || e.target.closest('button').getAttribute('data-id');
        await API.approveRequest(id, 'Approved by Hackathon Steering Committee');
        showToast('Approval ratified successfully.', 'success', 'Governance');
        renderApprovals();
      });
    });

    document.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id') || e.target.closest('button').getAttribute('data-id');
        await API.rejectRequest(id, 'Rejected due to budget ceiling');
        showToast('Approval rejected.', 'warning');
        renderApprovals();
      });
    });

    document.querySelectorAll('.req-change-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id') || e.target.closest('button').getAttribute('data-id');
        const feedback = prompt('Enter change request notes for AI adjustment:');
        if (feedback) {
          await API.rejectRequest(id, `Changes requested: ${feedback}`);
          showToast('Changes requested.', 'info');
          renderApprovals();
        }
      });
    });

  } catch (err) {
    console.error('Approvals render error:', err);
    container.innerHTML = `<div class="p-6 text-rose-400">Error loading approvals: ${err.message}</div>`;
  }
}
