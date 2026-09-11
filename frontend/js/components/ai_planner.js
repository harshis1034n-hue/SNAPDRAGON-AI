import { API } from '../api.js';
import { showToast } from '../utils/toast.js';

export async function renderAIPlanner() {
  const container = document.getElementById('main-content');
  if (!container) return;

  const defaultPrompt = "We are organizing a 2-day AI hackathon for 300 students. We need one auditorium, three classrooms, 20 volunteers, Wi-Fi, projectors, technical support, food arrangements and security.";

  container.innerHTML = `
    <div class="view-section max-w-5xl mx-auto space-y-6">
      <!-- Title & Intro -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono">NATURAL LANGUAGE INTAKE</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">AI Event Planner</h1>
          <p class="text-sm text-slate-400">Describe your campus event in plain natural language. The multi-agent parser extracts constraints, allocates facilities, and prepares an operational plan.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="load-sample-btn" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-medium transition flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            Load Sample Hackathon Prompt
          </button>
        </div>
      </div>

      <!-- Natural Language Prompt Box -->
      <div class="glass-card rounded-2xl p-6 border border-indigo-500/30 space-y-4">
        <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider">Natural Language Event Description</label>
        <textarea id="nl-prompt-input" rows="4" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition font-sans placeholder-slate-500 leading-relaxed" placeholder="e.g. We are organizing a 2-day AI hackathon for 300 students. We need one auditorium, three classrooms, 20 volunteers, Wi-Fi, projectors, technical support, food arrangements and security.">${defaultPrompt}</textarea>
        
        <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div class="flex items-center gap-2 text-xs text-slate-400">
            <span class="w-2 h-2 rounded-full bg-purple-500"></span>
            <span>Supports LLM Semantic Extraction & Deterministic NLP Mode</span>
          </div>

          <div class="flex items-center gap-3">
            <button id="parse-prompt-btn" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-slate-200 transition flex items-center gap-2">
              <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
              Extract Requirements
            </button>
          </div>
        </div>
      </div>

      <!-- Extracted Structured Parameters (Editable) -->
      <div id="extracted-fields-container" class="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 class="text-base font-bold text-white">Extracted Operational Requirements</h3>
            <p class="text-xs text-slate-400">Verify and adjust structured fields before launching multi-agent plan generation.</p>
          </div>
          <span class="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">Confidence: 98%</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-400 mb-1">Event Name</label>
            <input type="text" id="req-name" value="AI Innovation Hackathon" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold text-slate-400 mb-1">Event Type</label>
            <input type="text" id="req-type" value="Hackathon / Build Sprint" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold text-slate-400 mb-1">Expected Participants</label>
            <input type="number" id="req-participants" value="300" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold text-slate-400 mb-1">Duration</label>
            <input type="text" id="req-duration" value="2 days" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold text-slate-400 mb-1">Proposed Date</label>
            <input type="text" id="req-date" value="October 24-25, 2026" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold text-slate-400 mb-1">Volunteers Needed</label>
            <input type="number" id="req-volunteers" value="20" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold text-slate-400 mb-1">Estimated Budget</label>
            <input type="text" id="req-budget" value="$4,500" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none">
          </div>
          <div class="sm:col-span-2">
            <label class="block font-semibold text-slate-400 mb-1">Required Venues (Comma-separated)</label>
            <input type="text" id="req-venues" value="1 Main Auditorium, 3 CSE Labs, 1 Seminar Hall" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none">
          </div>
          <div class="sm:col-span-3">
            <label class="block font-semibold text-slate-400 mb-1">Equipment & Infrastructure Required</label>
            <input type="text" id="req-equipment" value="8 Projectors, 12 Microphones, 120 Laptops, 30 Extension Boards, 8 Wi-Fi Routers, 6 Speakers, 500 Chairs, 100 Tables" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none">
          </div>
          <div class="sm:col-span-3">
            <label class="block font-semibold text-slate-400 mb-1">Special Requirements & Clearances</label>
            <input type="text" id="req-special" value="Dedicated 1Gbps Wi-Fi SSID, 24/7 Overnight Lab Access Permit, Emergency Generator Load Test" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none">
          </div>
        </div>

        <!-- Boolean Flags Grid -->
        <div class="grid grid-cols-3 gap-3 pt-2">
          <label class="flex items-center gap-2 p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
            <input type="checkbox" id="req-food" checked class="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0">
            <span class="text-xs text-slate-300 font-medium">Food & Catering Arranged</span>
          </label>
          <label class="flex items-center gap-2 p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
            <input type="checkbox" id="req-security" checked class="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0">
            <span class="text-xs text-slate-300 font-medium">24/7 Security Clearance</span>
          </label>
          <label class="flex items-center gap-2 p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
            <input type="checkbox" id="req-transport" class="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0">
            <span class="text-xs text-slate-300 font-medium">Campus Transport Shuttle</span>
          </label>
        </div>

        <!-- Master Action Button -->
        <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div class="text-xs text-slate-400">
            Triggers Venue, Schedule, Resource, Volunteer & Conflict Agents
          </div>
          <button id="generate-plan-btn" class="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition transform hover:-translate-y-0.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            GENERATE EVENT PLAN
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach handlers
  document.getElementById('load-sample-btn')?.addEventListener('click', () => {
    document.getElementById('nl-prompt-input').value = defaultPrompt;
    showToast('Sample AI Hackathon prompt loaded.', 'info');
  });

  const parseBtn = document.getElementById('parse-prompt-btn');
  parseBtn?.addEventListener('click', async () => {
    const prompt = document.getElementById('nl-prompt-input').value;
    parseBtn.innerHTML = `<svg class="animate-spin h-4 w-4 text-purple-400" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg> Extracting...`;
    try {
      const parsed = await API.parseEventPrompt(prompt);
      document.getElementById('req-name').value = parsed.event_name;
      document.getElementById('req-type').value = parsed.event_type;
      document.getElementById('req-participants').value = parsed.participants;
      document.getElementById('req-duration').value = parsed.duration;
      document.getElementById('req-date').value = parsed.date;
      document.getElementById('req-volunteers').value = parsed.volunteers;
      document.getElementById('req-budget').value = parsed.estimated_budget;
      document.getElementById('req-venues').value = parsed.required_venues.join(', ');
      document.getElementById('req-equipment').value = parsed.equipment.join(', ');
      document.getElementById('req-special').value = parsed.special_requirements.join(', ');
      document.getElementById('req-food').checked = parsed.food_arrangements;
      document.getElementById('req-security').checked = parsed.security_required;
      document.getElementById('req-transport').checked = parsed.transport_required;
      showToast('Requirements extracted successfully!', 'success', 'NLP Parser');
    } catch (e) {
      showToast('Parse error: ' + e.message, 'error');
    } finally {
      parseBtn.innerHTML = `<svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg> Extract Requirements`;
    }
  });

  document.getElementById('generate-plan-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('generate-plan-btn');
    btn.innerHTML = `<svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg> Orchestrating Agents...`;
    
    const requirements = {
      event_name: document.getElementById('req-name').value,
      event_type: document.getElementById('req-type').value,
      participants: parseInt(document.getElementById('req-participants').value) || 300,
      duration: document.getElementById('req-duration').value,
      date: document.getElementById('req-date').value,
      volunteers: parseInt(document.getElementById('req-volunteers').value) || 20,
      estimated_budget: document.getElementById('req-budget').value,
      required_venues: document.getElementById('req-venues').value.split(',').map(s => s.trim()),
      equipment: document.getElementById('req-equipment').value.split(',').map(s => s.trim()),
      special_requirements: document.getElementById('req-special').value.split(',').map(s => s.trim()),
      food_arrangements: document.getElementById('req-food').checked,
      security_required: document.getElementById('req-security').checked,
      transport_required: document.getElementById('req-transport').checked,
      required_capacity: parseInt(document.getElementById('req-participants').value) || 300,
      teams_needed: ["Registration", "Technical Support", "Hospitality", "Security Coordination", "General Support"]
    };

    try {
      await API.createEvent(requirements);
      showToast('Master Operational Plan generated successfully!', 'success', 'Event Manager Agent');
      window.location.hash = '#event-plan';
    } catch (err) {
      showToast('Planning error: ' + err.message, 'error');
      btn.innerHTML = `GENERATE EVENT PLAN`;
    }
  });
}
