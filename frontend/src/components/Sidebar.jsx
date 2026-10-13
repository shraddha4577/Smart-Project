import React from 'react';
import {
  LayoutDashboard,
  Trash2,
  ScanLine,
  Boxes,
  BrainCircuit,
  Truck,
  BarChart3,
  Sliders,
  MapPin,
  AlertTriangle,
  Award,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeView, setActiveView, role }) {
  const adminNav = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, color: 'text-cyan-400' },
    { id: 'bins', label: 'Manage Waste Data', icon: Trash2, color: 'text-emerald-400' },
    { id: 'vision', label: 'AI Detection (YOLO/CV)', icon: ScanLine, color: 'text-purple-400' },
    { id: 'digital-twin', label: 'Digital Twin Model', icon: Boxes, color: 'text-cyan-400' },
    { id: 'recommendations', label: 'AI Recommendations', icon: BrainCircuit, color: 'text-yellow-400' },
    { id: 'collections', label: 'Collection Management', icon: Truck, color: 'text-rose-400' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, color: 'text-indigo-400' },
    { id: 'settings', label: 'System Settings', icon: Sliders, color: 'text-slate-400' },
  ];

  const userNav = [
    { id: 'user-dashboard', label: 'Student Dashboard', icon: LayoutDashboard, color: 'text-cyan-400' },
    { id: 'map-locator', label: 'Campus Bin Map', icon: MapPin, color: 'text-emerald-400' },
    { id: 'vision', label: 'AI Waste Scanner', icon: ScanLine, color: 'text-purple-400' },
    { id: 'report-issue', label: 'Report Overflow', icon: AlertTriangle, color: 'text-amber-400' },
    { id: 'user-reports', label: 'Sustainability Stats', icon: Award, color: 'text-cyan-400' },
  ];

  const navItems = role === 'admin' ? adminNav : userNav;

  return (
    <aside className="w-64 bg-navy-900 border-r border-navy-750 flex flex-col shrink-0 select-none hidden md:flex">
      {/* Role Header Banner */}
      <div className="p-4 border-b border-navy-800">
        <div className="bg-navy-850/80 rounded-xl p-3 border border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Navigation Mode</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              role === 'admin' 
                ? 'bg-purple-950/80 text-purple-300 border border-purple-700' 
                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
            }`}>
              {role === 'admin' ? 'Admin Portal' : 'Student Portal'}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {role === 'admin' ? 'Full IoT Fleet & Analytics Ops' : 'Eco-Disposal & Campus Guide'}
          </p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-navy-800 to-navy-750 text-white shadow-sm border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-850/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? item.color : 'text-slate-400'
                  }`}
                />
                <span className={isActive ? 'text-slate-100 font-bold' : ''}>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
            </button>
          );
        })}
      </nav>

      {/* College Project Credit Banner */}
      <div className="p-4 border-t border-navy-800 text-[11px] text-slate-400 bg-navy-950/40">
        <p className="font-semibold text-slate-300">Final Year Capstone Project</p>
        <p className="text-[10px] text-slate-400">Team: Smart Waste Digital Twin</p>
        <div className="mt-2 flex items-center space-x-2 text-[10px] text-cyan-400 font-mono">
          <span>● FastAPI</span>
          <span>● OpenCV</span>
          <span>● React</span>
        </div>
      </div>
    </aside>
  );
}
