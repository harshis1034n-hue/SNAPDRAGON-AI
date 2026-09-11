import { API } from '../api.js';
import { openExplainModal } from '../utils/explain_modal.js';
import { showToast } from '../utils/toast.js';

export async function renderVenues() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-center py-16 text-slate-400">
      <svg class="animate-spin h-5 w-5 text-indigo-500 mr-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
      Loading campus venue facilities...
    </div>
  `;

  try {
    const venues = await API.getVenues();
    const totalCap = venues.reduce((acc, v) => acc + v.capacity, 0);
    const availableCap = venues.filter(v => v.status === 'Available').reduce((acc, v) => acc + v.capacity, 0);

    container.innerHTML = `
      <div class="view-section space-y-6 max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-mono">CAMPUS FACILITIES MATRIX</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Venue Planning & Availability</h1>
            <p class="text-sm text-slate-400">Manage real-time campus facility allocations. Toggling a venue status dynamically tests conflict detection and simulation replanning.</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
              <span class="text-slate-400">Available Seating:</span> <strong class="text-emerald-400">${availableCap}</strong> / ${totalCap}
            </div>
          </div>
        </div>

        <!-- Venue Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${venues.map(v => `
            <div class="glass-card rounded-2xl p-5 border ${
              v.status === 'Available' ? 'border-slate-800 hover:border-indigo-500/40' :
              v.status === 'Maintenance' ? 'border-amber-500/40 bg-amber-950/10' :
              'border-rose-500/40 bg-rose-950/10'
            } flex flex-col justify-between space-y-4">
              <div>
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <h3 class="text-base font-bold text-white">${v.name}</h3>
                    <span class="text-[11px] text-slate-400 block">${v.location}</span>
                  </div>
                  <select class="venue-status-select text-xs font-semibold font-mono rounded-lg px-2.5 py-1 bg-slate-900 border focus:outline-none transition ${
                    v.status === 'Available' ? 'border-emerald-500/50 text-emerald-400' :
                    v.status === 'Maintenance' ? 'border-amber-500/50 text-amber-400' :
                    'border-rose-500/50 text-rose-400'
                  }" data-id="${v.id}">
                    <option value="Available" ${v.status === 'Available' ? 'selected' : ''}>Available</option>
                    <option value="In Use" ${v.status === 'In Use' ? 'selected' : ''}>In Use</option>
                    <option value="Maintenance" ${v.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
                    <option value="Unavailable" ${v.status === 'Unavailable' ? 'selected' : ''}>Unavailable</option>
                  </select>
                </div>

                <div class="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                  <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span class="text-slate-500 block text-[10px] uppercase">Seating</span>
                    <strong class="text-slate-200 text-sm">${v.capacity} Seats</strong>
                  </div>
                  <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span class="text-slate-500 block text-[10px] uppercase">AV Setup</span>
                    <strong class="text-indigo-300 text-sm">${v.projectors} Proj, ${v.microphones} Mics</strong>
                  </div>
                </div>

                <div class="flex flex-wrap gap-1.5 mt-3">
                  ${v.computers ? `<span class="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30 text-[10px] font-mono">${v.computers} Computers</span>` : ''}
                  ${v.wifi ? `<span class="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-[10px]">1Gbps Wi-Fi</span>` : ''}
                  ${v.accessibility ? `<span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px]">Accessible Ramp</span>` : ''}
                </div>

                <p class="text-[11px] text-slate-400 mt-3 leading-relaxed">${v.notes || 'Campus certified facility.'}</p>
              </div>

              <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span class="text-[10px] font-mono text-purple-400">Score: ${v.suitability_score}%</span>
                <button class="find-alt-btn px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition" data-id="${v.id}">Find Alternatives</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Status change listener
    document.querySelectorAll('.venue-status-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        const venueId = e.target.getAttribute('data-id');
        const newStatus = e.target.value;
        try {
          await API.updateVenue(venueId, { status: newStatus });
          showToast(`Venue status updated to ${newStatus}`, 'info', 'Venue Agent');
          if (newStatus !== 'Available') {
            showToast('Venue disruption flagged! Check Conflicts or Simulation Center.', 'warning', 'Conflict Alert');
          }
          renderVenues();
        } catch (err) {
          showToast('Failed to update venue: ' + err.message, 'error');
        }
      });
    });

    // Find alternatives listener
    document.querySelectorAll('.find-alt-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const venueId = e.target.getAttribute('data-id');
        const venue = venues.find(v => v.id === venueId);
        try {
          const res = await API.getVenueAlternatives(venueId, 250);
          const topAlt = res.alternatives[0] || { venue_name: 'Innovation Hall', score: 92 };
          openExplainModal('venue_selection', {
            venue_name: topAlt.venue_name,
            required_capacity: 250,
            fallback: topAlt.recommendation_reason
          }, `Ranked Alternatives for ${venue.name}`);
        } catch (err) {
          showToast('Error finding alternatives: ' + err.message, 'error');
        }
      });
    });

  } catch (err) {
    console.error('Venues render error:', err);
    container.innerHTML = `<div class="p-6 text-rose-400">Error loading venues: ${err.message}</div>`;
  }
}
