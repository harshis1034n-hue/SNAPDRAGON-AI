import { API } from '../api.js';
import { showToast } from '../utils/toast.js';

export async function renderSettings() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-center py-16 text-slate-400">
      <svg class="animate-spin h-5 w-5 text-indigo-500 mr-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
      Loading system settings & AI engine configuration...
    </div>
  `;

  try {
    const status = await API.getSystemStatus();

    container.innerHTML = `
      <div class="view-section space-y-6 max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 font-mono">SYSTEM CONFIGURATION</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Platform Settings & AI Mode</h1>
            <p class="text-sm text-slate-400">Configure LLM backend integration, inspect active runtime parameters, and control demo mode.</p>
          </div>
          <span class="text-xs font-mono font-bold px-3 py-1.5 rounded-xl ${
            status.mode === 'AI MODE' ? 'bg-purple-950 text-purple-300 border border-purple-500/30' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
          }">${status.mode}</span>
        </div>

        <!-- System Status Box -->
        <div class="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 class="text-base font-bold text-white">Runtime Architecture</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span class="text-slate-500 block text-[10px] uppercase">Application</span>
              <strong class="text-slate-200">${status.project_name} (v${status.version})</strong>
            </div>
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span class="text-slate-500 block text-[10px] uppercase">Active Engine</span>
              <strong class="text-indigo-400">${status.mode}</strong>
            </div>
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span class="text-slate-500 block text-[10px] uppercase">AI Provider</span>
              <strong class="text-purple-400">${status.ai_provider} (${status.ai_configured ? 'API Key Configured' : 'Deterministic Semantic NLP Fallback'})</strong>
            </div>
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span class="text-slate-500 block text-[10px] uppercase">Hard-Constraint Validator</span>
              <strong class="text-emerald-400">Deterministic Multi-Agent Engine</strong>
            </div>
          </div>
        </div>

        <!-- Demo Mode Notice Box -->
        <div class="glass-card rounded-2xl p-6 border border-indigo-500/30 space-y-3">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h3 class="text-sm font-bold text-white">Hackathon Demo Mode Ready</h3>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">
            Campus Orbit is designed to be 100% testable and operable out of the box without requiring external paid API keys or cloud database setups. If you wish to configure live Gemini / OpenAI keys, add them to your local <code class="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded font-mono">.env</code> file (see <code class="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded font-mono">.env.example</code>).
          </p>
          <div class="pt-2">
            <button id="reset-system-state-btn" class="px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold transition">
              Reset All Datasets to Clean Demo Baseline
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('reset-system-state-btn')?.addEventListener('click', async () => {
      if (confirm('Reset all venues, resources, volunteers, tasks, and conflicts back to default demo state?')) {
        await API.resetDemoData();
        showToast('All datasets successfully reset to default demo state.', 'success', 'Demo Reset');
        window.location.reload();
      }
    });

  } catch (err) {
    console.error('Settings render error:', err);
    container.innerHTML = `<div class="p-6 text-rose-400">Error loading settings: ${err.message}</div>`;
  }
}
