import React, { useState } from 'react';
import {
  Trash2,
  AlertTriangle,
  CheckCircle,
  Truck,
  Battery,
  Activity,
  Cpu,
  RefreshCw,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import StatCard from '../components/StatCard';
import CampusMap from '../components/CampusMap';
import { api } from '../api/client';

export default function AdminDashboardView({
  bins = [],
  stats,
  alerts = [],
  onRefreshData,
  onSelectTwinBin,
  setActiveView
}) {
  const [filterZone, setFilterZone] = useState('ALL');
  const [isProcessing, setIsProcessing] = useState(false);

  const zones = ['ALL', 'Academic', 'Cafeteria', 'Hostel', 'Research Park', 'Sports Arena', 'Admin Block'];

  const filteredBins = filterZone === 'ALL'
    ? bins
    : bins.filter((b) => b.zone === filterZone);

  const handleEmptyBin = async (binId) => {
    setIsProcessing(true);
    try {
      await api.emptyBin(binId);
      if (onRefreshData) onRefreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDispatchAll = async () => {
    setIsProcessing(true);
    try {
      await api.dispatchAll();
      if (onRefreshData) onRefreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Monitored Bins"
          value={stats?.total_bins || bins.length}
          unit="Nodes"
          color="cyan"
          subtitle="Campus Smart Grid"
          trend="8 Active"
        />
        <StatCard
          title="Critical Overflow"
          value={stats?.critical_bins || bins.filter((b) => b.status === 'CRITICAL').length}
          unit="Bins"
          color="red"
          subtitle="Fill Level ≥ 90%"
          trend="Urgent"
        />
        <StatCard
          title="Warning Level"
          value={stats?.warning_bins || bins.filter((b) => b.status === 'WARNING').length}
          unit="Bins"
          color="yellow"
          subtitle="Fill Level 70–89%"
          trend="Route Soon"
        />
        <StatCard
          title="Collected Today"
          value={stats?.waste_collected_today_kg || 365}
          unit="kg"
          color="green"
          subtitle="Clean Campus Index"
          trend="+18% Eff."
        />
        <StatCard
          title="Sensor Health"
          value={stats?.sensor_health_percent || 94}
          unit="%"
          color="purple"
          subtitle="NB-IoT & Battery Fleet"
          trend="Optimal"
        />
      </div>

      {/* Campus Map & Live Alerts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Campus Map */}
        <div className="lg:col-span-8 bg-navy-850 rounded-2xl p-5 border border-navy-750 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-navy-750 gap-3">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>Geospatial IoT Telemetry Map</span>
              </h3>
              <p className="text-xs text-slate-400">
                Click any container marker to inspect live ultrasonic depth, telemetry, or open Digital Twin.
              </p>
            </div>

            {/* Zone Filter Dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Zone:</span>
              <select
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className="bg-navy-900 border border-navy-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
              >
                {zones.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <CampusMap
              bins={filteredBins}
              onSelectTwinBin={(bin) => {
                if (onSelectTwinBin) onSelectTwinBin(bin);
                setActiveView('digital-twin');
              }}
              onEmptyBin={handleEmptyBin}
            />
          </div>
        </div>

        {/* Right: Active Collection Alerts & Urgent Dispatch */}
        <div className="lg:col-span-4 bg-navy-850 rounded-2xl p-5 border border-navy-750 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-navy-750">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <Truck className="w-4 h-4 text-cyan-400" />
              <span>Urgent Collection Alerts</span>
            </h3>
            <button
              onClick={handleDispatchAll}
              disabled={isProcessing}
              className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 bg-navy-900 border border-cyan-800/80 px-2 py-1 rounded-lg transition-colors active:scale-95"
            >
              Dispatch All
            </button>
          </div>

          <div className="my-3 space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-navy-900 p-3.5 rounded-xl border border-navy-750 hover:border-navy-650 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-bold text-xs text-slate-100">{alert.bin_name}</h5>
                      <span className="text-[10px] text-cyan-400 font-mono">{alert.bin_code}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      alert.status === 'PENDING'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : alert.status === 'ASSIGNED'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {alert.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {alert.notes || 'Automated fill threshold trigger.'}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-navy-800 text-[10px] text-slate-400">
                    <span>Driver: {alert.driver_name || 'Unassigned'}</span>
                    <button
                      onClick={() => handleEmptyBin(alert.bin_id)}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      Mark Emptied
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs">
                No active collection alerts.
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveView('collections')}
            className="w-full bg-navy-900 hover:bg-navy-800 border border-navy-700 text-slate-300 text-xs font-semibold py-2 rounded-xl transition-colors text-center"
          >
            Open Collection Operations Board →
          </button>
        </div>
      </div>

      {/* Live IoT Telemetry Table */}
      <div className="bg-navy-850 rounded-2xl p-5 border border-navy-750">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-navy-750 gap-2 mb-4">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Fleet Telemetry Stream (All Campus Nodes)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Live updates reflecting simulated ultrasonic depth, ambient temperatures, odor index, and battery levels.
            </p>
          </div>
          <button
            onClick={onRefreshData}
            className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-navy-900 border border-navy-700 px-3 py-1.5 rounded-xl transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Refresh Stream</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-750 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Node Code</th>
                <th className="pb-3 font-semibold">Location / Zone</th>
                <th className="pb-3 font-semibold">Waste Stream</th>
                <th className="pb-3 font-semibold">Fill Level (%)</th>
                <th className="pb-3 font-semibold">Sensors (Temp / Odor)</th>
                <th className="pb-3 font-semibold">Battery</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800 text-slate-200">
              {filteredBins.map((bin) => (
                <tr key={bin.id} className="hover:bg-navy-800/40 transition-colors">
                  <td className="py-3 font-mono font-bold text-cyan-400">{bin.bin_code}</td>
                  <td className="py-3">
                    <p className="font-semibold text-white">{bin.name}</p>
                    <p className="text-[11px] text-slate-400">{bin.location_name} • {bin.zone}</p>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-navy-900 text-slate-300 border border-navy-700 text-[10px] font-semibold">
                      {bin.waste_type}
                    </span>
                  </td>
                  <td className="py-3 min-w-[140px]">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-navy-950 h-2 rounded-full overflow-hidden border border-navy-700">
                        <div
                          className={`h-full rounded-full ${
                            bin.fill_level >= 90
                              ? 'bg-rose-500'
                              : bin.fill_level >= 70
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${bin.fill_level}%` }}
                        />
                      </div>
                      <span className="font-bold text-xs font-mono">{Math.round(bin.fill_level)}%</span>
                    </div>
                  </td>
                  <td className="py-3 font-mono text-[11px] text-slate-300">
                    {bin.temperature}°C • {bin.odor_ppm} ppm
                  </td>
                  <td className="py-3">
                    <span className="font-mono text-emerald-400 text-xs font-semibold">{bin.battery_level}%</span>
                  </td>
                  <td className="py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      bin.status === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : bin.status === 'WARNING'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {bin.status}
                    </span>
                  </td>
                  <td className="py-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        if (onSelectTwinBin) onSelectTwinBin(bin);
                        setActiveView('digital-twin');
                      }}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-navy-900 px-2.5 py-1 rounded-lg border border-navy-700 hover:border-cyan-500 transition-colors"
                    >
                      Twin
                    </button>
                    <button
                      onClick={() => handleEmptyBin(bin.id)}
                      className="text-xs font-semibold text-rose-400 hover:text-rose-300 bg-navy-900 px-2.5 py-1 rounded-lg border border-navy-700 hover:border-rose-500 transition-colors"
                    >
                      Empty
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
