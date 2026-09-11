import { API } from '../api.js';
import { openExplainModal } from '../utils/explain_modal.js';
import { showToast } from '../utils/toast.js';

export async function renderSimulation() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-center py-16 text-slate-400">
      <svg class="animate-spin h-5 w-5 text-indigo-500 mr-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
      Initializing Dynamic Replanning Simulation Center...
    </div>
  `;

  try {
    const scenarios = await API.getSimulationScenarios();

    container.innerHTML = `
      <div class="view-section space-y-6 max-w-6xl mx-auto">
        <!-- Header -->
        <div class="glass-card rounded-2xl p-6 border border-purple-500/30 bg-gradient-to-r from-slate-900 via-purple-950/40 to-indigo-950/40 relative overflow-hidden">
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-900/80 border border-purple-500/40 text-purple-300 font-mono">ADAPTIVE MULTI-AGENT ENGINE</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Simulation Center ("What If?")</h1>
              <p class="text-sm text-slate-300 max-w-2xl mt-1">
                Inject real-world operational disruptions to evaluate how Campus Orbit evaluates hard constraints, searches alternative campus facilities, computes state deltas, and synthesizes revised operational plans.
              </p>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-3 py-1.5 rounded-xl bg-purple-950 border border-purple-500/30 text-xs font-mono text-purple-300 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span> 9-Step Pipeline Active
              </span>
            </div>
          </div>
        </div>

        <!-- Scenario Selector Grid -->
        <div class="space-y-3">
          <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider">Select a Disruption Scenario to Simulate:</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${scenarios.map(sc => `
              <div class="scenario-card glass-card rounded-2xl p-5 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition flex flex-col justify-between space-y-3 group" data-id="${sc.id}">
                <div>
                  <div class="flex items-start justify-between">
                    <span class="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">${sc.category}</span>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded ${
                      sc.severity === 'Critical' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'
                    }">${sc.severity}</span>
                  </div>
                  <h3 class="text-base font-bold text-white group-hover:text-purple-300 transition mt-1">${sc.name}</h3>
                  <p class="text-xs text-slate-400 mt-1 leading-relaxed">${sc.description}</p>
                </div>
                <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span class="text-xs text-indigo-400 font-semibold group-hover:translate-x-1 transition">Simulate Disruption →</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Custom Disruption Input -->
        <div class="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
          <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Or Enter Custom Campus Disruption</h3>
          <div class="flex flex-col sm:flex-row gap-3">
            <input type="text" id="custom-disruption-input" placeholder="e.g. Heavy rain floods ground floor; move registrations and catering upstairs..." class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500">
            <button id="run-custom-sim-btn" class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition shrink-0">
              Simulate Custom Event
            </button>
          </div>
        </div>

        <!-- Simulation Results Section (Dynamically Populated) -->
        <div id="simulation-output-container" class="space-y-6 hidden">
          <!-- Will be rendered by runSimulationWorkflow -->
        </div>
      </div>
    `;

    // Attach scenario click listeners
    document.querySelectorAll('.scenario-card').forEach(card => {
      card.addEventListener('click', async () => {
        const scenarioId = card.getAttribute('data-id');
        await runSimulationWorkflow(scenarioId, null);
      });
    });

    document.getElementById('run-custom-sim-btn')?.addEventListener('click', async () => {
      const customText = document.getElementById('custom-disruption-input').value;
      if (!customText) return showToast('Please enter a disruption description.', 'warning');
      await runSimulationWorkflow(null, customText);
    });

  } catch (err) {
    console.error('Simulation render error:', err);
    container.innerHTML = `<div class="p-6 text-rose-400">Error loading simulation: ${err.message}</div>`;
  }
}

async function runSimulationWorkflow(scenarioId, customText) {
  const output = document.getElementById('simulation-output-container');
  output.classList.remove('hidden');
  output.scrollIntoView({ behavior: 'smooth' });

  output.innerHTML = `
    <div class="glass-card rounded-2xl p-8 border border-purple-500/40 text-center space-y-4">
      <div class="relative w-14 h-14 mx-auto">
        <svg class="animate-spin h-14 w-14 text-purple-500" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
        <div class="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-purple-300">AI</div>
      </div>
      <h3 class="text-lg font-extrabold text-white">Dynamic Replanning Engine In Progress</h3>
      <p class="text-xs text-slate-400 max-w-md mx-auto">Executing 9-step adaptive replanning pipeline: Disruption intake → Impact cascade → Hard constraint check → Alternative ranking → Before/After state delta...</p>
    </div>
  `;

  try {
    const result = await API.triggerReplanning(scenarioId, customText || '');

    output.innerHTML = `
      <div class="space-y-6 animate-in fade-in duration-300">
        <!-- Banner -->
        <div class="p-6 rounded-2xl bg-slate-900 border border-purple-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono">SIMULATION COMPLETE</span>
              <span class="text-xs text-slate-400 font-mono">${result.simulation_id}</span>
            </div>
            <h2 class="text-xl font-extrabold text-white mt-1">${result.scenario_name}</h2>
            <p class="text-xs text-slate-300 mt-1">${result.disruption_summary}</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button id="apply-replan-btn" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              APPLY APPROVED REVISED PLAN
            </button>
          </div>
        </div>

        <!-- 9-Step Pipeline Stepper -->
        <div class="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              9-Stage Multi-Agent Replanning Stepper
            </h3>
            <span class="text-xs font-mono text-emerald-400">9/9 Completed</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            ${result.steps_executed.map(step => `
              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="font-mono font-bold text-[10px] text-purple-400 uppercase">Step ${step.step_number}</span>
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <div class="font-bold text-slate-200">${step.title}</div>
                <p class="text-[11px] text-slate-400 leading-snug">${step.description}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- VISUALLY IMPRESSIVE BEFORE vs AFTER VIEW -->
        <div class="glass-card rounded-2xl p-6 border border-indigo-500/30 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 class="text-base font-extrabold text-white">Before vs After Operational Delta</h3>
              <p class="text-xs text-slate-400">Direct comparison of original scheduled state vs AI adaptive resolution.</p>
            </div>
            <button id="why-sim-btn" class="px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Why this selection?
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${result.before_vs_after.map(comp => `
              <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div class="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                  <span>${comp.component}</span>
                  ${comp.approval_needed ? `<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">Human Approval Required</span>` : ''}
                </div>

                <div class="grid grid-cols-2 gap-3 text-xs">
                  <!-- BEFORE -->
                  <div class="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 space-y-1">
                    <span class="text-[10px] font-bold text-rose-400 uppercase font-mono block">BEFORE (Disrupted)</span>
                    ${Object.entries(comp.before).map(([k, v]) => `
                      <div class="text-[11px] text-slate-300"><span class="text-slate-500 capitalize">${k}:</span> <strong>${v}</strong></div>
                    `).join('')}
                  </div>

                  <!-- AFTER -->
                  <div class="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                    <span class="text-[10px] font-bold text-emerald-400 uppercase font-mono block">AFTER (Adapted)</span>
                    ${Object.entries(comp.after).map(([k, v]) => `
                      <div class="text-[11px] text-slate-300"><span class="text-slate-500 capitalize">${k}:</span> <strong>${v}</strong></div>
                    `).join('')}
                  </div>
                </div>

                <div class="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <strong class="text-purple-300">Rationale:</strong> ${comp.reason}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Ranked Alternatives Evaluated -->
        <div class="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 class="text-sm font-bold text-white uppercase tracking-wider">Multi-Criteria Candidate Ranking</h3>
          <div class="space-y-2">
            ${result.alternatives_evaluated.map(alt => `
              <div class="p-3.5 rounded-xl ${alt.selected ? 'bg-purple-950/30 border border-purple-500/40' : 'bg-slate-900/60 border border-slate-800'} flex items-center justify-between text-xs">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-bold ${alt.selected ? 'text-purple-300' : 'text-slate-400'}">Rank #${alt.rank}: ${alt.venue_name}</span>
                    ${alt.selected ? `<span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-900 text-purple-200">Selected Solution</span>` : ''}
                  </div>
                  <div class="flex flex-wrap gap-2 text-[11px] text-slate-400">
                    <span class="text-emerald-400">✓ ${alt.pros.join(' • ')}</span>
                    ${alt.cons?.length ? `<span class="text-amber-400">! ${alt.cons.join(' • ')}</span>` : ''}
                  </div>
                </div>
                <div class="text-right pl-4">
                  <span class="text-base font-mono font-bold text-purple-400">${alt.score}%</span>
                  <span class="block text-[9px] text-slate-500 uppercase">Fitness Score</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.getElementById('why-sim-btn')?.addEventListener('click', () => {
      openExplainModal('relocation', {
        before_venue: 'Main Auditorium',
        after_venue: 'Innovation Hall',
        reason: result.disruption_summary,
        fallback: result.ranking_rationale
      }, 'Why: Adaptive Relocation Selection');
    });

    document.getElementById('apply-replan-btn')?.addEventListener('click', async () => {
      try {
        await API.applyReplanning(result.simulation_id, result.before_vs_after);
        showToast('Dynamic replanning ratified! Schedule and venues updated.', 'success', 'Committed');
        window.location.hash = '#schedule';
      } catch (e) {
        showToast('Error applying replan: ' + e.message, 'error');
      }
    });

  } catch (err) {
    showToast('Simulation error: ' + err.message, 'error');
  }
}
