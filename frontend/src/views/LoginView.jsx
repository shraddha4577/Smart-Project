import React, { useState } from 'react';
import {
  Cpu,
  Lock,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Boxes,
  Activity,
  Trash2
} from 'lucide-react';
import { api } from '../api/client';

export default function LoginView({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await api.login(username, password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Invalid credentials. Use admin/admin123 or student/user123');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (userType) => {
    const creds = userType === 'admin'
      ? { u: 'admin', p: 'admin123' }
      : { u: 'student', p: 'user123' };

    setUsername(creds.u);
    setPassword(creds.p);
    setIsLoading(true);
    setError('');

    try {
      const user = await api.login(creds.u, creds.p);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background Decorative Glow Circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-navy-900/90 backdrop-blur-xl border border-navy-750 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[2px] shadow-glow-cyan mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
              <Cpu className="w-7 h-7 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 tracking-wider">
            ECOTWIN
          </h1>
          <p className="text-xs text-slate-400">
            Smart Waste Management Digital Twin Platform
          </p>
        </div>

        {/* Quick Demo 1-Click Login Buttons */}
        <div className="bg-navy-850 p-3.5 rounded-2xl border border-navy-700/80 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            Instant College Evaluation Login
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              disabled={isLoading}
              className="bg-navy-900 hover:bg-navy-750 border border-purple-500/40 hover:border-purple-400 text-purple-300 hover:text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-glow-purple flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Admin Login</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('student')}
              disabled={isLoading}
              className="bg-navy-900 hover:bg-navy-750 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-glow-cyan flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <User className="w-4 h-4 text-cyan-400" />
              <span>Student Login</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-500 text-center">
            admin: <code className="text-slate-300">admin123</code> | student: <code className="text-slate-300">user123</code>
          </p>
        </div>

        {error && (
          <div className="bg-rose-950/70 border border-rose-800 text-rose-300 text-xs p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Manual Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1.5">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-navy-950 border border-navy-750 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-navy-950 border border-navy-750 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-glow-cyan transition-all flex items-center justify-center space-x-2 active:scale-95"
          >
            <span>{isLoading ? 'Verifying...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Project Feature Badges */}
        <div className="pt-2 border-t border-navy-800/80 flex flex-wrap justify-center gap-1.5 text-[10px] text-slate-400 font-mono">
          <span className="bg-navy-950 px-2 py-0.5 rounded border border-navy-800">IoT Digital Twin</span>
          <span className="bg-navy-950 px-2 py-0.5 rounded border border-navy-800">OpenCV AI</span>
          <span className="bg-navy-950 px-2 py-0.5 rounded border border-navy-800">TSP Route Optimizer</span>
        </div>
      </div>
    </div>
  );
}
