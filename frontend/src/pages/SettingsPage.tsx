import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Lock,
  Cpu,
  HardDrive,
  Check,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [protectionMode, setProtectionMode] = useState(true);
  const [autoMasking, setAutoMasking] = useState(true);
  const [defaultRedactionStyle, setDefaultRedactionStyle] = useState('blur');
  const [modelBackend, setModelBackend] = useState('auto');

  // Categories checklist
  const [categories, setCategories] = useState<Record<string, boolean>>({
    email: true,
    phone: true,
    studentId: true,
    apiKeys: true,
    passwords: true,
    financial: true,
    qrCodes: true,
    confidentialText: true,
  });

  const toggleCategory = (key: string) => {
    setCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-rose-500" />
          Settings & Security Policy
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure on-device detection rules, redaction styles, and hardware preferences.
        </p>
      </div>

      {/* Core Protection Toggles */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
          Core Protection Engine
        </h3>

        <div className="divide-y divide-slate-800/60">
          <div className="py-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-200">Active Screen Firewall</div>
              <div className="text-[11px] text-slate-400">Continuously protect screen buffers prior to sharing</div>
            </div>
            <button
              onClick={() => setProtectionMode(!protectionMode)}
              className="text-rose-500 hover:text-rose-400 transition"
            >
              {protectionMode ? (
                <ToggleRight className="w-8 h-8 text-rose-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-600" />
              )}
            </button>
          </div>

          <div className="py-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-200">Automatic Masking Recommendation</div>
              <div className="text-[11px] text-slate-400">Pre-select critical and high-risk entities for one-click redaction</div>
            </div>
            <button
              onClick={() => setAutoMasking(!autoMasking)}
              className="text-rose-500 hover:text-rose-400 transition"
            >
              {autoMasking ? (
                <ToggleRight className="w-8 h-8 text-rose-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-600" />
              )}
            </button>
          </div>

          <div className="py-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-200">Default Masking Filter</div>
              <div className="text-[11px] text-slate-400">Select default visual transformation applied to secrets</div>
            </div>
            <select
              value={defaultRedactionStyle}
              onChange={(e) => setDefaultRedactionStyle(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="blur">Gaussian Blur</option>
              <option value="pixelate">Pixelation Block</option>
              <option value="blackout">Solid Blackout Mask</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detection Categories Checklist */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
          Active Detection Categories
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {[
            { key: 'email', label: 'Email Addresses', desc: 'Personal & corporate domains' },
            { key: 'phone', label: 'Phone Numbers', desc: 'Indian (+91) & International formats' },
            { key: 'studentId', label: 'Student / Employee IDs', desc: 'Roll numbers, badge IDs, registration codes' },
            { key: 'apiKeys', label: 'API Keys & Secrets', desc: 'sk-, ghp-, AKIA, Shannon entropy tokens' },
            { key: 'passwords', label: 'Plaintext Passwords', desc: 'Password labels, keys, credentials' },
            { key: 'financial', label: 'Financial Card Numbers', desc: '16-digit sequences validated with Luhn Mod-10' },
            { key: 'qrCodes', label: 'QR Codes & Barcodes', desc: 'Scannable visual 2D matrices' },
            { key: 'confidentialText', label: 'Confidential / Internal Markers', desc: 'Confidential, Proprietary, Salary, Secret' },
          ].map((item) => (
            <label
              key={item.key}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex items-start gap-3 cursor-pointer transition select-none"
            >
              <input
                type="checkbox"
                checked={categories[item.key]}
                onChange={() => toggleCategory(item.key)}
                className="mt-0.5 rounded bg-slate-900 border-slate-700 text-rose-600 focus:ring-rose-500 focus:ring-offset-0"
              />
              <div className="text-xs">
                <div className="font-semibold text-slate-200">{item.label}</div>
                <div className="text-[11px] text-slate-400">{item.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Privacy & Hardware Policy (Enforced) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          Enforced Privacy Guarantee
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-200">Data Retention Policy</div>
              <div className="text-[11px] text-slate-400">Do NOT save raw screenshots to disk</div>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30">
              ENFORCED
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-200">Privacy Mode</div>
              <div className="text-[11px] text-slate-400">Local on-device execution only; cloud APIs disabled</div>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30">
              LOCAL ONLY
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-200">Model Backend</div>
              <div className="text-[11px] text-slate-400">Qualcomm AI Hub target with ONNX / CPU fallback</div>
            </div>
            <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-mono text-[11px] font-bold border border-rose-500/30">
              AUTOMATIC
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
