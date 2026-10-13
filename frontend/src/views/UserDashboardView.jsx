import React, { useState } from 'react';
import {
  MapPin,
  ScanLine,
  AlertTriangle,
  Award,
  Sparkles,
  BookOpen,
  Send,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Cpu,
  Trash2
} from 'lucide-react';
import CampusMap from '../components/CampusMap';
import { api } from '../api/client';

export default function UserDashboardView({ bins = [], currentUser, setActiveView, onSelectTwinBin }) {
  const [reportBinId, setReportBinId] = useState(bins[0]?.id || 1);
  const [reportNotes, setReportNotes] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleReportOverflow = async (e) => {
    e.preventDefault();
    if (!reportNotes.trim()) return;
    setIsSubmittingReport(true);
    try {
      await api.createAlert({
        bin_id: Number(reportBinId),
        severity: 'HIGH',
        notes: `Student Report (${currentUser?.full_name}): ${reportNotes}`,
      });
      setReportSuccess(true);
      setReportNotes('');
      setTimeout(() => setReportSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const leaderboard = [
    { rank: 1, name: 'Computer Science Dept', points: 3420, badge: '🥇 Gold Eco-Champion' },
    { rank: 2, name: 'Mechanical Engineering', points: 2980, badge: '🥈 Silver Steward' },
    { rank: 3, name: 'Biotech & Life Sciences', points: 2650, badge: '🥉 Bronze Recycler' },
    { rank: 4, name: 'Campus Hostel Block 3', points: 2190, badge: 'Active' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-850 via-navy-800 to-navy-850 rounded-2xl p-6 border border-cyan-500/20 shadow-glow-cyan flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Student Sustainability Portal
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Welcome back, {currentUser?.full_name || 'Alex'}!
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Find nearby campus smart bins, verify recyclability with AI, report overflow, and earn green points.
          </p>
        </div>

        <div className="bg-navy-900/80 px-4 py-3 rounded-2xl border border-navy-700 flex items-center space-x-3 self-start md:self-auto">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">My Eco Points</span>
            <span className="text-lg font-black text-emerald-400">450 PTS</span>
          </div>
        </div>
      </div>

      {/* Feature Selector Cards (Prompt: Select Feature) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveView('map-locator')}
          className="bg-navy-850 hover:bg-navy-800 p-5 rounded-2xl border border-navy-750 hover:border-cyan-500/50 text-left transition-all group shadow-sm flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white group-hover:text-cyan-300">Find Smart Bins</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Live map with real-time fill capacity</p>
          </div>
        </button>

        <button
          onClick={() => setActiveView('vision')}
          className="bg-navy-850 hover:bg-navy-800 p-5 rounded-2xl border border-navy-750 hover:border-purple-500/50 text-left transition-all group shadow-sm flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <ScanLine className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white group-hover:text-purple-300">AI Waste Scanner</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Upload waste photo to check recyclability</p>
          </div>
        </button>

        <button
          onClick={() => setActiveView('report-issue')}
          className="bg-navy-850 hover:bg-navy-800 p-5 rounded-2xl border border-navy-750 hover:border-amber-500/50 text-left transition-all group shadow-sm flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white group-hover:text-amber-300">Report Overflow</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Alert cleaning staff with 1-click notification</p>
          </div>
        </button>

        <button
          onClick={() => setActiveView('user-reports')}
          className="bg-navy-850 hover:bg-navy-800 p-5 rounded-2xl border border-navy-750 hover:border-emerald-500/50 text-left transition-all group shadow-sm flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white group-hover:text-emerald-300">Reports & Analytics</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Campus green index & leaderboard</p>
          </div>
        </button>
      </div>

      {/* Campus Map Preview + Quick Report Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map Preview */}
        <div className="lg:col-span-8 bg-navy-850 rounded-2xl p-5 border border-navy-750 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-navy-750">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Nearby Campus Smart Bins</span>
              </h3>
              <p className="text-xs text-slate-400">Green = Empty / Low; Yellow = Moderate; Red = Full</p>
            </div>
            <button
              onClick={() => setActiveView('map-locator')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Expand Full Map →
            </button>
          </div>

          <CampusMap
            bins={bins}
            onSelectTwinBin={onSelectTwinBin}
          />
        </div>

        {/* Right: Quick Report Overflow Form */}
        <div className="lg:col-span-4 bg-navy-850 rounded-2xl p-5 border border-navy-750 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-navy-750">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Report Overflow / Litter</h3>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Spotted a full bin or campus litter? Submit a priority task to the facilities team.
            </p>

            {reportSuccess && (
              <div className="mt-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs p-3 rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Thank you! Facilities dispatch notified (+25 Eco Points awarded).</span>
              </div>
            )}

            <form onSubmit={handleReportOverflow} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Select Campus Bin Location</label>
                <select
                  value={reportBinId}
                  onChange={(e) => setReportBinId(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-750 rounded-xl p-2 text-white"
                >
                  {bins.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.zone}) — {Math.round(b.fill_level)}%
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Description / Observation</label>
                <textarea
                  rows="3"
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="e.g. Lid won't close, plastic containers overflowing onto pavement..."
                  className="w-full bg-navy-900 border border-navy-750 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReport || !reportNotes.trim()}
                className="w-full bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 disabled:opacity-50 text-white font-bold py-2 rounded-xl shadow-glow-yellow transition-all flex items-center justify-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingReport ? 'Submitting...' : 'Submit Priority Alert'}</span>
              </button>
            </form>
          </div>

          {/* Department Leaderboard Snippet */}
          <div className="pt-3 border-t border-navy-750">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Campus Eco Leaderboard
            </span>
            <div className="space-y-1.5 text-xs">
              {leaderboard.slice(0, 3).map((item) => (
                <div key={item.rank} className="flex items-center justify-between text-[11px] bg-navy-900 p-2 rounded-lg">
                  <span className="font-semibold text-slate-200">{item.name}</span>
                  <span className="font-mono font-bold text-cyan-400">{item.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
