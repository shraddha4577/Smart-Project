import React, { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  RotateCcw,
  Plus,
  Send,
  Trash2
} from 'lucide-react';
import { api } from '../api/client';

export default function CollectionManagementView({ alerts = [], bins = [], onRefreshData }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [assigningAlertId, setAssigningAlertId] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('Truck #1 (Driver Kumar)');
  const [isProcessing, setIsProcessing] = useState(false);

  const drivers = [
    'Truck #1 (Driver Kumar)',
    'Truck #2 (Driver Sarah)',
    'EV-Van #4 (Driver Alex)',
    'Rapid Response Cart #5 (Driver Maya)',
  ];

  const filteredAlerts = filterStatus === 'ALL'
    ? alerts
    : alerts.filter((a) => a.status === filterStatus);

  const handleAssignDriver = async (alertId) => {
    setIsProcessing(true);
    try {
      await api.updateAlert(alertId, {
        status: 'ASSIGNED',
        driver_name: selectedDriver,
        notes: `Assigned to ${selectedDriver} for priority campus pickup.`,
      });
      setAssigningAlertId(null);
      if (onRefreshData) onRefreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolveAlert = async (alertId) => {
    setIsProcessing(true);
    try {
      await api.updateAlert(alertId, {
        status: 'RESOLVED',
        notes: 'Disposal completed and bin capacity reset to 0%.',
      });
      if (onRefreshData) onRefreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDispatchAll = async () => {
    setIsProcessing(true);
    try {
      await api.dispatchAll();
      if (onRefreshData) onRefreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-navy-850 rounded-2xl p-5 border border-navy-750 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Collection Fleet Operations & Alert Center
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch trucks to overflowing bins, manage driver task assignments, and log emptying events.
          </p>
        </div>

        <button
          onClick={handleDispatchAll}
          disabled={isProcessing}
          className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-glow-red transition-all flex items-center space-x-1.5 active:scale-95 self-start md:self-auto"
        >
          <Truck className="w-4 h-4" />
          <span>Auto-Dispatch All Pending ({alerts.filter((a) => a.status === 'PENDING').length})</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-navy-800 pb-2">
        {['ALL', 'PENDING', 'ASSIGNED', 'RESOLVED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterStatus === st
                ? 'bg-navy-750 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {st} ({st === 'ALL' ? alerts.length : alerts.filter((a) => a.status === st).length})
          </button>
        ))}
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-navy-850 rounded-2xl p-5 border border-navy-750 hover:border-navy-650 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">{alert.bin_name}</h4>
                    <span className="text-[11px] text-cyan-400 font-mono">{alert.bin_code}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    alert.status === 'PENDING'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : alert.status === 'ASSIGNED'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {alert.status}
                  </span>
                </div>

                <div className="mt-3 bg-navy-900 p-3 rounded-xl border border-navy-750 text-xs text-slate-300">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Location:</span>
                    <span className="font-semibold text-slate-200">{alert.location_name}</span>
                  </div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Severity:</span>
                    <span className="font-bold text-rose-400">{alert.severity}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Current Fill:</span>
                    <span className="font-mono font-bold text-white">{alert.fill_level}%</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed line-clamp-2">
                  {alert.notes || 'Automated fill threshold trigger.'}
                </p>
              </div>

              {/* Action / Driver Assignment Footer */}
              <div className="pt-3 border-t border-navy-750 text-xs">
                {assigningAlertId === alert.id ? (
                  <div className="space-y-2">
                    <select
                      value={selectedDriver}
                      onChange={(e) => setSelectedDriver(e.target.value)}
                      className="w-full bg-navy-900 border border-navy-700 text-slate-200 text-xs rounded-xl p-2"
                    >
                      {drivers.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAssignDriver(alert.id)}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1.5 rounded-lg"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setAssigningAlertId(null)}
                        className="bg-navy-800 text-slate-300 px-3 py-1.5 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Driver: <strong className="text-slate-200">{alert.driver_name || 'None'}</strong>
                    </span>

                    <div className="flex space-x-2">
                      {alert.status === 'PENDING' && (
                        <button
                          onClick={() => setAssigningAlertId(alert.id)}
                          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-navy-900 border border-cyan-800 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          Assign
                        </button>
                      )}

                      {alert.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-navy-900 border border-emerald-800 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          Mark Emptied
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-slate-500 text-xs">
            No collection alerts found in this filter category.
          </div>
        )}
      </div>
    </div>
  );
}
