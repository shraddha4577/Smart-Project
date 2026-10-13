import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  PieChart as PieIcon,
  TrendingUp,
  Award,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { api } from '../api/client';

export default function ReportsAnalyticsView({ bins = [], stats }) {
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [cats, trends] = await Promise.all([
        api.getCategoryBreakdown(),
        api.getHourlyTrends(),
      ]);
      setCategoryData(cats);
      setTrendData(trends);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

  // Zone comparisons calculated from live bins
  const zoneStats = bins.reduce((acc, b) => {
    acc[b.zone] = acc[b.zone] || { zone: b.zone, totalFill: 0, count: 0 };
    acc[b.zone].totalFill += b.fill_level;
    acc[b.zone].count += 1;
    return acc;
  }, {});

  const zoneChartData = Object.values(zoneStats).map((z) => ({
    zone: z.zone,
    avgFill: Math.round(z.totalFill / z.count),
  }));

  const handleDownloadCsv = () => {
    window.open('http://127.0.0.1:8000/api/reports/export-csv', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & CSV Export */}
      <div className="bg-navy-850 rounded-2xl p-5 border border-navy-750 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Campus Waste Analytics & Sustainability Audit
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical generation velocity, material stream breakdown, and automated capstone audit reporting.
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-glow-cyan transition-all flex items-center space-x-2 active:scale-95 self-start md:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export CSV Telemetry Report</span>
        </button>
      </div>

      {/* KPI Performance Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Sustainability Score</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">88 / 100</p>
          <span className="text-[10px] text-slate-400">Green Campus Benchmark (A+)</span>
        </div>

        <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Recyclables Diverted</span>
          <p className="text-2xl font-extrabold text-cyan-400 mt-1">68.4%</p>
          <span className="text-[10px] text-slate-400">Plastics, Paper & Metal segregated</span>
        </div>

        <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Organic Compost Created</span>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">142 kg</p>
          <span className="text-[10px] text-slate-400">Converted for campus landscaping</span>
        </div>

        <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Fleet Fuel Conserved</span>
          <p className="text-2xl font-extrabold text-purple-400 mt-1">38.2%</p>
          <span className="text-[10px] text-slate-400">Via TSP selective collection routes</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 24-Hour Campus Waste Accumulation Trend */}
        <div className="lg:col-span-8 bg-navy-850 rounded-2xl p-5 border border-navy-750 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Diurnal Waste Accumulation Dynamics (24-Hour Curve)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Correlating peak student footfall with fill rate acceleration across key campus hubs.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="orgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="plasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2e52" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0e1628',
                    borderColor: '#1f2e52',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="organic_fill" name="Organic Waste (%)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#orgGrad)" />
                <Area type="monotone" dataKey="plastic_fill" name="Plastic Load (%)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#plasGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Waste Stream Category Breakdown (Donut Chart) */}
        <div className="lg:col-span-4 bg-navy-850 rounded-2xl p-5 border border-navy-750 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-purple-400" />
              <span>Waste Stream Composition</span>
            </h3>
            <p className="text-xs text-slate-400">Distribution by weight diverted.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="weight_kg"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0e1628',
                    borderColor: '#1f2e52',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {categoryData.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-300">{c.name}</span>
                </div>
                <span className="font-mono font-bold text-white">{c.weight_kg} kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zone-by-Zone Fill Comparison Bar Chart */}
      <div className="bg-navy-850 rounded-2xl p-5 border border-navy-750 space-y-4">
        <div>
          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-yellow-400" />
            <span>Campus Zone Load Comparison (Average Capacity Utilization)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Identifying geographic zones with chronic fill pressure to plan bin capacity upgrades.
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={zoneChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2e52" />
              <XAxis dataKey="zone" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0e1628',
                  borderColor: '#1f2e52',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="avgFill" name="Average Fill (%)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
