import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, FolderTree, Activity, Database } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Interactive Map', path: '/map', icon: Map },
    { label: 'Projects', path: '/projects', icon: FolderTree },
  ];

  return (
    <aside className="w-64 bg-slate-900/70 border-r border-slate-800/80 flex flex-col justify-between hidden lg:flex shrink-0">
      <div className="p-4 space-y-6">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3">
          Navigation
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* System Status Banner */}
      <div className="p-4 border-t border-slate-800/60">
        <div className="glass-card p-3 rounded-xl bg-slate-950/40">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>PostGIS Engine Online</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Spatial queries, polygon area calculators, & metric analytics ready.
          </p>
        </div>
      </div>
    </aside>
  );
}
