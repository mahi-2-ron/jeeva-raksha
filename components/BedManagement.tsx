
import React, { useState, useEffect } from 'react';
import { Bed } from '../types';
import api from '../apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const BedManagement: React.FC = () => {
  const [beds, setBeds] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, canPerformAction } = useAuth();
  const { showToast } = useToast();
  const isAdmin = canPerformAction('BEDS', 'ADMIN');

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [wData, bData] = await Promise.all([api.getWards(), api.getBeds()]);
      setWards(wData);
      setBeds(bData);
    } catch (err: any) {
      showToast('error', `Failed to load bed data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const [activeTab, setActiveTab] = useState<'ALL' | 'ICU' | 'GENERAL' | 'PRIVATE' | 'ISOLATION'>('ALL');
  const [selectedBed, setSelectedBed] = useState<any | null>(null);
  const [showAddWard, setShowAddWard] = useState(false);
  const [showAddBed, setShowAddBed] = useState(false);
  const [newWard, setNewWard] = useState({ name: '', code: '', ward_type: 'General', floor: '', total_capacity: 0 });
  const [newBed, setNewBed] = useState({ ward_id: '', bed_number: '', status: 'Available' });

  const filteredBeds = activeTab === 'ALL'
    ? beds
    : beds.filter(b => (b.ward_type || 'General').toUpperCase() === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-success text-white border-success';
      case 'Occupied': return 'bg-primary text-white border-primary';
      case 'Cleaning': return 'bg-warning text-slate-900 border-warning';
      case 'Maintenance': return 'bg-danger text-white border-danger';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const handleCreateWard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createWard(newWard);
      showToast('success', 'Ward created successfully');
      setShowAddWard(false);
      fetchAll();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleCreateBed = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBed(newBed);
      showToast('success', 'Bed created successfully');
      setShowAddBed(false);
      fetchAll();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleUpdateBedStatus = async (id: string, status: string) => {
    try {
      await api.updateBedStatus(id, status);
      showToast('success', `Bed status updated to ${status}`);
      fetchAll();
      setSelectedBed(prev => prev && prev.id === id ? { ...prev, status } : prev);
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleDeleteBed = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bed?')) return;
    try {
      await api.deleteBed(id);
      showToast('success', 'Bed deleted');
      setSelectedBed(null);
      fetchAll();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-8 pb-20">
      {/* Header & Global Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Bed Matrix Control</h2>
          <p className="text-sm font-medium text-slate-500 font-kannada">“ಹಾಸಿಗೆ ಲಭ್ಯತೆ — ತಕ್ಷಣದ ಆರೈಕೆ” — Real-time capacity command.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
            {(['ALL', 'ICU', 'GENERAL', 'PRIVATE', 'ISOLATION'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button onClick={() => setShowAddWard(true)} className="px-4 py-3 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">+ Ward</button>
              <button onClick={() => setShowAddBed(true)} className="px-4 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">+ Bed</button>
            </div>
          )}
        </div>
      </div>

      {/* Forms Overlay */}
      {(showAddWard || showAddBed) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
            {showAddWard ? (
              <form onSubmit={handleCreateWard} className="space-y-6">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Configure Ward</h3>
                <div className="space-y-4">
                  <input placeholder="Ward Name (e.g. ICU A)" className="w-full bg-hospital-bg p-4 rounded-2xl border-none font-bold text-sm" value={newWard.name} onChange={e => setNewWard({ ...newWard, name: e.target.value })} required />
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Code (ICUA)" className="w-full bg-hospital-bg p-4 rounded-2xl border-none font-bold text-sm" value={newWard.code} onChange={e => setNewWard({ ...newWard, code: e.target.value })} required />
                    <select className="w-full bg-hospital-bg p-4 rounded-2xl border-none font-bold text-sm" value={newWard.ward_type} onChange={e => setNewWard({ ...newWard, ward_type: e.target.value })}>
                      <option value="General">General</option>
                      <option value="ICU">ICU</option>
                      <option value="Private">Private</option>
                      <option value="Isolation">Isolation</option>
                    </select>
                  </div>
                  <input placeholder="Floor" className="w-full bg-hospital-bg p-4 rounded-2xl border-none font-bold text-sm" value={newWard.floor} onChange={e => setNewWard({ ...newWard, floor: e.target.value })} />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddWard(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">Create Ward</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateBed} className="space-y-6">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Deploy Bed</h3>
                <div className="space-y-4">
                  <select className="w-full bg-hospital-bg p-4 rounded-2xl border-none font-bold text-sm" value={newBed.ward_id} onChange={e => setNewBed({ ...newBed, ward_id: e.target.value })} required>
                    <option value="">Select Ward</option>
                    {wards.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
                  </select>
                  <input placeholder="Bed Number (e.g. B-101)" className="w-full bg-hospital-bg p-4 rounded-2xl border-none font-bold text-sm" value={newBed.bed_number} onChange={e => setNewBed({ ...newBed, bed_number: e.target.value })} required />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddBed(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">Create Bed</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Ward Occupancy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {wards.map(ward => {
          const occupancy = ward.total_beds > 0 ? Math.round((ward.occupied_beds / ward.total_beds) * 100) : 0;
          return (
            <div key={ward.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
              <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{ward.name} ({ward.code})</p>
                <div className="w-10 h-10 bg-hospital-bg rounded-xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                  {ward.ward_type === 'ICU' ? '🏥' : ward.ward_type === 'General' ? '🛌' : ward.ward_type === 'Private' ? '💎' : '☣️'}
                </div>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-slate-900">{occupancy}%</span>
                <span className="text-[10px] font-bold text-slate-300 uppercase whitespace-nowrap">
                  {ward.occupied_beds} / {ward.total_beds} Beds
                </span>
              </div>
              <div className="mt-6 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${occupancy > 80 ? 'bg-danger' :
                    occupancy > 50 ? 'bg-warning' : 'bg-success'
                    }`}
                  style={{ width: `${occupancy}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Interactive Grid */}
        <div className="col-span-12 lg:col-span-9">
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm min-h-[600px]">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Ward Floor Map</h3>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-warning"></span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cleaning</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4">
                <span className="text-4xl animate-spin">⏳</span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mapping Facilities...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredBeds.map(bed => (
                  <div
                    key={bed.id}
                    onClick={() => setSelectedBed(bed)}
                    className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer relative group overflow-hidden ${selectedBed?.id === bed.id
                      ? 'border-slate-900 ring-4 ring-slate-100'
                      : 'border-transparent bg-hospital-bg hover:shadow-lg'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{bed.bed_number}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter ${bed.ward_type === 'ICU' ? 'bg-danger/10 text-danger' :
                        bed.ward_type === 'Isolation' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                        {bed.ward_type}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center py-4 space-y-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-transform group-hover:scale-110 ${bed.status === 'Available' ? 'bg-success/10 text-success' :
                        bed.status === 'Occupied' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'
                        }`}>
                        🛌
                      </div>
                      <div className="text-center">
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${bed.status === 'Available' ? 'text-success' :
                          bed.status === 'Occupied' ? 'text-primary' : 'text-warning'
                          }`}>
                          {bed.status}
                        </p>
                        <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                          {bed.current_patient?.patient_name || 'Vacant'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="col-span-12 lg:col-span-3 space-y-8">
          {selectedBed ? (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl animate-in slide-in-from-right-4 duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Management Controls</h3>

              <div className="space-y-8">
                <div className="flex items-center gap-5 pb-8 border-b border-slate-50">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${getStatusColor(selectedBed.status)}`}>
                    {selectedBed.status === 'Available' ? '✨' : selectedBed.status === 'Occupied' ? '👤' : '🧼'}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">Bed {selectedBed.bed_number}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{selectedBed.ward_name} ({selectedBed.ward_type})</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedBed.status === 'Available' && (
                    <button onClick={() => handleUpdateBedStatus(selectedBed.id, 'Cleaning')} className="w-full py-4 bg-warning text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 shadow-lg shadow-warning/20 transition-all active:scale-95">
                      Mark for Cleaning
                    </button>
                  )}
                  {selectedBed.status === 'Cleaning' && (
                    <button onClick={() => handleUpdateBedStatus(selectedBed.id, 'Available')} className="w-full py-4 bg-success text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-success/20 transition-all active:scale-95">
                      Set to Available
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => handleDeleteBed(selectedBed.id)} className="w-full py-4 bg-white border border-danger/20 text-danger rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-danger/5 transition-all active:scale-95">
                      Decommission Bed
                    </button>
                  )}
                </div>

                <div className="pt-8 border-t border-slate-50 space-y-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Patient Records</p>
                    <p className="text-xs font-bold text-slate-900">{selectedBed.current_patient?.patient_name || 'None Assigned'}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{selectedBed.current_patient?.uhid || ''}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center py-24 border-dashed">
              <div className="w-16 h-16 bg-hospital-bg rounded-full flex items-center justify-center text-3xl mb-6 grayscale opacity-30">🛏️</div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selection Required</h4>
              <p className="text-xs text-slate-300 mt-2 font-bold px-4">Select a bed from the ward floor map to access management actions.</p>
            </div>
          )}

          {/* AI Logic Suggestion (Keep mock as it's a feature highlight) */}
          <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <span className="text-2xl group-hover:rotate-12 transition-transform">✨</span>
                <h4 className="text-sm font-black text-white">AI Surge Logic</h4>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed font-kannada">
                “ಹಾಸಿಗೆ ಲಭ್ಯತೆ — ತಕ್ಷಣದ ಆರೈಕೆ”<br />
                Predicted demand for ICU beds will exceed capacity in 4 hours due to high ER volume. Recommend processing discharges.
              </p>
            </div>
          </div>
        </div>
      </div>
      <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
    </div>
  );
};

export default BedManagement;
