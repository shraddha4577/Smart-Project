import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Thermometer,
  Wind,
  Battery,
  Clock,
  AlertTriangle,
  RotateCcw,
  Zap,
  Sliders,
  ChevronDown,
  Activity,
  CheckCircle2,
  Trash2,
  Radio
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../api/client';

export default function DigitalTwinView({ bins = [], selectedBinId, onRefreshBins }) {
  const [currentBinId, setCurrentBinId] = useState(selectedBinId || (bins[0]?.id || 1));
  const [bin, setBin] = useState(null);
  const [history, setHistory] = useState([]);
  const [simFill, setSimFill] = useState(0);
  const [isLidOpen, setIsLidOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (selectedBinId) {
      setCurrentBinId(selectedBinId);
    }
  }, [selectedBinId]);

  useEffect(() => {
    const active = bins.find((b) => b.id === Number(currentBinId)) || bins[0];
    if (active) {
      setBin(active);
      setSimFill(active.fill_level);
      setIsLidOpen(active.lid_open);
      fetchHistory(active.id);
    }
  }, [currentBinId, bins]);

  const fetchHistory = async (id) => {
    try {
      const data = await api.getBinHistory(id, 24);
      const formatted = data.map((d) => ({
        time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fill: d.fill_level,
        temp: d.temperature,
        odor: d.odor_ppm,
      }));
      setHistory(formatted);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOverrideFill = async (newVal) => {
    setSimFill(newVal);
    setIsUpdating(true);
    try {
      await api.spikeBin(bin.id, newVal);
      if (onRefreshBins) onRefreshBins();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEmptyBin = async () => {
    setIsUpdating(true);
    try {
      await api.emptyBin(bin.id);
      setSimFill(0);
      if (onRefreshBins) onRefreshBins();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleLid = async () => {
    const nextState = !isLidOpen;
    setIsLidOpen(nextState);
    try {
      await api.updateBin(bin.id, { lid_open: nextState });
      if (onRefreshBins) onRefreshBins();
    } catch (e) {
      console.error(e);
    }
  };

  if (!bin) {
    return <div className="p-8 text-center text-slate-400">Loading Digital Twin telemetry...</div>;
  }

  // Predictive calculations
  const remainingPercent = Math.max(0, 100 - bin.fill_level);
  const hoursToFull = bin.fill_rate_per_hour > 0 ? (remainingPercent / bin.fill_rate_per_hour).toFixed(1) : '∞';
  const binHeightCm = 95;
  const wasteHeightCm = Math.round((bin.fill_level / 100) * binHeightCm);
  const ultrasonicDistanceCm = binHeightCm - wasteHeightCm;

  return (
    <div className="space-y-6">
      {/* Top Controller & Bin Selector */}
      <div className="bg-navy-850 rounded-2xl p-4 sm:p-5 border border-navy-750 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Digital Twin Cyber-Physical Node
            </h2>
            <span className="text-xs bg-navy-750 text-cyan-300 font-mono px-2 py-0.5 rounded border border-cyan-800">
              Twin ID: {bin.bin_code}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ultrasonic fill telemetry, environmental state estimation, and physical actuation.
          </p>
        </div>

        {/* Bin Switcher Dropdown */}
        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:block">
            Target Bin:
          </label>
          <select
            value={currentBinId}
            onChange={(e) => setCurrentBinId(Number(e.target.value))}
            className="bg-navy-900 border border-navy-700 text-slate-100 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500 transition-colors"
          >
            {bins.map((b) => (
              <option key={b.id} value={b.id}>
                {b.bin_code} — {b.name} ({b.fill_level}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Twin Grid: Physical 3D/Isometric Model + Live Sensor Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Cyber-Physical Twin (Isometric Smart Container) */}
        <div className="lg:col-span-5 bg-navy-850 rounded-2xl p-6 border border-navy-750 flex flex-col items-center justify-between relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>3D Physical Twin Canvas</span>
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              bin.status === 'CRITICAL'
                ? 'bg-rose-950 text-rose-300 border-rose-800'
                : bin.status === 'WARNING'
                ? 'bg-amber-950 text-amber-300 border-amber-800'
                : 'bg-emerald-950 text-emerald-300 border-emerald-800'
            }`}>
              {bin.status} STATE
            </span>
          </div>

          {/* Ultrasonic Sensor Beam & Physical Container Graphic */}
          <div className="relative w-64 h-80 my-4 flex flex-col items-center justify-center">
            {/* Ultrasonic Transceiver Module at Top */}
            <div className="z-20 bg-navy-900 border-2 border-cyan-400/80 rounded-t-xl px-4 py-1.5 shadow-glow-cyan flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[10px] font-mono font-bold text-cyan-300 tracking-wider">
                HC-SR04 ULTRASONIC ({ultrasonicDistanceCm} cm echo)
              </span>
            </div>

            {/* Simulated Ultrasonic Sonar Rays */}
            <div className="w-24 h-8 relative flex justify-around overflow-hidden opacity-60">
              <div className="w-0.5 h-full bg-cyan-400 animate-pulse" />
              <div className="w-0.5 h-full bg-cyan-400 animate-pulse delay-75" />
              <div className="w-0.5 h-full bg-cyan-400 animate-pulse delay-150" />
            </div>

            {/* Smart Bin Outer Transparent Casing */}
            <div className="w-48 h-64 border-2 border-navy-600 rounded-b-2xl relative overflow-hidden bg-navy-950/80 backdrop-blur-md shadow-2xl flex flex-col justify-end">
              {/* Inner Height Markers (100%, 75%, 50%, 25%) */}
              <div className="absolute inset-y-0 right-2 flex flex-col justify-between py-2 text-[9px] text-slate-400 font-mono select-none pointer-events-none z-10">
                <span>100% (95cm)</span>
                <span>75% (71cm)</span>
                <span>50% (47cm)</span>
                <span>25% (23cm)</span>
                <span>0% (Empty)</span>
              </div>

              {/* Warning Threshold Reference Line */}
              <div className="absolute bottom-[70%] left-0 right-0 border-b border-dashed border-amber-400/60 z-10">
                <span className="text-[8px] text-amber-300 font-mono ml-2">Warning 70%</span>
              </div>

              {/* Critical Threshold Reference Line */}
              <div className="absolute bottom-[90%] left-0 right-0 border-b border-dashed border-rose-500/80 z-10">
                <span className="text-[8px] text-rose-400 font-mono ml-2">Critical 90%</span>
              </div>

              {/* Dynamic Waste Volume Fill with Wave Animation */}
              <div
                className={`w-full transition-all duration-700 relative ${
                  bin.fill_level >= 90
                    ? 'bg-gradient-to-t from-rose-900/90 via-rose-700/80 to-rose-500/80'
                    : bin.fill_level >= 70
                    ? 'bg-gradient-to-t from-amber-900/90 via-amber-700/80 to-amber-500/80'
                    : 'bg-gradient-to-t from-emerald-950/90 via-emerald-700/80 to-emerald-500/80'
                }`}
                style={{ height: `${bin.fill_level}%` }}
              >
                {/* Surface Ripple Animation */}
                <div className="w-full h-2 bg-white/20 blur-[1px] absolute top-0 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black text-white font-mono drop-shadow-md">
                    {Math.round(bin.fill_level)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Base Stand with Microcontroller / NB-IoT Node */}
            <div className="w-56 h-4 bg-navy-800 rounded-b-xl border-t border-navy-700 flex items-center justify-center text-[9px] text-slate-400 font-mono">
              NB-IoT GATEWAY • ESP32 PROBE
            </div>
          </div>

          {/* Quick Twin Stats Bar */}
          <div className="w-full grid grid-cols-2 gap-2 text-center pt-3 border-t border-navy-750 text-xs">
            <div className="bg-navy-900/80 p-2 rounded-xl border border-navy-700">
              <span className="text-slate-400 text-[10px] block">Waste Depth</span>
              <span className="font-bold text-white">{wasteHeightCm} cm</span>
            </div>
            <div className="bg-navy-900/80 p-2 rounded-xl border border-navy-700">
              <span className="text-slate-400 text-[10px] block">Headroom Echo</span>
              <span className="font-bold text-cyan-400">{ultrasonicDistanceCm} cm</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sensor Telemetry, Predictive Analytics & Live Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Real-time Telemetry Sensor Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Temperature */}
            <div className="bg-navy-850 p-4 rounded-xl border border-navy-750 hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                <span>Internal Temp</span>
              </div>
              <p className="text-xl font-bold text-white">{bin.temperature}°C</p>
              <span className="text-[10px] text-slate-400">DHT22 Probe</span>
            </div>

            {/* Odor Index */}
            <div className="bg-navy-850 p-4 rounded-xl border border-navy-750 hover:border-purple-500/50 transition-colors">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
                <Wind className="w-4 h-4 text-purple-400" />
                <span>Air Odor PPM</span>
              </div>
              <p className={`text-xl font-bold ${bin.odor_ppm > 25 ? 'text-rose-400' : 'text-purple-300'}`}>
                {bin.odor_ppm}
              </p>
              <span className="text-[10px] text-slate-400">MQ-135 Sensor</span>
            </div>

            {/* Battery Level */}
            <div className="bg-navy-850 p-4 rounded-xl border border-navy-750 hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
                <Battery className="w-4 h-4 text-emerald-400" />
                <span>Battery Node</span>
              </div>
              <p className="text-xl font-bold text-white">{bin.battery_level}%</p>
              <span className="text-[10px] text-slate-400">Solar 3.7V LiPo</span>
            </div>

            {/* Lid Status */}
            <div className="bg-navy-850 p-4 rounded-xl border border-navy-750 hover:border-amber-500/50 transition-colors">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Lid Actuator</span>
              </div>
              <p className="text-base font-bold text-white">
                {isLidOpen ? 'OPEN' : 'CLOSED'}
              </p>
              <span className="text-[10px] text-slate-400">Magnetic Switch</span>
            </div>
          </div>

          {/* Predictive AI Forecasting Card */}
          <div className="bg-gradient-to-r from-navy-850 via-navy-800 to-navy-850 rounded-2xl p-5 border border-navy-700 shadow-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <h3 className="font-bold text-sm text-white">Digital Twin Overflow Forecasting</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-navy-900/80 p-3 rounded-xl border border-navy-750">
                <span className="text-slate-400 text-[11px] block">Accumulation Velocity</span>
                <span className="text-sm font-bold text-slate-100">{bin.fill_rate_per_hour}% / hr</span>
              </div>
              <div className="bg-navy-900/80 p-3 rounded-xl border border-navy-750">
                <span className="text-slate-400 text-[11px] block">Est. Time to Overflow</span>
                <span className={`text-sm font-bold ${Number(hoursToFull) <= 2 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`}>
                  ~{hoursToFull} hours
                </span>
              </div>
              <div className="bg-navy-900/80 p-3 rounded-xl border border-navy-750">
                <span className="text-slate-400 text-[11px] block">Depot Recommendation</span>
                <span className="text-xs font-semibold text-slate-300">
                  {bin.fill_level >= 90 ? 'DISPATCH TRUCK NOW' : bin.fill_level >= 70 ? 'NEXT FLEET RUN' : 'HOLD DISPATCH'}
                </span>
              </div>
            </div>
          </div>

          {/* College Demo Presentation Controls (Interactive Hardware Overrides) */}
          <div className="bg-navy-850 rounded-2xl p-5 border border-cyan-500/20 shadow-glow-cyan">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  Interactive Evaluation Overrides (For Demonstrators)
                </h4>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono">Live Sync</span>
            </div>

            <div className="space-y-4">
              {/* Fill Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Override Ultrasonic Sensor Fill:</span>
                  <span className="font-bold text-cyan-400">{Math.round(simFill)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simFill}
                  onChange={(e) => handleOverrideFill(Number(e.target.value))}
                  className="w-full h-2 bg-navy-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleEmptyBin}
                  disabled={isUpdating}
                  className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Actuate Collection (Empty 0%)</span>
                </button>

                <button
                  onClick={handleToggleLid}
                  className="flex items-center space-x-1.5 bg-navy-750 hover:bg-navy-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-navy-650 transition-all active:scale-95"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>Toggle Lid ({isLidOpen ? 'Close' : 'Open'})</span>
                </button>

                <button
                  onClick={() => handleOverrideFill(96)}
                  className="flex items-center space-x-1.5 bg-navy-750 hover:bg-navy-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-navy-650 transition-all active:scale-95"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Spike to Critical (96%)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Historical Telemetry Curve for This Bin */}
      <div className="bg-navy-850 rounded-2xl p-5 border border-navy-750 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Historical Telemetry Twin Time-Series (24-Hour Horizon)</span>
            </h3>
            <p className="text-xs text-slate-400">Fill Level (%), Temperature (°C), and Odor index trends.</p>
          </div>
        </div>

        <div className="h-64 w-full">
          {history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2e52" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0e1628',
                    borderColor: '#1f2e52',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="fill" name="Fill Level (%)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#fillGrad)" />
                <Area type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#tempGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Gathering telemetry history points...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
