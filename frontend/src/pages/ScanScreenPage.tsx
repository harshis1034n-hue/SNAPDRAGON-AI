import React, { useState, useRef } from 'react';
import {
  Monitor,
  Upload,
  Camera,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileImage,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Eye,
} from 'lucide-react';
import { api } from '../services/api';
import { ScanResult } from '../types';

interface ScanScreenPageProps {
  onScanComplete: (result: ScanResult, imageUri: string) => void;
  onLaunchDemo: () => void;
}

export const ScanScreenPage: React.FC<ScanScreenPageProps> = ({
  onScanComplete,
  onLaunchDemo,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; name: string } | null>(null);
  const [ocrProvider, setOcrProvider] = useState<string>('auto');
  const [isScanning, setIsScanning] = useState(false);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stages = [
    { id: 1, name: 'Capturing screen buffer', desc: 'Acquiring uncompressed display frame in memory' },
    { id: 2, name: 'Detecting text locally', desc: 'Running on-device OCR model with ONNX/QNN' },
    { id: 3, name: 'Classifying sensitive information', desc: 'Evaluating regex, Shannon entropy & identity patterns' },
    { id: 4, name: 'Calculating risk scores', desc: 'Computing CVSS-style severity weights & privacy exposure' },
    { id: 5, name: 'Preparing protection', desc: 'Formatting bounding boxes & Privacy Coach mitigations' },
  ];

  // Handle File Input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP)');
      return;
    }
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setSelectedImage(b64);
        setImageMeta({ width: img.width, height: img.height, name: file.name });
      };
      img.src = b64;
    };
    reader.readAsDataURL(file);
  };

  // Drag & Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  // Screen Capture via Desktop Backend
  const handleCaptureScreen = async () => {
    setErrorMsg(null);
    try {
      const res = await api.captureDesktopScreen(1);
      if (res.success && res.dataUri) {
        setSelectedImage(res.dataUri);
        setImageMeta({
          width: res.width,
          height: res.height,
          name: res.source === 'simulated_desktop_session' ? 'Desktop Session Screen' : 'Active Display Capture',
        });
        return;
      } else {
        throw new Error(res.error || 'Failed to capture display');
      }
    } catch (err: any) {
      setErrorMsg(`Desktop capture: ${err.message}. Try "Pick Window / Tab" or "Load Demo Portal".`);
    }
  };

  // Screen Capture via Browser Screen Picker
  const handleBrowserScreenShare = async () => {
    setErrorMsg(null);
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        setErrorMsg('Browser screen selection is not supported in this browser window. Please use Image Import or Demo Mode.');
        return;
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as any,
        audio: false,
      });
      const video = document.createElement('video');
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;
      video.srcObject = stream;

      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play().then(() => resolve()).catch(() => resolve());
        };
      });

      await new Promise((r) => setTimeout(r, 300));

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      stream.getTracks().forEach((track) => track.stop());
      const b64 = canvas.toDataURL('image/png');
      setSelectedImage(b64);
      setImageMeta({ width: canvas.width, height: canvas.height, name: 'Active Window / Screen' });
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        setErrorMsg('Screen capture canceled or unavailable.');
      }
    }
  };

  // Run the Real Scan Pipeline
  const runScan = async () => {
    if (!selectedImage) {
      setErrorMsg('Please capture your screen or import an image first.');
      return;
    }

    setIsScanning(true);
    setErrorMsg(null);
    setActiveStage(1);

    try {
      // Progress animation aligned with real async execution
      const stageTimer1 = setTimeout(() => setActiveStage(2), 250);
      const stageTimer2 = setTimeout(() => setActiveStage(3), 600);
      const stageTimer3 = setTimeout(() => setActiveStage(4), 950);
      const stageTimer4 = setTimeout(() => setActiveStage(5), 1200);

      const result = await api.scanImage(selectedImage, ocrProvider);

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      clearTimeout(stageTimer4);

      setActiveStage(5);
      setTimeout(() => {
        setIsScanning(false);
        onScanComplete(result, selectedImage);
      }, 400);
    } catch (err: any) {
      setIsScanning(false);
      setErrorMsg(err.message || 'Failed to scan image locally');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Scan Screen for Sensitive Data</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a screen source or upload an image. The entire analysis executes locally on your Snapdragon PC.
          </p>
        </div>

        {/* OCR Engine Selector */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <Layers className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-slate-400 font-mono text-[11px]">Inference Backend:</span>
          <select
            value={ocrProvider}
            onChange={(e) => setOcrProvider(e.target.value)}
            disabled={isScanning}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <option value="auto">Auto (Snapdragon NPU / CPU Fallback)</option>
            <option value="qualcomm_aihub">Qualcomm AI Hub Target Engine</option>
            <option value="rapidocr">RapidOCR (ONNX Local Runtime)</option>
            <option value="synthetic">Synthetic Ground-Truth (Instant)</option>
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Capture & Image Preview Area */}
        <div className="md:col-span-2 space-y-4">
          {!selectedImage ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/40 rounded-2xl p-8 sm:p-12 text-center transition flex flex-col items-center justify-center min-h-[380px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                <Monitor className="w-8 h-8" />
              </div>

              <h3 className="text-base font-semibold text-slate-200 mb-1">
                Capture Screen or Drop Screenshot
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-6">
                Supports full monitor captures, application windows, or drag & drop of PNG/JPG screenshots.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleCaptureScreen}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition active:scale-95"
                  title="Capture primary display using local desktop engine"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Display</span>
                </button>

                <button
                  onClick={handleBrowserScreenShare}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition active:scale-95"
                  title="Choose any specific application window, Chrome tab, or monitor"
                >
                  <Monitor className="w-4 h-4" />
                  <span>Pick Window / Tab</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition active:scale-95"
                  title="Upload PNG, JPG, or WebP screenshot"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Image File</span>
                </button>

                <button
                  onClick={onLaunchDemo}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition active:scale-95"
                  title="Load pre-built synthetic student portal demo"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Load Demo Portal</span>
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Selected Image Preview Container */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
                <img
                  src={selectedImage}
                  alt="Captured Screen"
                  className="w-full h-auto max-h-[500px] object-contain block mx-auto select-none"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 text-[11px] font-mono text-slate-300 backdrop-blur-sm">
                    {imageMeta?.width} × {imageMeta?.height} px
                  </span>
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setImageMeta(null);
                    }}
                    disabled={isScanning}
                    className="px-2.5 py-1 rounded bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] font-semibold transition"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs">
                  <div className="font-semibold text-slate-200">{imageMeta?.name || 'Screen Capture'}</div>
                  <div className="text-[11px] text-slate-400">Ready for on-device scan</div>
                </div>

                <button
                  onClick={runScan}
                  disabled={isScanning}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition active:scale-95"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing Locally...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>SCAN SCREEN NOW</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Live Progress & Pipeline Stages */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-500" />
              On-Device Pipeline
            </h3>

            <div className="space-y-3">
              {stages.map((stage) => {
                const isCompleted = activeStage > stage.id;
                const isCurrent = activeStage === stage.id && isScanning;

                return (
                  <div
                    key={stage.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-rose-500/10 border-rose-500/40 ring-1 ring-rose-500/30'
                        : isCompleted
                        ? 'bg-slate-950/60 border-slate-800'
                        : 'bg-slate-950/30 border-slate-800/40 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-rose-400 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 text-[10px] font-mono flex items-center justify-center text-slate-500 shrink-0">
                          {stage.id}
                        </div>
                      )}
                      <span className={`text-xs font-semibold ${isCurrent ? 'text-rose-300' : isCompleted ? 'text-slate-200' : 'text-slate-400'}`}>
                        {stage.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 ml-6.5 mt-1 leading-snug">
                      {stage.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 font-mono space-y-1">
            <div className="text-slate-300 font-semibold flex items-center gap-1.5">
              <span>🔒 Zero-Cloud Guarantee</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Inference runs on Windows on ARM using Qualcomm Hexagon NPU or direct on-device ONNX runtime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
