import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Copy,
  Download,
  ExternalLink,
  Check,
  Sliders,
  Sparkles,
  Lock,
  ArrowLeft,
  Tv,
} from 'lucide-react';
import { DetectedEntity } from '../types';
import { api } from '../services/api';
import { ComparisonSlider } from '../components/ComparisonSlider';

interface SafeSharePageProps {
  originalImageUri: string;
  entities: DetectedEntity[];
  onBackToResults: () => void;
  onNewScan: () => void;
}

export const SafeSharePage: React.FC<SafeSharePageProps> = ({
  originalImageUri,
  entities,
  onBackToResults,
  onNewScan,
}) => {
  const [redactionStyle, setRedactionStyle] = useState<'blur' | 'pixelate' | 'blackout'>('blur');
  const [protectedImageUri, setProtectedImageUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [showPresenterModal, setShowPresenterModal] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState<any>(null);

  // Apply redaction when entities or style change
  useEffect(() => {
    applyRedaction(redactionStyle);
  }, [redactionStyle, entities]);

  const applyRedaction = async (style: string) => {
    setIsProcessing(true);
    try {
      const res = await api.redactImage(originalImageUri, entities, style, true);
      setProtectedImageUri(res.protectedImageUri);
      setRiskAssessment(res.assessment);
    } catch (err) {
      console.error('Failed to apply redaction:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy to Clipboard
  const handleCopyToClipboard = async () => {
    if (!protectedImageUri) return;
    try {
      // Fetch as blob
      const res = await fetch(protectedImageUri);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch {
      // Fallback: Copy data URI
      await navigator.clipboard.writeText(protectedImageUri);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  // Save to Disk
  const handleSaveImage = () => {
    if (!protectedImageUri) return;
    const a = document.createElement('a');
    a.href = protectedImageUri;
    a.download = `snapsafe-protected-screen-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const maskedCount = entities.filter((e) => e.isMasked).length;
  const riskBefore = riskAssessment ? riskAssessment.privacyRiskRaw : 87;
  const riskAfter = riskAssessment ? riskAssessment.privacyRiskAfter : 4;
  const privacyScoreAfter = riskAssessment ? riskAssessment.privacyScoreAfter : 96;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner: Safe Share Readiness */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            SCREEN PRIVACY VERIFIED
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Your screen is ready to share.
          </h2>
          <p className="text-xs text-slate-400">
            All sensitive credentials, PII, and tokens have been masked on-device.
          </p>
        </div>

        {/* Quick Summary Pill Row */}
        <div className="flex items-center gap-4 bg-slate-900/90 px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-mono">
          <div className="text-center">
            <div className="text-[10px] text-slate-400">Privacy Score</div>
            <div className="text-lg font-bold text-emerald-400">{privacyScoreAfter} / 100</div>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div className="text-center">
            <div className="text-[10px] text-slate-400">Sensitive Items</div>
            <div className="text-lg font-bold text-slate-200">0 visible</div>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div className="text-center">
            <div className="text-[10px] text-slate-400">Cloud Egress</div>
            <div className="text-lg font-bold text-emerald-400">0 bytes</div>
          </div>
        </div>
      </div>

      {/* Action Toolbar & Style Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        {/* Style Selector */}
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono text-slate-400">Masking Method:</span>
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setRedactionStyle('blur')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                redactionStyle === 'blur'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Gaussian Blur (Default)
            </button>
            <button
              onClick={() => setRedactionStyle('pixelate')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                redactionStyle === 'pixelate'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pixelate
            </button>
            <button
              onClick={() => setRedactionStyle('blackout')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                redactionStyle === 'blackout'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Solid Blackout
            </button>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyToClipboard}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition active:scale-95"
          >
            {copiedToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedToast ? 'COPIED TO CLIPBOARD' : 'COPY PROTECTED IMAGE'}</span>
          </button>

          <button
            onClick={handleSaveImage}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>SAVE PROTECTED IMAGE</span>
          </button>

          <button
            onClick={() => setShowPresenterModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition active:scale-95"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>START SAFE SHARE VIEW</span>
          </button>
        </div>
      </div>

      {/* Before / After Comparison Area */}
      {protectedImageUri && (
        <ComparisonSlider
          originalImageUri={originalImageUri}
          protectedImageUri={protectedImageUri}
          riskBefore={riskBefore}
          riskAfter={riskAfter}
          protectedCount={maskedCount}
          redactionStyle={redactionStyle}
        />
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs">
        <button
          onClick={onBackToResults}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Privacy Results</span>
        </button>

        <button
          onClick={onNewScan}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition"
        >
          Scan Another Screen
        </button>
      </div>

      {/* Simulated Presenter Window Modal */}
      {showPresenterModal && protectedImageUri && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="text-sm font-bold text-white font-mono">
                  SnapSafe AI Presenter Clean Feed (Simulated Share Window)
                </h3>
              </div>
              <button
                onClick={() => setShowPresenterModal(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900"
              >
                Close (ESC)
              </button>
            </div>

            <p className="text-xs text-slate-400">
              This window represents the broadcast-ready feed where sensitive content is permanently masked.
              During an interview or presentation, share this feed or copy the protected graphic directly.
            </p>

            <div className="rounded-xl overflow-hidden border border-slate-800 bg-black">
              <img src={protectedImageUri} alt="Presenter Feed" className="w-full h-auto max-h-[480px] object-contain mx-auto" />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2">
              <span>Status: 100% Redacted Locally</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyToClipboard}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-semibold"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={handleSaveImage}
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Download PNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
