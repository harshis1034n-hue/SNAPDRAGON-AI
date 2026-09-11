import { API } from '../api.js';
import { openExplainModal } from '../utils/explain_modal.js';
import { showToast } from '../utils/toast.js';

export async function renderEventPlan() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-center py-16 text-slate-400">
      <svg class="animate-spin h-5 w-5 text-indigo-500 mr-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
      Loading synthesized operational plan...
    </div>
  `;

  try {
    const events = await API.getAllEvents();
    const event = events[0];
    const plan = event?.operational_plan;

    if (!plan) {
      container.innerHTML = `
        <div class="p-8 text-center glass-card rounded-2xl max-w-xl mx-auto space-y-4">
          <div class="w-12 h-12 rounded-full bg-purple-900/40 text-purple-400 flex items-center justify-center mx-auto">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h2 class="text-xl font-bold text-white">No Active Plan Generated Yet</h2>
          <p class="text-xs text-slate-400">Run the AI Planner to synthesize the multi-agent operational plan.</p>
          <a href="#ai-planner" class="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition">Open AI Planner</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="view-section space-y-6 max-w-6xl mx-auto">
        <!-- Header -->
        <div class="glass-card rounded-2xl p-6 border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">MULTI-AGENT PLAN</span>
              <span class="text-xs text-slate-400 font-mono">ID: ${plan.event_id}</span>
            </div>
            <h1 class="text-2xl font-extrabold text-white mt-1">${plan.event_name}</h1>
            <p class="text-xs text-slate-300 max-w-3xl mt-1 leading-relaxed">${plan.summary}</p>
          </div>
          <div class="flex items-center gap-2.5 shrink-0">
            <button id="briefing-export-btn" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Stakeholder Briefing
            </button>
            <a href="#simulation" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              Simulate Disruption
            </a>
          </div>
        </div>

        <!-- AI Multi-Agent Consensus Reasoning Cards -->
        <div class="glass-card rounded-2xl p-6 border border-purple-500/20 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <h3 class="text-sm font-bold text-white">Multi-Agent Consensus & Planning Rationales</h3>
            </div>
            <span class="text-[11px] text-purple-400 font-mono">Consensus Verified</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            ${Object.entries(plan.ai_reasoning || {}).map(([key, val]) => `
              <div class="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start justify-between gap-3">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 block mb-0.5">${key.replace('_', ' ')}</span>
                  <p class="text-slate-300 leading-relaxed">${val}</p>
                </div>
                <button class="shrink-0 px-2 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/30 text-purple-300 text-[10px] font-semibold transition" onclick="window.whyPlan('${key}')">Why?</button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Multi-Section Grids (Venues, Schedule Preview, Volunteers) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Venues Allocated -->
          <div class="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"></path></svg>
                Allocated Venues (${plan.venues_allocated.length})
              </h3>
              <a href="#venues" class="text-xs text-indigo-400 hover:text-indigo-300 font-medium">All Venues →</a>
            </div>
            <div class="space-y-2">
              ${plan.venues_allocated.map(v => `
                <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-200">${v.venue_name}</span>
                    <span class="font-mono text-emerald-400 font-semibold">${v.capacity} Cap</span>
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5">${v.role}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Volunteer Squads -->
          <div class="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857"></path></svg>
                Volunteer Squads (${plan.volunteer_teams.length})
              </h3>
              <a href="#volunteers" class="text-xs text-sky-400 hover:text-sky-300 font-medium">Manage →</a>
            </div>
            <div class="space-y-2">
              ${plan.volunteer_teams.map(t => `
                <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-200">${t.name}</span>
                    <span class="font-mono text-indigo-300 font-semibold">${t.assigned_count}/${t.required_count}</span>
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5 line-clamp-1">Lead: ${t.leads.join(', ') || 'Assigned'}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Schedule Timeline Highlights -->
          <div class="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Timeline Slots (${plan.schedule.length})
              </h3>
              <a href="#schedule" class="text-xs text-purple-400 hover:text-purple-300 font-medium">Timeline →</a>
            </div>
            <div class="space-y-2">
              ${plan.schedule.slice(0, 4).map(s => `
                <div class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <div class="flex items-center justify-between font-mono text-[10px] text-slate-400">
                    <span>Day ${s.day} • ${s.start_time}–${s.end_time}</span>
                    <span class="text-purple-300">${s.team}</span>
                  </div>
                  <div class="font-bold text-slate-200 mt-0.5">${s.activity}</div>
                  <div class="text-[11px] text-slate-400">${s.venue_name}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('briefing-export-btn')?.addEventListener('click', () => {
      const briefing = `
# CAMPUS ORBIT - EVENT BRIEFING & RUN-OF-SHOW
Event: ${plan.event_name}
Date: October 24-25, 2026
Status: Verified by Multi-Agent AI System

1. ALLOCATED VENUES:
${plan.venues_allocated.map(v => `- ${v.venue_name} (Cap: ${v.capacity}) - ${v.role}`).join('\n')}

2. VOLUNTEER SQUADS:
${plan.volunteer_teams.map(t => `- ${t.name}: ${t.assigned_count} organizers (Lead: ${t.leads.join(', ')})`).join('\n')}

3. SCHEDULE RUN-OF-SHOW:
${plan.schedule.map(s => `- Day ${s.day} [${s.start_time}-${s.end_time}] ${s.activity} @ ${s.venue_name} (Squad: ${s.team})`).join('\n')}
      `;

      const blob = new Blob([briefing], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CampusOrbit_Briefing_${plan.event_name.replace(/\s+/g, '_')}.md`;
      a.click();
      showToast('Stakeholder briefing downloaded as Markdown.', 'success', 'Briefing Export');
    });

    window.whyPlan = (topicKey) => {
      openExplainModal('venue_selection', {
        required_capacity: 300,
        venue_name: 'Main Auditorium & CSE Labs',
        fallback: plan.ai_reasoning[topicKey]
      }, `Why: ${topicKey.replace('_', ' ').toUpperCase()}`);
    };

  } catch (err) {
    console.error('Plan render error:', err);
    container.innerHTML = `<div class="p-6 text-rose-400">Error loading plan: ${err.message}</div>`;
  }
}
