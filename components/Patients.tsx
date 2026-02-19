
import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import api from '../apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Search, Plus, ArrowLeft, Edit2, Trash2, ChevronRight,
  Loader2, User, Calendar, Phone, Mail, MapPin,
  FileText, Activity, AlertCircle, CheckCircle2, XCircle,
  Stethoscope, Bed, Upload, ArrowRight
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

  // Fetch patients from DB
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

  // Debounced search
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
      fetchPatients(); // Refresh list
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
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / 31557600000);
  };

  // Patient detail view
  if (selectedPatient) {
    return (
      <div className="animate-in slide-in-from-right duration-500 space-y-6 max-w-[1600px] mx-auto p-6">
        <button
          onClick={() => setSelectedPatient(null)}
          className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={14} />
          <span>Back to Patient List</span>
        </button>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-hospital-card p-6 rounded-2xl border border-hospital-border shadow-card text-center">
              <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center text-primary text-3xl font-black mx-auto mb-4 border border-primary/10">
                {selectedPatient.name?.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-text-main">{selectedPatient.name}</h2>
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">{selectedPatient.uhid}</p>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-hospital-bg p-3 rounded-xl border border-hospital-border text-left">
                  <p className="text-[9px] font-bold text-text-muted uppercase mb-1">Age / Gender</p>
                  <p className="text-sm font-bold text-text-main">{calcAge(selectedPatient.date_of_birth)}y • {selectedPatient.gender}</p>
                </div>
                <div className="bg-hospital-bg p-3 rounded-xl border border-hospital-border text-left">
                  <p className="text-[9px] font-bold text-text-muted uppercase mb-1">Blood Group</p>
                  <p className="text-sm font-bold text-danger">{selectedPatient.blood_group || '—'}</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-xl flex justify-between items-center">
                <span className="text-[10px] font-bold text-primary uppercase">Status</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${getStatusColor(selectedPatient.status)}`}>
                    {selectedPatient.status}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        handleEditPatient(selectedPatient);
                        setSelectedPatient(null);
                      }}
                      className="p-1.5 text-text-muted hover:text-primary transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-hospital-card p-6 rounded-2xl border border-hospital-border shadow-card space-y-4">
              <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                <Activity size={12} /> Clinical Snapshot
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-danger/5 border border-danger/10 rounded-xl">
                  <p className="text-[9px] font-bold text-danger uppercase mb-2">Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.allergies?.length ? selectedPatient.allergies.map((a: string) => (
                      <span key={a} className="bg-white px-2 py-1 rounded-md text-[10px] font-bold text-danger border border-danger/20">{a}</span>
                    )) : <span className="text-[10px] text-text-muted italic">No known allergies</span>}
                  </div>
                </div>
                <div className="p-3 bg-warning/5 border border-warning/10 rounded-xl">
                  <p className="text-[9px] font-bold text-warning uppercase mb-2">Chronic Conditions</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.chronic_conditions?.length ? selectedPatient.chronic_conditions.map((c: string) => (
                      <span key={c} className="bg-white px-2 py-1 rounded-md text-[10px] font-bold text-warning border border-warning/20">{c}</span>
                    )) : <span className="text-[10px] text-text-muted italic">No recorded conditions</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="bg-hospital-card p-8 rounded-2xl border border-hospital-border shadow-card min-h-[400px]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-text-main tracking-tight flex items-center gap-2">
                  <FileText size={20} className="text-primary" /> EMR Timeline
                </h3>
                <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">View Full History</button>
              </div>

              <div className="relative space-y-6 before:absolute before:inset-0 before:left-4 before:w-px before:bg-hospital-border before:h-full">
                {selectedPatient.history?.length ? selectedPatient.history.map((h: any, i: number) => (
                  <div key={i} className="relative pl-10 flex gap-4">
                    <div className="absolute left-2.5 w-3 h-3 rounded-full bg-white border-2 border-primary mt-1.5 shadow-sm z-10"></div>
                    <div className="flex-1 p-4 bg-hospital-bg rounded-xl border border-hospital-border hover:bg-white hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-0.5">{h.type} Visit</p>
                          <h4 className="text-sm font-bold text-text-main">{h.reason || 'Routine Checkup'}</h4>
                        </div>
                        <span className="text-[10px] font-medium text-text-muted flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(h.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-text-body font-medium flex items-center gap-1.5 mt-2">
                        <User size={12} className="text-text-muted" />
                        Attending: <span className="text-text-main font-bold">{h.doctor}</span>
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 text-text-muted text-sm flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-hospital-bg rounded-full flex items-center justify-center">
                      <FileText size={24} className="opacity-20" />
                    </div>
                    No visit history yet
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button className="bg-hospital-card p-5 rounded-xl border border-hospital-border shadow-sm hover:shadow-card-hover hover:-translate-y-0.5 transition-all group text-left">
                <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-all">
                  <Activity size={20} />
                </div>
                <p className="text-[10px] font-bold text-text-main uppercase tracking-widest">Order Lab/Rad</p>
              </button>
              <button className="bg-hospital-card p-5 rounded-xl border border-hospital-border shadow-sm hover:shadow-card-hover hover:-translate-y-0.5 transition-all group text-left">
                <div className="w-10 h-10 bg-success/5 rounded-lg flex items-center justify-center text-success mb-3 group-hover:bg-success group-hover:text-white transition-all">
                  <Bed size={20} />
                </div>
                <p className="text-[10px] font-bold text-text-main uppercase tracking-widest">Admit / Transfer</p>
              </button>
              <button className="bg-hospital-card p-5 rounded-xl border border-hospital-border shadow-sm hover:shadow-card-hover hover:-translate-y-0.5 transition-all group text-left">
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-text-muted mb-3 group-hover:bg-text-main group-hover:text-white transition-all">
                  <Upload size={20} />
                </div>
                <p className="text-[10px] font-bold text-text-main uppercase tracking-widest">Upload Docs</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form
  if (showRegisterForm) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-text-main tracking-tight">
              {(newPatient as any).id ? 'Edit Patient Record' : 'Register New Patient'}
            </h2>
            <p className="text-sm font-medium text-text-muted">
              {(newPatient as any).id ? 'Update patient details.' : 'Enter patient details to create a new record.'}
            </p>
          </div>
          <button onClick={() => setShowRegisterForm(false)} className="px-5 py-2.5 bg-white border border-hospital-border text-text-body rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-hospital-bg transition-colors">
            Cancel
          </button>
        </div>

        <form onSubmit={handleRegister} className="bg-hospital-card p-8 rounded-2xl border border-hospital-border shadow-card space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Full Name *</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-3.5 text-text-muted" />
                <input value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full bg-hospital-input border border-hospital-border rounded-xl pl-10 pr-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" required placeholder="Ex. Rajesh Kumar" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Date of Birth *</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-3.5 text-text-muted" />
                <input type="date" value={newPatient.date_of_birth} onChange={e => setNewPatient({ ...newPatient, date_of_birth: e.target.value })}
                  className="w-full bg-hospital-input border border-hospital-border rounded-xl pl-10 pr-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" required />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Gender *</label>
              <select value={newPatient.gender} onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}
                className="w-full bg-hospital-input border border-hospital-border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Blood Group</label>
              <div className="relative">
                <Activity size={16} className="absolute left-4 top-3.5 text-text-muted" />
                <input value={newPatient.blood_group} onChange={e => setNewPatient({ ...newPatient, blood_group: e.target.value })}
                  className="w-full bg-hospital-input border border-hospital-border rounded-xl pl-10 pr-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" placeholder="Ex. O+" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Phone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-3.5 text-text-muted" />
                <input value={newPatient.phone} onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="w-full bg-hospital-input border border-hospital-border rounded-xl pl-10 pr-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" placeholder="10-digit mobile" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 text-text-muted" />
                <input type="email" value={newPatient.email} onChange={e => setNewPatient({ ...newPatient, email: e.target.value })}
                  className="w-full bg-hospital-input border border-hospital-border rounded-xl pl-10 pr-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" placeholder="patient@example.com" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Address</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-4 top-3.5 text-text-muted" />
              <input value={newPatient.address} onChange={e => setNewPatient({ ...newPatient, address: e.target.value })}
                className="w-full bg-hospital-input border border-hospital-border rounded-xl pl-10 pr-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" placeholder="Full residential address" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">City</label>
              <input value={newPatient.city} onChange={e => setNewPatient({ ...newPatient, city: e.target.value })}
                className="w-full bg-hospital-input border border-hospital-border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">State</label>
              <input value={newPatient.state} onChange={e => setNewPatient({ ...newPatient, state: e.target.value })}
                className="w-full bg-hospital-input border border-hospital-border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Pincode</label>
              <input value={newPatient.pincode} onChange={e => setNewPatient({ ...newPatient, pincode: e.target.value })}
                className="w-full bg-hospital-input border border-hospital-border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" />
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-primary text-white font-bold py-3.5 rounded-xl mt-4 hover:bg-teal-800 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {saving ? 'Saving Record...' : ((newPatient as any).id ? 'Update Patient Record' : 'Register Patient')}
          </button>
        </form>
      </div>
    );
  }

  // Main patient list
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-2xl font-black text-text-main tracking-tight">Master Patient Index</h2>
          <p className="text-sm font-medium text-text-muted mt-1">Search and manage clinical identities across Jeeva Raksha.</p>
        </div>
        <div className="flex w-full md:w-auto gap-4">
          <div className="relative flex-1 md:w-80">
            <input
              type="text"
              placeholder="Search by Name or UHID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-hospital-border rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 shadow-sm transition-all"
            />
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
          {isAdmin && (
            <button onClick={() => setShowRegisterForm(true)}
              className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-teal-800 transition-all flex items-center gap-2">
              <Plus size={14} />
              Register
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-danger/5 border border-danger/10 text-danger p-4 rounded-xl text-sm font-bold flex items-center gap-3">
          <AlertCircle size={18} />
          {error} — Make sure the backend server is running (npm run server)
        </div>
      )}

      <div className="bg-hospital-card rounded-2xl border border-hospital-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] bg-hospital-bg/50 border-b border-hospital-border">
                <th className="px-8 py-5">Patient Identity</th>
                <th className="px-8 py-5">Demographics</th>
                <th className="px-8 py-5">Contact</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hospital-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <Loader2 size={32} className="animate-spin text-primary/30 mx-auto mb-4" />
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Loading patients...</p>
                  </td>
                </tr>
              ) : patients.length > 0 ? patients.map(p => (
                <tr key={p.id} className="group hover:bg-hospital-bg/50 transition-colors cursor-pointer" onClick={() => setSelectedPatient(p)}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-black shadow-sm border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
                        {p.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-main leading-none group-hover:text-primary transition-colors">{p.name}</p>
                        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mt-1.5">{p.uhid}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-semibold text-text-body">{calcAge(p.date_of_birth)}y • {p.gender}</p>
                    <p className="text-[9px] font-black text-danger uppercase mt-1 opacity-80">{p.blood_group || '—'}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-semibold text-text-body">{p.phone || '—'}</p>
                    <p className="text-[9px] text-text-muted mt-1">{p.city || ''}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 text-text-muted">
                      {isAdmin && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPatient(p);
                            }}
                            className="p-2 bg-white border border-hospital-border rounded-lg hover:text-primary hover:border-primary/30 transition-all"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Are you sure you want to delete ${p.name}? This will be logged.`)) {
                                api.deletePatient(p.id).then(() => fetchPatients());
                              }
                            }}
                            className="p-2 bg-white border border-hospital-border rounded-lg hover:text-danger hover:border-danger/30 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      <button className="p-2 bg-white border border-hospital-border rounded-lg hover:text-primary hover:border-primary/30 transition-all group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="w-16 h-16 bg-hospital-bg rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={32} className="text-text-muted opacity-50" />
                    </div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest">No matching patients found</p>
                    <p className="text-[10px] text-text-muted mt-1">Try searching by name or UHID</p>
                  </td>
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
