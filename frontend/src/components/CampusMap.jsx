import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Trash2, AlertCircle, RefreshCw, Cpu, Activity, Thermometer, Wind, Battery } from 'lucide-react';

const createBinIcon = (status, fillLevel) => {
  let bgColor = '#10b981'; // Green
  let ringColor = 'rgba(16, 185, 129, 0.4)';
  let isPulse = false;

  if (status === 'CRITICAL' || fillLevel >= 90) {
    bgColor = '#ef4444'; // Red
    ringColor = 'rgba(239, 68, 68, 0.6)';
    isPulse = true;
  } else if (status === 'WARNING' || fillLevel >= 70) {
    bgColor = '#f59e0b'; // Yellow / Amber
    ringColor = 'rgba(245, 158, 11, 0.4)';
  }

  const html = `
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
      ${isPulse ? `<div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${ringColor}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
      <div style="width: 28px; height: 28px; border-radius: 50%; background: #0a0f1d; border: 2.5px solid ${bgColor}; box-shadow: 0 0 12px ${ringColor}; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 800; font-family: monospace;">
        ${Math.round(fillLevel)}%
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-bin-marker',
    html: html,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};

export default function CampusMap({ bins = [], onSelectTwinBin, onEmptyBin, center = [12.9716, 77.5946], zoom = 16 }) {
  return (
    <div className="w-full h-[480px] rounded-2xl overflow-hidden border border-navy-750 shadow-2xl relative">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a> Dark Matter'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
        />

        {bins.map((bin) => (
          <Marker
            key={bin.id}
            position={[bin.latitude, bin.longitude]}
            icon={createBinIcon(bin.status, bin.fill_level)}
          >
            <Popup>
              <div className="p-1 min-w-[220px]">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-navy-700">
                  <div>
                    <h4 className="font-bold text-sm text-white">{bin.name}</h4>
                    <p className="text-[11px] text-cyan-400 font-mono">{bin.bin_code} • {bin.zone}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    bin.status === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : bin.status === 'WARNING'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    {bin.status}
                  </span>
                </div>

                {/* Fill Level Meter */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 font-medium">Fill Capacity:</span>
                    <span className="font-bold text-slate-200">{bin.fill_level}% ({bin.capacity_liters}L)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-navy-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        bin.fill_level >= 90
                          ? 'bg-rose-500 shadow-glow-red'
                          : bin.fill_level >= 70
                          ? 'bg-amber-500 shadow-glow-yellow'
                          : 'bg-emerald-500 shadow-glow-green'
                      }`}
                      style={{ width: `${bin.fill_level}%` }}
                    />
                  </div>
                </div>

                {/* IoT Live Sensors Grid */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-navy-700/60 text-[11px]">
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <Thermometer className="w-3 h-3 text-cyan-400" />
                    <span>{bin.temperature}°C</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <Wind className="w-3 h-3 text-purple-400" />
                    <span>{bin.odor_ppm} PPM</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <Battery className="w-3 h-3 text-emerald-400" />
                    <span>{bin.battery_level}% Batt</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                    <span>{bin.waste_type}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-3 pt-2 border-t border-navy-700 flex space-x-2">
                  {onSelectTwinBin && (
                    <button
                      onClick={() => onSelectTwinBin(bin)}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold py-1 px-2 rounded-lg transition-colors flex items-center justify-center space-x-1"
                    >
                      <Cpu className="w-3 h-3" />
                      <span>Digital Twin</span>
                    </button>
                  )}
                  {onEmptyBin && (
                    <button
                      onClick={() => onEmptyBin(bin.id)}
                      className="bg-navy-750 hover:bg-rose-900/60 text-slate-200 hover:text-rose-200 text-[11px] font-semibold py-1 px-2 rounded-lg border border-navy-600 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Empty</span>
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend Floating Pill */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-navy-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-navy-700 text-xs shadow-xl flex items-center space-x-4">
        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Status:</span>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-glow-green" />
          <span className="text-slate-300 text-[11px]">Normal (&lt;70%)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-glow-yellow" />
          <span className="text-slate-300 text-[11px]">Warning (70-89%)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-glow-red" />
          <span className="text-slate-300 text-[11px]">Critical (≥90%)</span>
        </div>
      </div>
    </div>
  );
}
