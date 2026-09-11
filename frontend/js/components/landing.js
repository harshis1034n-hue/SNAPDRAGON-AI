export function renderLanding() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="view-section space-y-16 max-w-6xl mx-auto py-6">
      <!-- Hero Section -->
      <div class="text-center space-y-6 pt-8 pb-4 relative">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-semibold font-mono mb-2">
          <span class="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span> CSE HACKATHON 2026 • MULTI-AGENT AI PLATFORM
        </div>

        <h1 class="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          CAMPUS <span class="ai-gradient-text">ORBIT</span>
        </h1>

        <p class="text-lg sm:text-xl font-medium text-slate-300 max-w-2xl mx-auto italic">
          "Plan smarter. Coordinate automatically. Adapt instantly."
        </p>

        <p class="text-sm sm:text-base text-slate-400 max-w-3xl mx-auto leading-relaxed">
          An agentic AI platform that transforms campus event requirements into executable operational plans and dynamically adapts them when conditions change.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a href="#ai-planner" class="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition transform hover:-translate-y-0.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            TRY AI PLANNER
          </a>
          <a href="#dashboard" class="px-8 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm transition">
            VIEW LIVE DEMO
          </a>
        </div>
      </div>

      <!-- 5-Stage Agentic Workflow Pipeline -->
      <div class="glass-card rounded-3xl p-8 border border-indigo-500/20 space-y-6">
        <div class="text-center space-y-1">
          <h2 class="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">Agentic Orchestration Architecture</h2>
          <h3 class="text-xl sm:text-2xl font-extrabold text-white">How Campus Orbit Works</h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-4 text-center">
          ${[
            { step: '01', title: 'Requirements', desc: 'Natural-language event brief input', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
            { step: '02', title: 'AI Planning', desc: 'Multi-agent domain decomposition', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { step: '03', title: 'Constraint Check', desc: 'Hard collision & capacity check', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
            { step: '04', title: 'Execution', desc: 'Task delegation & readiness audit', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2' },
            { step: '05', title: 'Dynamic Replan', desc: 'Instant What-If adaptation', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' }
          ].map((st, idx) => `
            <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-between space-y-3 relative group hover:border-indigo-500/50 transition">
              <div class="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${st.icon}"></path></svg>
              </div>
              <div>
                <span class="text-[10px] font-mono text-purple-400 font-bold">STEP ${st.step}</span>
                <h4 class="text-sm font-bold text-white mt-0.5">${st.title}</h4>
                <p class="text-[11px] text-slate-400 mt-1">${st.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Core Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
          <div class="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          </div>
          <h3 class="text-base font-bold text-white">Dynamic Replanning ("What If?")</h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            When an auditorium breaks down or equipment goes missing, Campus Orbit re-evaluates all constraints, ranks alternatives, shows BEFORE vs AFTER states, and routes for approval.
          </p>
        </div>

        <div class="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 class="text-base font-bold text-white">Calculated Event Readiness (82%)</h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            Continuously computes readiness score across 8 distinct campus categories: Venue, Equipment, Volunteers, Schedule, Security, Transport, Permissions, and Briefings.
          </p>
        </div>

        <div class="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
          <div class="w-10 h-10 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h3 class="text-base font-bold text-white">Human-in-the-Loop Governance</h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            Sensitive actions—like supplemental catering budget ($1,200), overnight 24/7 lab access, and major plenary venue reallocations—require explicit human approval.
          </p>
        </div>
      </div>
    </div>
  `;
}
