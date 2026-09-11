import { API } from '../api.js';
import { showToast } from '../utils/toast.js';

export async function renderTasks() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-center py-16 text-slate-400">
      <svg class="animate-spin h-5 w-5 text-indigo-500 mr-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
      Loading task checklists & delegation matrix...
    </div>
  `;

  try {
    const tasks = await API.getTasks();
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const pending = tasks.filter(t => t.status === 'Pending').length;

    container.innerHTML = `
      <div class="view-section space-y-6 max-w-5xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono">AUTOMATED DELEGATION</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Operational Task Management</h1>
            <p class="text-sm text-slate-400">Track action items delegated across Technical, Registration, Hospitality, and Security squads.</p>
          </div>
          <div class="flex items-center gap-2 font-mono text-xs">
            <span class="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30">${completed} Done</span>
            <span class="px-3 py-1.5 rounded-lg bg-amber-950 text-amber-300 border border-amber-500/30">${inProgress} In Progress</span>
            <span class="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">${pending} Pending</span>
          </div>
        </div>

        <!-- Tasks Table -->
        <div class="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th class="p-4">Status</th>
                  <th class="p-4">Task Description</th>
                  <th class="p-4">Assigned Team</th>
                  <th class="p-4">Priority</th>
                  <th class="p-4">Deadline</th>
                  <th class="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/80">
                ${tasks.map(t => `
                  <tr class="hover:bg-slate-900/50 transition">
                    <td class="p-4">
                      <input type="checkbox" class="task-checkbox rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer" data-id="${t.id}" ${t.status === 'Completed' ? 'checked' : ''}>
                    </td>
                    <td class="p-4 font-semibold text-slate-200 ${t.status === 'Completed' ? 'line-through text-slate-500' : ''}">
                      ${t.title}
                      ${t.automated ? `<span class="ml-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">Auto</span>` : ''}
                    </td>
                    <td class="p-4 text-indigo-300">${t.team}</td>
                    <td class="p-4 font-mono">
                      <span class="px-2 py-0.5 rounded ${
                        t.priority === 'High' ? 'bg-rose-950 text-rose-300' : t.priority === 'Medium' ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-300'
                      }">${t.priority}</span>
                    </td>
                    <td class="p-4 font-mono text-slate-400">${t.deadline}</td>
                    <td class="p-4 text-right">
                      <select class="task-status-select bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 text-xs focus:outline-none" data-id="${t.id}">
                        <option value="Pending" ${t.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${t.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Completed" ${t.status === 'Completed' ? 'selected' : ''}>Completed</option>
                      </select>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.querySelectorAll('.task-checkbox').forEach(cb => {
      cb.addEventListener('change', async (e) => {
        const id = e.target.getAttribute('data-id');
        const newStatus = e.target.checked ? 'Completed' : 'Pending';
        await API.updateTask(id, { status: newStatus });
        showToast(`Task status updated to ${newStatus}`, 'info');
        renderTasks();
      });
    });

    document.querySelectorAll('.task-status-select').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const id = e.target.getAttribute('data-id');
        const newStatus = e.target.value;
        await API.updateTask(id, { status: newStatus });
        showToast(`Task updated to ${newStatus}`, 'info');
        renderTasks();
      });
    });

  } catch (err) {
    console.error('Tasks render error:', err);
    container.innerHTML = `<div class="p-6 text-rose-400">Error loading tasks: ${err.message}</div>`;
  }
}
