import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Truck,
  Route,
  Fuel,
  Clock,
  AlertTriangle,
  Lightbulb,
  Send,
  Sparkles,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { api } from '../api/client';

export default function AIRecommendationsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your Campus Sustainability AI Copilot. Ask me anything about waste segregation, route dispatching, or digital twin sensor interpretations.',
      source: 'Campus Heuristic Intelligence',
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.getRecommendations();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsSending(true);

    try {
      const res = await api.chatAssistant(userText);
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: res.response, source: res.source },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Error connecting to AI service.', source: 'System' },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleDispatchRoute = async () => {
    try {
      await api.dispatchAll();
      setDispatchedSuccess(true);
      setTimeout(() => setDispatchedSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-navy-850 rounded-2xl p-5 border border-navy-750 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              AI Operational Recommendations & Dynamic Routing
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Predictive dispatch scheduling, Traveling Salesperson (TSP) route optimization, and generative campus advisory.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-navy-900 border border-yellow-500/30 px-3.5 py-1.5 rounded-full text-xs">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-slate-300 font-semibold">Engine Source:</span>
          <span className="text-yellow-400 font-bold">{data?.source || 'Campus Rules Engine'}</span>
        </div>
      </div>

      {/* Dynamic Route Optimizer Card */}
      <div className="bg-navy-850 rounded-2xl p-6 border border-navy-750 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-navy-750 gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Route className="w-4 h-4 text-cyan-400" />
              <span>Optimized Fleet Collection Route (Greedy TSP Algorithm)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Traversing only bins exceeding warning threshold (≥70%) to minimize empty-trip fuel consumption.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-navy-900 px-3 py-1.5 rounded-xl border border-navy-700 text-xs flex items-center space-x-2">
              <Fuel className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Fuel Saved:</span>
              <span className="font-bold text-emerald-400">{data?.estimated_fuel_saved_percent || 0}%</span>
            </div>

            <button
              onClick={handleDispatchRoute}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-glow-cyan transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Dispatch Collection Fleet</span>
            </button>
          </div>
        </div>

        {dispatchedSuccess && (
          <div className="bg-emerald-950/70 border border-emerald-700 p-3 rounded-xl text-xs text-emerald-300 flex items-center space-x-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Collection route successfully dispatched to campus maintenance drivers!</span>
          </div>
        )}

        {/* Route Stops Sequence */}
        {data?.recommended_route?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.recommended_route.map((stop) => (
              <div
                key={stop.bin_id}
                className="bg-navy-900 p-4 rounded-xl border border-navy-750 relative overflow-hidden flex items-start space-x-3"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                  #{stop.priority}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-100 truncate">{stop.name}</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      stop.fill_level >= 90 ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400'
                    }`}>
                      {Math.round(stop.fill_level)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{stop.location_name}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Lat: {stop.latitude.toFixed(4)}, Lng: {stop.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs">
            No bins currently require urgent collection. All containers operating within normal limits (&lt;70%).
          </div>
        )}
      </div>

      {/* Grid: Time-Critical Advisories & Campus AI Copilot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Advisories & Capacity Planning */}
        <div className="lg:col-span-6 space-y-4">
          {/* Time Critical Warnings */}
          <div className="bg-navy-850 rounded-2xl p-5 border border-navy-750 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-rose-400" />
              <span>Time-Critical Predictive Alerts</span>
            </h3>

            <div className="space-y-2">
              {data?.time_critical_advisories?.length > 0 ? (
                data.time_critical_advisories.map((adv, i) => (
                  <div
                    key={i}
                    className="bg-navy-900/80 p-3 rounded-xl border border-rose-900/40 text-xs text-rose-200 flex items-start space-x-2.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{adv}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 p-3">No overflow risks detected in the next 5 hours.</div>
              )}
            </div>
          </div>

          {/* Long-term Capacity Recommendations */}
          <div className="bg-navy-850 rounded-2xl p-5 border border-navy-750 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span>Strategic Campus Capacity Optimization</span>
            </h3>

            <div className="space-y-2">
              {data?.capacity_optimization_tips?.map((tip, i) => (
                <div
                  key={i}
                  className="bg-navy-900/80 p-3 rounded-xl border border-navy-750 text-xs text-slate-300 flex items-start space-x-2.5"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Interactive AI Sustainability Copilot */}
        <div className="lg:col-span-6 bg-navy-850 rounded-2xl p-5 border border-navy-750 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-navy-750">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-sm text-white">Campus AI Sustainability Copilot</h3>
            </div>
            <span className="text-[10px] text-purple-400 font-mono bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
              Generative / Heuristic Q&A
            </span>
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                      : 'bg-navy-900 border border-navy-750 text-slate-200 rounded-bl-none shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                {msg.source && (
                  <span className="text-[9px] text-slate-500 mt-1 px-1">
                    Source: {msg.source}
                  </span>
                )}
              </div>
            ))}
            {isSending && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-navy-750 flex space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about segregation, digital twin telemetry, or collection routes..."
              className="flex-1 bg-navy-900 border border-navy-750 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isSending || !chatInput.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-glow-purple shrink-0 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
