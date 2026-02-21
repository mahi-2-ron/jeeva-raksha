import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import api from '../apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Search, Plus, ArrowLeft, Edit2, Trash2, ChevronRight,
  Loader2, User, Calendar, Phone, Mail, MapPin,
  FileText, Activity, AlertCircle, CheckCircle2, XCircle,
  Stethoscope, Bed, Upload, ArrowRight, Lock, Filter
} from 'lucide-react';

const Patients: React.FC = () => {
  const { showToast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '', date_of_birth: '', gender: '', blood_group: '',
    phone: '', email: '', address: '', city: '', state: '', pincode: ''
  });
  const [saving, setSaving] = useState(false);
  const { user, canPerformAction } = useAuth();
  const isAdmin = canPerformAction('PATIENTS', 'ADMIN');

  const fetchPatients = async (search?: string) => {
    try {
      setLoading(true);
      const data = await api.getPatients(search);
      setPatients(data);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch patients:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPatients(searchQuery || undefined);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.date_of_birth || !newPatient.gender) return;
    setSaving(true);
    try {
      if ((newPatient as any).id) {
        await api.updatePatient((newPatient as any).id, newPatient);
        showToast('success', 'Patient updated successfully');
      } else {
        await api.createPatient(newPatient);
        showToast('success', 'Patient registered successfully');
      }
      setShowRegisterForm(false);
      setNewPatient({ name: '', date_of_birth: '', gender: '', blood_group: '', phone: '', email: '', address: '', city: '', state: '', pincode: '' });
      fetchPatients();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditPatient = (patient: any) => {
    setNewPatient({ ...patient });
    setShowRegisterForm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success border-success/20';
      case 'inactive': return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'deceased': return 'bg-danger/10 text-danger border-danger/20';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const calcAge = (dob: string) => {
    if (!dob) return 0;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / 31557600000);
  };

  // Patient Detail View - Mobile Optimized
  if (selectedPatient) {
    return (
      <div className="animate-in slide-in-from-right duration-500 space-y-6 max-w-[1200px] mx-auto p-4 md:p-8 pb-32">
        <button
          onClick={() => setSelectedPatient(null)}
          className="flex items-center gap-3 text-slate-500 hover:text-primary transition-all font-black text-[10px] uppercase tracking-[0.2em] bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 active:scale-95"
        >
          <ArrowLeft size={16} />
          <span>Clinical Index</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Identity Card */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-primary text-4xl font-black mx-auto mb-6 border border-primary/10 shadow-inner">
                {selectedPatient.name?.charAt(0)}
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{selectedPatient.name}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">UHID: {selectedPatient.uhid}</p>

              <div className="grid grid-cols-2 gap-4 mt-10">
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-left">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Demographics</p>
                  <p className="text-sm font-black text-slate-700">{calcAge(selectedPatient.date_of_birth)}y • {selectedPatient.gender}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-left">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Blood Type</p>
                  <p className="text-sm font-black text-danger">{selectedPatient.blood_group || 'O+'}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary text-white rounded-3xl shadow-xl shadow-primary/20 flex justify-between items-center group">
                <div className="text-left">
                  <p className="text-[8px] font-black opacity-60 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-[10px] font-black uppercase tracking-widest">{selectedPatient.status}</p>
                </div>
                <button
                  onClick={() => isAdmin && handleEditPatient(selectedPatient)}
                  className="p-3 bg-white/20 rounded-2xl hover:bg-white/30 transition-all active:scale-90"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-lg space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                <Activity size={16} className="text-primary" /> Medical Markers
              </h3>
              <div className="space-y-4">
                <div className="p-5 bg-danger/5 border border-danger/10 rounded-3xl">
                  <p className="text-[10px] font-black text-danger uppercase tracking-widest mb-3">Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {['Lactose', 'Penicillin'].map(a => (
                      <span key={a} className="bg-white px-3 py-1.5 rounded-xl text-[10px] font-bold text-danger border border-danger/20 shadow-sm">{a}</span>
                    ))}
                  </div>
                </div>
                <div className="p-5 bg-orange-50 border border-orange-100 rounded-3xl">
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3">Chronic Observations</p>
                  <div className="flex flex-wrap gap-2">
                    {['Asthma'].map(c => (
                      <span key={c} className="bg-white px-3 py-1.5 rounded-xl text-[10px] font-bold text-orange-600 border border-orange-100 shadow-sm">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline - Main content */}
          <div className="md:col-span-8 space-y-8">
            <div className="bg-white p-8 md:p-12 rounded-[4rem] border border-slate-100 shadow-xl min-h-[500px]">
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                  <FileText size={28} className="text-primary" /> Longitudinal History
                </h3>
              </div>

              <div className="relative space-y-12 before:absolute before:inset-0 before:left-6 md:before:left-8 before:w-1 before:bg-slate-50 before:h-full">
                {[1, 2].map((visit, i) => (
                  <div key={i} className="relative pl-16 md:pl-20">
                    <div className="absolute left-4 md:left-6 w-5 h-5 rounded-full bg-white border-4 border-primary mt-1.5 shadow-xl z-10 transition-transform group-hover:scale-125"></div>
                    <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:border-primary/20 transition-all group cursor-pointer active:scale-[0.98]">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div>
                          <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-2">{i === 0 ? 'OPD' : 'Inpatient'} Consultation</p>
                          <h4 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors">Post-Operative Routine Recovery</h4>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
                          <Calendar size={14} /> 23 Feb 2026
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-6">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-[10px]">AS</div>
                        <p className="text-xs font-bold text-slate-500">Dr. Aditi Sharma • <span className="text-slate-900 font-black uppercase text-[10px]">Attending</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Record Actions */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: <Activity />, label: 'Order Labs', color: 'bg-indigo-50 text-indigo-600' },
                { icon: <Bed />, label: 'Admit Patient', color: 'bg-emerald-50 text-emerald-600' },
                { icon: <Upload />, label: 'Vault Upload', color: 'bg-slate-50 text-slate-600' }
              ].map(action => (
                <button key={action.label} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center">
                  <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.1em]">{action.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form - Responsive
  if (showRegisterForm) {
    return (
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto p-4 md:p-8 pb-32">
        <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {(newPatient as any).id ? 'Record Update' : 'Identity Creation'}
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Unified Health Profile</p>
          </div>
          <button onClick={() => setShowRegisterForm(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-danger active:scale-95 transition-all">
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleRegister} className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Legal Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all" required placeholder="Ex. Vikram Mehta" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Birth Date</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                <input type="date" value={newPatient.date_of_birth} onChange={e => setNewPatient({ ...newPatient, date_of_birth: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all" required />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gender Identity</label>
              <select value={newPatient.gender} onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold focus:ring-4 focus:ring-primary/10 text-slate-900 outline-none transition-all cursor-pointer">
                <option value="">Select Option</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Phone</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input value={newPatient.phone} onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold outline-none transition-all" placeholder="+91 00000 00000" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-primary text-white font-black py-5 rounded-[2rem] mt-6 hover:bg-teal-800 shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-sm uppercase tracking-widest">
            {saving ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
            {saving ? 'Processing...' : ((newPatient as any).id ? 'Commit Update' : 'Finalize Identity')}
          </button>
        </form>
      </div>
    );
  }

  // Master Patient List - Mobile First Cards / Desktop Table
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2"></div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Identity Central</h2>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-2">
            Clinical Master Patient Index (MPI)
          </p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative flex-1 md:w-80">
            <input
              type="text"
              placeholder="Filter by Name or UHID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all shadow-inner"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          </div>
          <button
            onClick={() => isAdmin && setShowRegisterForm(true)}
            disabled={!isAdmin}
            className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/40 hover:bg-teal-800 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Plus size={18} />
            Add Patient
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
          <AlertCircle size={18} className="text-amber-500" />
          Offline Demo • {error}
        </div>
      )}

      {/* Grid of Cards on Mobile, Table on Desktop */}
      <div className="grid grid-cols-1 md:hidden gap-4">
        {loading ? (
          <div className="py-20 text-center col-span-1">
            <Loader2 size={32} className="animate-spin text-primary/30 mx-auto" />
          </div>
        ) : patients.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm active:scale-95 transition-all flex flex-col gap-5" onClick={() => setSelectedPatient(p)}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary font-black shadow-inner">
                  {p.name?.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">{p.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{p.uhid}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center py-4 border-y border-slate-50">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">A/G</p>
                <p className="text-xs font-black text-slate-700">{calcAge(p.date_of_birth)}y • {p.gender}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Status</p>
                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg ${getStatusColor(p.status)}`}>{p.status}</span>
              </div>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-500">{p.phone || 'No Contact'}</p>
              <ChevronRight size={18} className="text-primary" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table - Hidden on Mobile */}
      <div className="hidden md:block bg-white rounded-[4rem] border border-slate-100 shadow-xl overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 border-b border-slate-100">
                <th className="px-10 py-8">Clinical Identity</th>
                <th className="px-10 py-8">Profile Details</th>
                <th className="px-10 py-8">Status Flags</th>
                <th className="px-10 py-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-32 text-center">
                    <Loader2 size={40} className="animate-spin text-primary/20 mx-auto" />
                  </td>
                </tr>
              ) : patients.length > 0 ? patients.map(p => (
                <tr key={p.id} className="group hover:bg-primary/5 transition-all cursor-pointer" onClick={() => setSelectedPatient(p)}>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary text-xl font-black shadow-sm group-hover:bg-primary group-hover:text-white transition-all border border-slate-100">
                        {p.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 group-hover:text-primary transition-colors">{p.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{p.uhid}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm font-black text-slate-700">{calcAge(p.date_of_birth)}y • {p.gender}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{p.phone || 'No Contact'}</p>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border tracking-widest ${getStatusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); if (isAdmin) handleEditPatient(p); }}
                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary hover:border-primary/40 shadow-sm transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedPatient(p); }}
                        className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-110 transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-32 text-center text-slate-300 font-black uppercase text-xs tracking-widest">Index Empty</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Patients;
