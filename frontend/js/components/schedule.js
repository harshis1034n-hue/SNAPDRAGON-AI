import { API } from '../api.js';
import { showToast } from '../utils/toast.js';

export async function renderSchedule() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-center py-16 text-slate-400">
      <svg class="animate-spin h-5 w-5 text-indigo-500 mr-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
      Loading chronological schedule timeline...
    </div>
  `;

  try {
    const schedule = await API.getSchedule();
    const day1Items = schedule.filter(s => s.day === 1);
    const day2Items = schedule.filter(s => s.day === 2);

    container.innerHTML = `
      <div class="view-section space-y-6 max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono">CHRONOLOGICAL RUN-OF-SHOW</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Multi-Track Visual Schedule</h1>
            <p class="text-sm text-slate-400">Timeline synchronized across venues, volunteer squads, and equipment allocations.</p>
          </div>
          <div class="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button id="tab-day1-btn" class="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold transition">Day 1 (Saturday)</button>
            <button id="tab-day2-btn" class="px-4 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-bold transition">Day 2 (Sunday)</button>
          </div>
        </div>

        <!-- Timeline Container -->
        <div id="day1-timeline" class="space-y-4">
          <div class="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-indigo-500"></span> DAY 1: HACKATHON OPENING & SPRINT
          </div>
          <div class="relative border-l border-slate-800 ml-4 pl-6 space-y-6">
            ${renderTimelineItems(day1Items)}
          </div>
        </div>

        <div id="day2-timeline" class="space-y-4 hidden">
          <div class="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-purple-500"></span> DAY 2: POLISH, FINAL PITCHES & CLOSING
          </div>
          <div class="relative border-l border-slate-800 ml-4 pl-6 space-y-6">
            ${renderTimelineItems(day2Items)}
          </div>
        </div>
      </div>
    `;

    // Tab switching
    const d1Btn = document.getElementById('tab-day1-btn');
    const d2Btn = document.getElementById('tab-day2-btn');
    const d1View = document.getElementById('day1-timeline');
    const d2View = document.getElementById('day2-timeline');

    d1Btn?.addEventListener('click', () => {
      d1Btn.className = 'px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold transition';
      d2Btn.className = 'px-4 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-bold transition';
      d1View.classList.remove('hidden');
      d2View.classList.add('hidden');
    });

    d2Btn?.addEventListener('click', () => {
      d2Btn.className = 'px-4 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold transition';
      d1Btn.className = 'px-4 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-bold transition';
      d2View.classList.remove('hidden');
      d1View.classList.add('hidden');
    });

  } catch (err) {
    console.error('Schedule render error:', err);
    container.innerHTML = `<div class="p-6 text-rose-400">Error loading schedule: ${err.message}</div>`;
  }
}

function renderTimelineItems(items) {
  return items.map(s => `
    <div class="relative group">
      <!-- Dot on timeline -->
      <div class="absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 ${
        s.status === 'Relocated' ? 'border-amber-400 bg-amber-950' : 'border-indigo-500 bg-indigo-950'
      } group-hover:scale-125 transition"></div>

      <div class="glass-card rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/40 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono font-bold text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">${s.start_time} – ${s.end_time}</span>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${
              s.status === 'Relocated' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
            }">${s.status}</span>
          </div>
          <span class="text-xs text-purple-300 font-medium flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7"></path></svg>
            ${s.team}
          </span>
        </div>

        <div>
          <h3 class="text-base font-bold text-white">${s.activity}</h3>
          <div class="flex items-center gap-1.5 text-xs text-indigo-300 mt-1 font-mono">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            ${s.venue_name}
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-1.5 pt-1">
          <span class="text-[10px] text-slate-500 uppercase font-mono mr-1">Resources:</span>
          ${s.resources.map(r => `<span class="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[11px] font-mono">${r}</span>`).join('')}
        </div>

        ${s.notes ? `<p class="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/60">${s.notes}</p>` : ''}
      </div>
    </div>
  `).join('');
}
