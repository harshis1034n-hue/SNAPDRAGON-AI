import { API } from '../api.js';
import { openExplainModal } from '../utils/explain_modal.js';
import { showToast } from '../utils/toast.js';

export async function renderResources() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-center py-16 text-slate-400">
      <svg class="animate-spin h-5 w-5 text-indigo-500 mr-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
      Loading equipment & resource inventory...
    </div>
  `;

  try {
    const resources = await API.getResources();
    const totalItems = resources.reduce((acc, r) => acc + r.total, 0);
    const totalAllocated = resources.reduce((acc, r) => acc + r.allocated, 0);
    const shortages = resources.filter(r => r.shortage > 0);

    container.innerHTML = `
      <div class="view-section space-y-6 max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono">EQUIPMENT & HARDWARE LOGISTICS</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Resource Inventory Management</h1>
            <p class="text-sm text-slate-400">Track 8 hardware categories, monitor real-time allocation vs availability, and auto-generate borrowing recommendations.</p>
          </div>
          <div class="flex items-center gap-3">
            <button id="sim-res-deficit-btn" class="px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              Simulate Hardware Shortage
            </button>
          </div>
        </div>

        <!-- Shortage Alert Banner if any -->
        ${shortages.length > 0 ? `
          <div class="p-4 rounded-xl bg-amber-950/50 border border-amber-500/40 space-y-2">
            <div class="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Active Hardware Shortage Alert (${shortages.length} Categories)
            </div>
            ${shortages.map(s => `
              <div class="flex items-center justify-between text-xs text-slate-200 pl-6">
                <span><strong>${s.name}:</strong> Required ${s.allocated}, Available ${s.total} (Shortage: <span class="text-rose-400 font-bold">${s.shortage}</span>). ${s.recommendation}</span>
                <button class="px-2 py-1 rounded bg-purple-900 text-purple-200 text-[10px] font-semibold" onclick="window.whyShortage('${s.name}', ${s.shortage})">Why?</button>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Inventory Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          ${resources.map(r => {
            const pct = Math.min(100, Math.round((r.allocated / (r.total || 1)) * 100));
            const isShort = r.shortage > 0;
            return `
              <div class="glass-card rounded-2xl p-5 border ${isShort ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800'} flex flex-col justify-between space-y-4">
                <div>
                  <div class="flex items-start justify-between">
                    <div>
                      <span class="text-[10px] font-mono uppercase tracking-wider text-slate-500">${r.category}</span>
                      <h3 class="text-base font-bold text-white">${r.name}</h3>
                    </div>
                    <span class="text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isShort ? 'bg-rose-950 text-rose-300 border border-rose-500/30' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    }">${isShort ? `-${r.shortage} Short` : 'Optimal'}</span>
                  </div>

                  <div class="grid grid-cols-3 gap-2 mt-4 text-center font-mono">
                    <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span class="text-[9px] text-slate-500 uppercase block">Total</span>
                      <strong class="text-slate-200 text-xs">${r.total}</strong>
                    </div>
                    <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span class="text-[9px] text-slate-500 uppercase block">Allocated</span>
                      <strong class="text-indigo-300 text-xs">${r.allocated}</strong>
                    </div>
                    <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span class="text-[9px] text-slate-500 uppercase block">Available</span>
                      <strong class="text-emerald-400 text-xs">${r.available}</strong>
                    </div>
                  </div>

                  <div class="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div class="h-full rounded-full ${isShort ? 'bg-rose-500' : 'bg-indigo-500'}" style="width: ${pct}%"></div>
                  </div>
                </div>

                <div class="pt-2 border-t border-slate-800/80">
                  <p class="text-[11px] text-slate-400 leading-tight">${r.recommendation || 'Stock calibrated.'}</p>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    document.getElementById('sim-res-deficit-btn')?.addEventListener('click', async () => {
      try {
        await API.simulateResourceDeficit('res-projectors', 3);
        showToast('Simulated shortage of 3 Projectors. Resource Agent recalculated inventory.', 'warning', 'Disruption');
        renderResources();
      } catch (e) {
        showToast('Error: ' + e.message, 'error');
      }
    });

    window.whyShortage = (resName, count) => {
      openExplainModal('resource_shortage', {
        resource_name: resName,
        shortage: count,
        fallback: `Shortage of ${count} ${resName} detected. Automated borrow recommendation dispatched to Media Services Dept.`
      }, `Why: ${resName} Shortage Recommendation`);
    };

  } catch (err) {
    console.error('Resources render error:', err);
    container.innerHTML = `<div class="p-6 text-rose-400">Error loading resources: ${err.message}</div>`;
  }
}
