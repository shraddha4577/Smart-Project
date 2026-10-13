import React from 'react';

export default function StatCard({ title, value, unit, icon: Icon, color = 'cyan', subtitle, trend }) {
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/30 hover:border-cyan-400/60',
      glow: 'shadow-glow-cyan',
      iconBg: 'bg-cyan-950/70 text-cyan-400 border-cyan-800/60',
      badge: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    },
    purple: {
      border: 'border-purple-500/30 hover:border-purple-400/60',
      glow: 'shadow-glow-purple',
      iconBg: 'bg-purple-950/70 text-purple-400 border-purple-800/60',
      badge: 'bg-purple-950 text-purple-300 border-purple-800',
    },
    green: {
      border: 'border-emerald-500/30 hover:border-emerald-400/60',
      glow: 'shadow-glow-green',
      iconBg: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60',
      badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    },
    yellow: {
      border: 'border-amber-500/30 hover:border-amber-400/60',
      glow: 'shadow-glow-yellow',
      iconBg: 'bg-amber-950/70 text-amber-400 border-amber-800/60',
      badge: 'bg-amber-950 text-amber-300 border-amber-800',
    },
    red: {
      border: 'border-rose-500/30 hover:border-rose-400/60',
      glow: 'shadow-glow-red',
      iconBg: 'bg-rose-950/70 text-rose-400 border-rose-800/60',
      badge: 'bg-rose-950 text-rose-300 border-rose-800',
    },
  };

  const scheme = colorMap[color] || colorMap.cyan;

  return (
    <div className={`bg-navy-850/80 rounded-2xl p-4 sm:p-5 border transition-all duration-200 ${scheme.border} ${scheme.glow} backdrop-blur-sm relative overflow-hidden group`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${scheme.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</span>
        {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2.5 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400 text-[11px] truncate">{subtitle}</span>}
          {trend && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${scheme.badge}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
