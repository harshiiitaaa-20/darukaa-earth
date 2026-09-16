import React from 'react';

export default function StatCard({ title, value, unit, icon: Icon, trend, trendLabel, color = 'emerald' }) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/10',
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      glow: 'shadow-cyan-500/10',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/10',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      glow: 'shadow-purple-500/10',
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className={`glass-card p-5 relative overflow-hidden group ${scheme.glow}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-2xl lg:text-3xl text-white tracking-tight">
              {value}
            </span>
            {unit && <span className="text-xs font-semibold text-slate-400">{unit}</span>}
          </div>
        </div>
        <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.border} border ${scheme.text}`}>
          <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs">
          <span
            className={`font-semibold ${
              trend >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend >= 0 ? `+${trend}%` : `${trend}%`}
          </span>
          <span className="text-slate-400 text-[11px]">{trendLabel || 'vs baseline'}</span>
        </div>
      )}
    </div>
  );
}
