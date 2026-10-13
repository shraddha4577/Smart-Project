import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Save,
  RotateCcw,
  MapPin,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Gauge
} from 'lucide-react';
import { api } from '../api/client';

export default function SystemSettingsView({ onRefreshAll }) {
  const [config, setConfig] = useState({
    warning_threshold: 70.0,
    critical_threshold: 90.0,
    simulation_speed: 1.0,
    map_center_lat: 12.9716,
    map_center_lng: 77.5946,
    ai_engine_mode: 'AUTO_HYBRID',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      setConfig(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const updated = await api.updateSettings(config);
      setConfig(updated);
      setSuccessMsg('System configuration and operational thresholds updated successfully!');
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all campus bins, alerts, and telemetry history to factory college demo default?')) return;
    try {
      await api.resetSimulation();
      setSuccessMsg('Database re-seeded with pristine college demo dataset!');
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      setErrorMsg(err.message || 'Reset failed');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-navy-850 rounded-2xl p-5 border border-navy-750 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Digital Twin System Settings & Thresholds
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure telemetry threshold trigger boundaries, physics update rates, and AI model modes.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="bg-navy-800 hover:bg-rose-950/80 border border-navy-700 hover:border-rose-700 text-slate-300 hover:text-rose-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Demo Data</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-3.5 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3.5 rounded-xl text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Sensor Thresholds Card */}
        <div className="bg-navy-850 rounded-2xl p-5 border border-navy-750 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Gauge className="w-4 h-4 text-yellow-400" />
            <span>Configurable IoT Fill Threshold Boundaries</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Warning Threshold */}
            <div className="bg-navy-900 p-4 rounded-xl border border-navy-750 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-amber-300">Warning Status Threshold:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{config.warning_threshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="85"
                step="1"
                value={config.warning_threshold}
                onChange={(e) => setConfig({ ...config, warning_threshold: Number(e.target.value) })}
                className="w-full h-2 bg-navy-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <p className="text-[10px] text-slate-400">
                Containers exceeding this value are queued into predictive fleet routing.
              </p>
            </div>

            {/* Critical Threshold */}
            <div className="bg-navy-900 p-4 rounded-xl border border-navy-750 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-rose-300">Critical Status Threshold:</span>
                <span className="font-mono font-bold text-rose-400 text-sm">{config.critical_threshold}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="98"
                step="1"
                value={config.critical_threshold}
                onChange={(e) => setConfig({ ...config, critical_threshold: Number(e.target.value) })}
                className="w-full h-2 bg-navy-950 rounded-lg appearance-none cursor-pointer accent-rose-400"
              />
              <p className="text-[10px] text-slate-400">
                Instantly fires automated high-priority fleet collection alerts.
              </p>
            </div>
          </div>
        </div>

        {/* Geofence & Map Coordinates Card */}
        <div className="bg-navy-850 rounded-2xl p-5 border border-navy-750 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Campus Geofence & GIS Coordinates</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Campus Depot Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={config.map_center_lat}
                onChange={(e) => setConfig({ ...config, map_center_lat: Number(e.target.value) })}
                className="w-full bg-navy-900 border border-navy-750 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Campus Depot Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={config.map_center_lng}
                onChange={(e) => setConfig({ ...config, map_center_lng: Number(e.target.value) })}
                className="w-full bg-navy-900 border border-navy-750 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* AI & Simulation Speed Card */}
        <div className="bg-navy-850 rounded-2xl p-5 border border-navy-750 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Simulation Speed & AI Engine Mode</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">IoT Simulation Speed Multiplier</label>
              <select
                value={config.simulation_speed}
                onChange={(e) => setConfig({ ...config, simulation_speed: Number(e.target.value) })}
                className="w-full bg-navy-900 border border-navy-750 rounded-xl px-3 py-2 text-white"
              >
                <option value={0.5}>0.5x (Slow Physics Accumulation)</option>
                <option value={1.0}>1.0x (Standard Real-time Simulation)</option>
                <option value={2.0}>2.0x (Accelerated Demonstration)</option>
                <option value={5.0}>5.0x (High Velocity Presentation)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">AI Recommendation Mode</label>
              <select
                value={config.ai_engine_mode}
                onChange={(e) => setConfig({ ...config, ai_engine_mode: e.target.value })}
                className="w-full bg-navy-900 border border-navy-750 rounded-xl px-3 py-2 text-white"
              >
                <option value="AUTO_HYBRID">AUTO HYBRID (Gemini if key set, else Heuristics)</option>
                <option value="RULE_BASED_ONLY">RULE-BASED ONLY (College Offline Heuristics)</option>
                <option value="GEMINI_GENAI">GEMINI GENAI (Requires Valid API Key)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-glow-cyan transition-all flex items-center space-x-2 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
