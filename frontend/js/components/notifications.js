import { API } from '../api.js';
import { showToast } from '../utils/toast.js';

export async function renderNotifications() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-center py-16 text-slate-400">
      <svg class="animate-spin h-5 w-5 text-indigo-500 mr-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
      Loading system notifications & real-time briefings...
    </div>
  `;

  try {
    const notifs = await API.getNotifications();

    container.innerHTML = `
      <div class="view-section space-y-6 max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-mono">ACTIVITY FEED & ALERTS</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Notifications & Event Feed</h1>
            <p class="text-sm text-slate-400">Live operational log of multi-agent decisions, conflict alerts, and governance triggers.</p>
          </div>
          <button id="mark-all-read-btn" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition">
            Mark All as Read
          </button>
        </div>

        <!-- Notifications List -->
        <div class="space-y-3">
          ${notifs.map(n => `
            <div class="glass-card rounded-2xl p-4 sm:p-5 border ${
              n.type === 'Critical' ? 'border-rose-500/40 bg-rose-950/10' :
              n.type === 'Warning' ? 'border-amber-500/40 bg-amber-950/10' :
              n.type === 'Success' ? 'border-emerald-500/40 bg-emerald-950/10' :
              'border-slate-800'
            } flex items-start gap-4 ${n.read ? 'opacity-70' : ''}">
              <div class="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                n.type === 'Critical' ? 'bg-rose-600/20 text-rose-400' :
                n.type === 'Warning' ? 'bg-amber-600/20 text-amber-400' :
                n.type === 'Success' ? 'bg-emerald-600/20 text-emerald-400' :
                'bg-blue-600/20 text-blue-400'
              }">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>

              <div class="flex-1 space-y-1">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-white">${n.title}</span>
                    <span class="text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      n.type === 'Critical' ? 'bg-rose-950 text-rose-300' :
                      n.type === 'Warning' ? 'bg-amber-950 text-amber-300' :
                      n.type === 'Success' ? 'bg-emerald-950 text-emerald-300' :
                      'bg-slate-800 text-slate-300'
                    }">${n.type}</span>
                  </div>
                  <span class="text-[11px] text-slate-500 font-mono">${n.timestamp}</span>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed">${n.message}</p>
                ${n.link ? `<a href="#${n.link.replace('/', '')}" class="inline-block text-[11px] text-indigo-400 hover:text-indigo-300 font-medium pt-1">Open relevant section →</a>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('mark-all-read-btn')?.addEventListener('click', async () => {
      await API.markNotificationsRead();
      showToast('All notifications marked as read.', 'info');
      renderNotifications();
    });

  } catch (err) {
    console.error('Notifications render error:', err);
    container.innerHTML = `<div class="p-6 text-rose-400">Error loading notifications: ${err.message}</div>`;
  }
}
