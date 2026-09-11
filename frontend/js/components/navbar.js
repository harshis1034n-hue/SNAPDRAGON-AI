import { API } from '../api.js';
import { showToast } from '../utils/toast.js';

export async function renderNavbar(activeRoute = 'dashboard') {
  const navContainer = document.getElementById('navbar-container');
  if (!navContainer) return;

  let status = { mode: 'DEMO MODE', version: '1.0.0' };
  let readiness = { overall_score: 82, readiness_level: 'Ready' };
  let notifs = [];

  try {
    const [st, rd, nt] = await Promise.all([
      API.getSystemStatus(),
      API.getReadiness(),
      API.getNotifications()
    ]);
    status = st;
    readiness = rd;
    notifs = nt;
  } catch (e) {
    console.error('Navbar data fetch error:', e);
  }

  const unreadCount = notifs.filter(n => !n.read).length;

  navContainer.innerHTML = `
    <header class="glass-panel sticky top-0 z-50 px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
      <div class="flex items-center gap-6">
        <a href="#landing" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-sky-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition duration-200">
            <div class="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <svg class="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M12 3v18"></path>
                <path d="M3 12h18"></path>
                <circle cx="12" cy="12" r="3" class="fill-indigo-500/40 text-purple-400"></circle>
              </svg>
            </div>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-lg font-extrabold tracking-tight text-white font-mono">CAMPUS<span class="text-indigo-400">ORBIT</span></span>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                status.mode === 'AI MODE' ? 'bg-purple-900/60 border border-purple-500/40 text-purple-300' : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
              }">${status.mode}</span>
            </div>
            <p class="text-[11px] text-slate-400 hidden sm:block">Plan smarter. Coordinate automatically. Adapt instantly.</p>
          </div>
        </a>
      </div>

      <div class="flex items-center gap-4">
        <!-- Readiness Metric Pill -->
        <a href="#readiness" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition">
          <div class="relative w-7 h-7 flex items-center justify-center">
            <svg class="w-7 h-7 transform -rotate-90" viewBox="0 0 36 36">
              <path class="text-slate-800" stroke-width="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="${readiness.overall_score >= 80 ? 'text-emerald-500' : readiness.overall_score >= 60 ? 'text-amber-500' : 'text-rose-500'}" stroke-dasharray="${readiness.overall_score}, 100" stroke-width="3.5" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span class="absolute text-[10px] font-bold text-white font-mono">${readiness.overall_score}%</span>
          </div>
          <div class="text-left hidden md:block">
            <div class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Event Readiness</div>
            <div class="text-xs font-bold ${readiness.overall_score >= 80 ? 'text-emerald-400' : 'text-amber-400'}">${readiness.readiness_level}</div>
          </div>
        </a>

        <!-- Notification Bell Dropdown -->
        <div class="relative">
          <a href="#notifications" class="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-300 relative transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            ${unreadCount > 0 ? `<span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">${unreadCount}</span>` : ''}
          </a>
        </div>

        <!-- Reset Demo Button -->
        <button id="reset-demo-nav-btn" title="Reset all datasets to pristine demo baseline" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 font-medium transition">
          <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          <span class="hidden sm:inline">Reset Demo</span>
        </button>

        <!-- Quick AI Planner Button -->
        <a href="#ai-planner" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          <span>AI Planner</span>
        </a>
      </div>
    </header>
  `;

  document.getElementById('reset-demo-nav-btn')?.addEventListener('click', async () => {
    if (confirm('Reset Campus Orbit to default Hackathon demo state?')) {
      await API.resetDemoData();
      showToast('Data reset to pristine Hackathon baseline.', 'success', 'Demo Reset');
      window.location.reload();
    }
  });
}
