import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, User, LogOut, ShieldCheck, Leaf } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalProjects, totalSites } = useProjects();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 sticky top-0 z-50 flex items-center justify-between">
      {/* Brand Logo */}
      <Link to="/dashboard" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Globe className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
          </div>
        </div>
        <div>
          <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent block">
            Darukaa.Earth
          </span>
          <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Geospatial Carbon Platform
          </span>
        </div>
      </Link>

      {/* Global Quick Stats Pills */}
      <div className="hidden md:flex items-center gap-4 bg-slate-950/80 border border-slate-800 px-4 py-1.5 rounded-full">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            <strong className="text-white">{totalProjects}</strong> Projects Active
          </span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            <strong className="text-white">{totalSites}</strong> Sites Mapped
          </span>
        </div>
      </div>

      {/* User Controls */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-xs font-semibold text-slate-200">{user.full_name}</span>
                <span className="block text-[10px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" /> Administrator
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn-primary text-xs">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
