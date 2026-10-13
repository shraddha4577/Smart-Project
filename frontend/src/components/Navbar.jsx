import React, { useState } from 'react';
import { Activity, Radio, User, LogOut, RefreshCw, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { api } from '../api/client';

export default function Navbar({ currentUser, onLogout, onSimulateTick, activeView, setActiveView }) {
  const [isTicking, setIsTicking] = useState(false);

  const handleQuickTick = async () => {
    setIsTicking(true);
    try {
      await api.triggerTick(1.0);
      if (onSimulateTick) onSimulateTick();
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsTicking(false), 500);
    }
  };

  return (
    <header className="h-16 bg-navy-900/90 backdrop-blur-md border-b border-navy-700 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Brand & Project Identity */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView(currentUser?.role === 'admin' ? 'dashboard' : 'user-dashboard')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[2px] shadow-glow-cyan flex items-center justify-center">
          <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400">
              ECOTWIN
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 tracking-wide">
              v1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 tracking-wide hidden sm:block">
            Smart Waste Management Digital Twin
          </p>
        </div>
      </div>

      {/* Telemetry Simulator Pill & Quick Action */}
      <div className="flex items-center space-x-3">
        <div className="hidden md:flex items-center space-x-2 bg-navy-850 border border-navy-700 px-3 py-1.5 rounded-full text-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-medium">IoT Telemetry:</span>
          <span className="text-emerald-400 font-semibold tracking-wide">SIMULATING</span>
        </div>

        {/* Quick Simulator Tick Button */}
        <button
          onClick={handleQuickTick}
          disabled={isTicking}
          title="Advance IoT simulation by 1 step (~10 min accumulation)"
          className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 border border-cyan-500/30"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTicking ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Simulate Tick</span>
        </button>

        {/* User Identity & Logout */}
        <div className="flex items-center space-x-2 border-l border-navy-700 pl-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-200">{currentUser?.full_name || 'Campus User'}</p>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-cyan-400">
              {currentUser?.role === 'admin' ? 'Facility Admin' : 'Student / Staff'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-navy-750 border border-purple-500/50 flex items-center justify-center text-purple-300 font-bold text-xs shadow-glow-purple">
            {currentUser?.username?.[0]?.toUpperCase() || 'U'}
          </div>

          <button
            onClick={onLogout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-navy-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
