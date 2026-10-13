import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Edit2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { api } from '../api/client';

export default function ManageWasteDataView({ bins = [], onRefreshBins, onSelectTwinBin, setActiveView }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingBin, setEditingBin] = useState(null);
  const [formData, setFormData] = useState({
    bin_code: '',
    name: '',
    location_name: '',
    latitude: 12.9716,
    longitude: 77.5946,
    zone: 'Academic',
    waste_type: 'Mixed',
    capacity_liters: 120,
    fill_rate_per_hour: 3.0,
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const zones = ['ALL', 'Academic', 'Cafeteria', 'Hostel', 'Research Park', 'Sports Arena', 'Admin Block'];
  const wasteTypes = ['ALL', 'Mixed', 'Organic', 'Plastic', 'Paper', 'E-Waste', 'Glass & Metal'];

  const filtered = bins.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bin_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.location_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = selectedZone === 'ALL' || b.zone === selectedZone;
    const matchesType = selectedType === 'ALL' || b.waste_type === selectedType;
    return matchesSearch && matchesZone && matchesType;
  });

  const handleOpenCreate = () => {
    setEditingBin(null);
    setFormData({
      bin_code: `BIN-CAMPUS-0${bins.length + 1}`,
      name: '',
      location_name: '',
      latitude: 12.9720,
      longitude: 77.5950,
      zone: 'Academic',
      waste_type: 'Mixed',
      capacity_liters: 120,
      fill_rate_per_hour: 3.0,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBin(b);
    setFormData({
      bin_code: b.bin_code,
      name: b.name,
      location_name: b.location_name,
      latitude: b.latitude,
      longitude: b.longitude,
      zone: b.zone,
      waste_type: b.waste_type,
      capacity_liters: b.capacity_liters,
      fill_rate_per_hour: b.fill_rate_per_hour,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingBin) {
        await api.updateBin(editingBin.id, formData);
      } else {
        await api.createBin(formData);
      }
      setShowModal(false);
      if (onRefreshBins) onRefreshBins();
    } catch (err) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this smart bin container?')) return;
    try {
      await api.deleteBin(id);
      if (onRefreshBins) onRefreshBins();
    } catch (err) {
      alert(err.message || 'Failed to delete bin');
    }
  };

  const handleEmpty = async (id) => {
    try {
      await api.emptyBin(id);
      if (onRefreshBins) onRefreshBins();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-navy-850 rounded-2xl p-5 border border-navy-750 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Campus Smart Bin Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure IoT telemetry nodes, waste categorization streams, capacity thresholds, and geolocation.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-glow-green transition-all flex items-center space-x-1.5 active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Smart Bin</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-navy-850 rounded-2xl p-4 border border-navy-750 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, code, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-navy-900 border border-navy-750 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-navy-900 border border-navy-750 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            {zones.map((z) => (
              <option key={z} value={z}>Zone: {z}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-navy-900 border border-navy-750 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            {wasteTypes.map((t) => (
              <option key={t} value={t}>Type: {t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bin Grid / Table */}
      <div className="bg-navy-850 rounded-2xl p-5 border border-navy-750">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-750 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Node Code</th>
                <th className="pb-3 font-semibold">Name & Location</th>
                <th className="pb-3 font-semibold">Zone</th>
                <th className="pb-3 font-semibold">Stream</th>
                <th className="pb-3 font-semibold">Capacity</th>
                <th className="pb-3 font-semibold">Current Fill</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800 text-slate-200">
              {filtered.map((bin) => (
                <tr key={bin.id} className="hover:bg-navy-800/40 transition-colors">
                  <td className="py-3.5 font-mono font-bold text-cyan-400">{bin.bin_code}</td>
                  <td className="py-3.5">
                    <p className="font-semibold text-white">{bin.name}</p>
                    <p className="text-[11px] text-slate-400">{bin.location_name}</p>
                  </td>
                  <td className="py-3.5 text-slate-300">{bin.zone}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-navy-900 text-cyan-300 border border-navy-700 text-[10px] font-semibold">
                      {bin.waste_type}
                    </span>
                  </td>
                  <td className="py-3.5 font-mono text-slate-300">{bin.capacity_liters} L</td>
                  <td className="py-3.5 min-w-[130px]">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-navy-950 h-2 rounded-full overflow-hidden border border-navy-700">
                        <div
                          className={`h-full rounded-full ${
                            bin.fill_level >= 90
                              ? 'bg-rose-500'
                              : bin.fill_level >= 70
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${bin.fill_level}%` }}
                        />
                      </div>
                      <span className="font-bold text-xs font-mono">{Math.round(bin.fill_level)}%</span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      bin.status === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : bin.status === 'WARNING'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {bin.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right space-x-1.5">
                    <button
                      onClick={() => handleEmpty(bin.id)}
                      className="text-xs font-semibold text-slate-300 hover:text-emerald-400 bg-navy-900 px-2.5 py-1 rounded-lg border border-navy-700 hover:border-emerald-600 transition-colors"
                      title="Simulate truck emptying"
                    >
                      Empty
                    </button>
                    <button
                      onClick={() => {
                        if (onSelectTwinBin) onSelectTwinBin(bin);
                        setActiveView('digital-twin');
                      }}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-navy-900 px-2.5 py-1 rounded-lg border border-navy-700 hover:border-cyan-600 transition-colors"
                    >
                      Twin
                    </button>
                    <button
                      onClick={() => handleOpenEdit(bin)}
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300 bg-navy-900 px-2 py-1 rounded-lg border border-navy-700 hover:border-purple-600 transition-colors"
                      title="Edit specifications"
                    >
                      <Edit2 className="w-3.5 h-3.5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(bin.id)}
                      className="text-xs font-semibold text-rose-400 hover:text-rose-300 bg-navy-900 px-2 py-1 rounded-lg border border-navy-700 hover:border-rose-600 transition-colors"
                      title="Delete container node"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog: Add / Edit Bin */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              {editingBin ? 'Edit Smart Bin Specifications' : 'Deploy New IoT Smart Bin'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter hardware parameters and campus coordinates.
            </p>

            {formError && (
              <div className="bg-rose-950/70 border border-rose-800 text-rose-300 text-xs p-3 rounded-xl mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Bin Identifier Code</label>
                  <input
                    type="text"
                    required
                    value={formData.bin_code}
                    onChange={(e) => setFormData({ ...formData, bin_code: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white font-mono"
                    placeholder="BIN-CAMPUS-XX"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white"
                    placeholder="e.g. Science Quad"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Detailed Location</label>
                <input
                  type="text"
                  required
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white"
                  placeholder="e.g. Near Physics Lab North Door"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Campus Zone</label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white"
                  >
                    {zones.filter((z) => z !== 'ALL').map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Waste Stream Type</label>
                  <select
                    value={formData.waste_type}
                    onChange={(e) => setFormData({ ...formData, waste_type: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white"
                  >
                    {wasteTypes.filter((t) => t !== 'ALL').map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Capacity (Liters)</label>
                  <input
                    type="number"
                    value={formData.capacity_liters}
                    onChange={(e) => setFormData({ ...formData, capacity_liters: Number(e.target.value) })}
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Fill Rate (%/hr)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.fill_rate_per_hour}
                    onChange={(e) => setFormData({ ...formData, fill_rate_per_hour: Number(e.target.value) })}
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-navy-800 hover:bg-navy-750 text-slate-300 font-semibold py-2 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2 rounded-xl shadow-glow-green transition-all"
                >
                  {isSubmitting ? 'Saving...' : editingBin ? 'Update Node' : 'Deploy Bin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
