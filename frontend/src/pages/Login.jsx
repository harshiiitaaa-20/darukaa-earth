import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Globe, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@darukaa.earth');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid credentials. Please verify email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090e17] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Glow Ambient Lighting Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-xl shadow-emerald-500/20">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">
              Darukaa.Earth
            </h1>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">
              Geospatial Carbon Platform
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="glass-card p-8 space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="font-display font-bold text-xl text-white">Administrator Sign In</h2>
            <p className="text-xs text-slate-400">
              Enter your credentials to access spatial project controls.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-emerald-400 absolute left-3 z-10 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input pl-10"
                  placeholder="admin@darukaa.earth"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-emerald-400 absolute left-3 z-10 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center text-sm py-2.5 shadow-lg shadow-emerald-500/20"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Info */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Demo Admin Credentials</span>
            </div>
            <div className="text-[11px] text-slate-300 font-mono">
              Email: admin@darukaa.earth <br />
              Password: Admin123!
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold">
              Register Administrator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
