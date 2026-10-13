import React, { useState } from 'react';
import {
  ScanLine,
  Upload,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { api } from '../api/client';

// Generate synthetic canvas images as quick sample presets
const createPresetImageBlob = async (type) => {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  if (type === 'plastic') {
    // Light blue background with transparent plastic bottle silhouette
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.roundRect(140, 80, 120, 240, [20, 20, 15, 15]);
    ctx.fill();
    ctx.fillStyle = '#0891b2';
    ctx.fillRect(170, 50, 60, 30); // cap
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('PET 100% RECYCLE', 145, 200);
  } else if (type === 'organic') {
    // Green food peel
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(200, 200, 110, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#854d0e'; // stem
    ctx.fillRect(190, 70, 20, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('ORGANIC COMPOST', 130, 205);
  } else if (type === 'paper') {
    // Cardboard box
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(100, 110, 200, 180);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(100, 110, 200, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('CORRUGATED BOX', 120, 210);
  } else if (type === 'metal') {
    // Aluminum can
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.roundRect(140, 100, 120, 200, 15);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(150, 80, 100, 20);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('ALUMINUM CAN', 142, 210);
  } else {
    // E-waste
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = '#047857';
    ctx.fillRect(90, 130, 220, 140);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(100, 250, 200, 15);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('PCB MOTHERBOARD', 115, 205);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg');
  });
};

export default function AIDetectionView() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleSelectPreset = async (presetKey) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      const blob = await createPresetImageBlob(presetKey);
      const file = new File([blob], `${presetKey}_sample.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      const formData = new FormData();
      formData.append('file', file);
      const data = await api.classifyImage(formData);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Detection failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadAndScan = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const data = await api.classifyImage(formData);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Detection failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-navy-850 rounded-2xl p-5 border border-navy-750 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ScanLine className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              AI Computer Vision Waste Segregation Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            OpenCV & YOLOv8 dual pipeline for recyclability classification, contamination detection, and boundary extraction.
          </p>
        </div>

        {/* Demo Mode Badge */}
        <div className="flex items-center space-x-2 bg-navy-900 border border-purple-500/40 px-3.5 py-1.5 rounded-full shadow-glow-purple text-xs">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span className="text-slate-300 font-semibold">Inference Engine:</span>
          <span className="text-purple-300 font-bold">
            {result?.is_demo_mode ? 'OpenCV Contour & Color Analysis (Demo Fallback)' : 'OpenCV / YOLOv8 Active'}
          </span>
        </div>
      </div>

      {/* Preset Quick Selectors */}
      <div className="bg-navy-850 rounded-2xl p-5 border border-navy-750">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Instant Evaluation Presets (Click to Test Without Uploading)</span>
          </span>
          <span className="text-[11px] text-slate-400">1-Click Evaluation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={() => handleSelectPreset('plastic')}
            disabled={isAnalyzing}
            className="p-3 rounded-xl bg-navy-900 hover:bg-navy-800 border border-cyan-500/30 hover:border-cyan-400 text-left transition-all group"
          >
            <span className="text-xs font-bold text-cyan-300 block group-hover:text-cyan-200">🥤 Plastic Bottle</span>
            <span className="text-[10px] text-slate-400">Polymer / Dry</span>
          </button>

          <button
            onClick={() => handleSelectPreset('organic')}
            disabled={isAnalyzing}
            className="p-3 rounded-xl bg-navy-900 hover:bg-navy-800 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all group"
          >
            <span className="text-xs font-bold text-emerald-300 block group-hover:text-emerald-200">🍏 Organic Peel</span>
            <span className="text-[10px] text-slate-400">Compostable Wet</span>
          </button>

          <button
            onClick={() => handleSelectPreset('paper')}
            disabled={isAnalyzing}
            className="p-3 rounded-xl bg-navy-900 hover:bg-navy-800 border border-amber-500/30 hover:border-amber-400 text-left transition-all group"
          >
            <span className="text-xs font-bold text-amber-300 block group-hover:text-amber-200">📦 Cardboard Box</span>
            <span className="text-[10px] text-slate-400">Dry Paper Stream</span>
          </button>

          <button
            onClick={() => handleSelectPreset('metal')}
            disabled={isAnalyzing}
            className="p-3 rounded-xl bg-navy-900 hover:bg-navy-800 border border-slate-500/30 hover:border-slate-400 text-left transition-all group"
          >
            <span className="text-xs font-bold text-slate-200 block group-hover:text-white">🥫 Aluminum Can</span>
            <span className="text-[10px] text-slate-400">Metallic Scrap</span>
          </button>

          <button
            onClick={() => handleSelectPreset('ewaste')}
            disabled={isAnalyzing}
            className="p-3 rounded-xl bg-navy-900 hover:bg-navy-800 border border-purple-500/30 hover:border-purple-400 text-left transition-all group"
          >
            <span className="text-xs font-bold text-purple-300 block group-hover:text-purple-200">💻 PCB Circuit</span>
            <span className="text-[10px] text-slate-400">Hazardous E-Waste</span>
          </button>
        </div>
      </div>

      {/* Main Upload & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upload Dropzone & Original Image Preview */}
        <div className="lg:col-span-5 bg-navy-850 rounded-2xl p-6 border border-navy-750 flex flex-col items-center justify-between space-y-4">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Image Input Stream</span>
            {previewUrl && (
              <span className="text-[11px] text-cyan-400 font-mono">Image Loaded</span>
            )}
          </div>

          <div className="w-full h-72 border-2 border-dashed border-navy-700 hover:border-cyan-500/60 rounded-2xl bg-navy-950/60 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Uploaded Waste"
                className="max-h-full max-w-full object-contain rounded-xl shadow-lg"
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-navy-800 border border-navy-700 flex items-center justify-center mx-auto text-cyan-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Drop waste image or click to browse</p>
                  <p className="text-[10px] text-slate-500 mt-1">Supports JPEG, PNG, WEBP (Max 10MB)</p>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          <div className="w-full flex space-x-3">
            <button
              onClick={handleUploadAndScan}
              disabled={!selectedFile || isAnalyzing}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-glow-purple transition-all flex items-center justify-center space-x-2"
            >
              <ScanLine className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Running Inference...' : 'Analyze Waste Image'}</span>
            </button>
          </div>
        </div>

        {/* Right: Computer Vision Detection Results & Annotated Visualizer */}
        <div className="lg:col-span-7 bg-navy-850 rounded-2xl p-6 border border-navy-750 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Computer Vision Annotation & Classification
            </span>
            {result?.is_demo_mode && (
              <span className="text-[10px] bg-amber-950/80 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-800">
                DEMO MODE FALLBACK
              </span>
            )}
          </div>

          {result ? (
            <div className="space-y-4">
              {/* Annotated OpenCV / YOLO Image */}
              {result.annotated_image && (
                <div className="w-full h-64 bg-navy-950 rounded-xl overflow-hidden border border-navy-700 flex items-center justify-center relative">
                  <img
                    src={result.annotated_image}
                    alt="Annotated Waste Detection"
                    className="max-h-full max-w-full object-contain"
                  />
                  <div className="absolute top-2 right-2 bg-navy-900/90 text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded border border-navy-700">
                    OpenCV Bounding Box
                  </div>
                </div>
              )}

              {/* Class & Confidence Badge */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-navy-900 p-3 rounded-xl border border-navy-750">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Detected Class</span>
                  <span className="text-xs font-bold text-cyan-400 truncate block mt-0.5">
                    {result.detected_class}
                  </span>
                </div>

                <div className="bg-navy-900 p-3 rounded-xl border border-navy-750">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Model Confidence</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>

                <div className="bg-navy-900 p-3 rounded-xl border border-navy-750">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Stream Category</span>
                  <span className={`text-xs font-bold mt-0.5 block ${result.recyclable ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {result.recyclable ? '♻️ Recyclable' : '🚫 Non-Recyclable'}
                  </span>
                </div>

                <div className="bg-navy-900 p-3 rounded-xl border border-navy-750">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Contamination</span>
                  <span className={`text-xs font-bold mt-0.5 block ${
                    result.contamination_level === 'LOW' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {result.contamination_level}
                  </span>
                </div>
              </div>

              {/* Actionable Disposal Guide */}
              <div className="bg-navy-900/80 p-4 rounded-xl border border-navy-700 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                    Smart Disposal Protocol
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {result.disposal_guide}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 border border-dashed border-navy-750 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-500">
              <ScanLine className="w-8 h-8 text-slate-600" />
              <p className="text-xs font-medium">No waste scan performed yet.</p>
              <p className="text-[11px] text-slate-600">Select one of the instant presets above or upload an image to see bounding boxes.</p>
            </div>
          )}

          {error && (
            <div className="bg-rose-950/60 border border-rose-800 p-3 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
